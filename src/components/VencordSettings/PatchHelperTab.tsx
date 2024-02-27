/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CheckedTextInput } from "@components/CheckedTextInput";
import { CodeBlock } from "@components/CodeBlock";
import { debounce } from "@utils/debounce";
import { Margins } from "@utils/margins";
import { canonicalizeMatch, canonicalizeReplace } from "@utils/patches";
import { makeCodeblock } from "@utils/text";
import { ReplaceFn } from "@utils/types";
import { search } from "@webpack";
import { Button, Clipboard, Forms, Parser, React, Switch, TextInput } from "@webpack/common";

import { SettingsTab, wrapTab } from "./shared";

// Do not include diff in non dev builds (side effects import)
if (IS_DEV) {
    var differ = require("diff") as typeof import("diff");
}

const findCandidates = debounce(function ({ find, setModule, setError }) {
    const candidates = search(find);
    const keys = Object.keys(candidates);
    const len = keys.length;
    if (len === 0)
        setError("No match. Perhaps that module is lazy loaded?");
    else if (len !== 1)
        setError("Multiple matches. Please refine your filter");
    else
        setModule([keys[0], candidates[keys[0]]]);
});

interface ReplacementComponentProps {
    module: [id: number, factory: Function];
    match: string | RegExp;
    replacement: string | ReplaceFn;
    setReplacementError(error: any): void;
}

function ReplacementComponent({ module, match, replacement, setReplacementError }: ReplacementComponentProps) {
    const [id, fact] = module;
    const [compileResult, setCompileResult] = React.useState<[boolean, string]>();

    const [patchedCode, matchResult, diff] = React.useMemo(() => {
        const src: string = fact.toString().replaceAll("\n", "");
        const canonicalMatch = canonicalizeMatch(match);
        try {
            const canonicalReplace = canonicalizeReplace(replacement, "YourPlugin");
            var patched = src.replace(canonicalMatch, canonicalReplace as string);
            setReplacementError(void 0);
        } catch (e) {
            setReplacementError((e as Error).message);
            return ["", [], []];
        }
        const m = src.match(canonicalMatch);
        return [patched, m, makeDiff(src, patched, m)];
    }, [id, match, replacement]);

    function makeDiff(original: string, patched: string, match: RegExpMatchArray | null) {
        if (!match || original === patched) return null;

        const changeSize = patched.length - original.length;

        // Use 200 surrounding characters of context
        const start = Math.max(0, match.index! - 200);
        const end = Math.min(original.length, match.index! + match[0].length + 200);
        // (changeSize may be negative)
        const endPatched = end + changeSize;

        const context = original.slice(start, end);
        const patchedContext = patched.slice(start, endPatched);

        return differ.diffWordsWithSpace(context, patchedContext);
    }

    function renderMatch() {
        if (!matchResult)
            return <Forms.FormText>Regex doesn't match!</Forms.FormText>;

        const fullMatch = matchResult[0] ? makeCodeblock(matchResult[0], "js") : "";
        const groups = matchResult.length > 1
            ? makeCodeblock(matchResult.slice(1).map((g, i) => `Group ${i + 1}: ${g}`).join("\n"), "yml")
            : "";

        return (
            <>
                <div style={{ userSelect: "text" }}>{Parser.parse(fullMatch)}</div>
                <div style={{ userSelect: "text" }}>{Parser.parse(groups)}</div>
            </>
        );
    }

    function renderDiff() {
        return diff?.map(p => {
            const color = p.added ? "lime" : p.removed ? "red" : "grey";
            return <div style={{ color, userSelect: "text", wordBreak: "break-all", lineBreak: "anywhere" }}>{p.value}</div>;
        });
    }

    return (
        <>
            <Forms.FormTitle>Module {id}</Forms.FormTitle>

            {!!matchResult?.[0]?.length && (
                <>
                    <Forms.FormTitle>Match</Forms.FormTitle>
                    {renderMatch()}
                </>)
            }

            {!!diff?.length && (
                <>
                    <Forms.FormTitle>Diff</Forms.FormTitle>
                    {renderDiff()}
                </>
            )}

            {!!diff?.length && (
                <Button className={Margins.top20} onClick={() => {
                    try {
                        Function(patchedCode.replace(/^function\(/, "function patchedModule("));
                        setCompileResult([true, "Compiled successfully"]);
                    } catch (err) {
                        setCompileResult([false, (err as Error).message]);
                    }
                }}>Compile</Button>
            )}

            {compileResult &&
                <Forms.FormText style={{ color: compileResult[0] ? "var(--text-positive)" : "var(--text-danger)" }}>
                    {compileResult[1]}
                </Forms.FormText>
            }
        </>
    );
}

function ReplacementInput({ replacement, setReplacement, replacementError }) {
    const [isFunc, setIsFunc] = React.useState(false);
    const [error, setError] = React.useState<string>();

    function onChange(v: string) {
        setError(void 0);

        if (isFunc) {
            try {
                const func = (0, eval)(v);
                if (typeof func === "function")
                    setReplacement(() => func);
                else
                    setError("Replacement must be a function");
            } catch (e) {
                setReplacement(v);
                setError((e as Error).message);
            }
        } else {
            setReplacement(v);
        }
    }

    React.useEffect(
        () => void (isFunc ? onChange(replacement) : setError(void 0)),
        [isFunc]
    );

    return (
        <>
            <Forms.FormTitle>replacement</Forms.FormTitle>
            <TextInput
                value={replacement?.toString()}
                onChange={onChange}
                error={error ?? replacementError}
            />
            {!isFunc && (
                <div className="vc-text-selectable">
                    <Forms.FormTitle>Cheat Sheet</Forms.FormTitle>
                    {Object.entries({
                        "\\i": "Special regex escape sequence that matches identifiers (varnames, classnames, etc.)",
                        "$$": "Insert a $",
                        "$&": "Insert the entire match",
                        "$`\u200b": "Insert the substring before the match",
                        "$'": "Insert the substring after the match",
                        "$n": "Insert the nth capturing group ($1, $2...)",
                        "$self": "Insert the plugin instance",
                    }).map(([placeholder, desc]) => (
                        <Forms.FormText key={placeholder}>
                            {Parser.parse("`" + placeholder + "`")}: {desc}
                        </Forms.FormText>
                    ))}
                </div>
            )}

            <Switch
                className={Margins.top8}
                value={isFunc}
                onChange={setIsFunc}
                note="'replacement' will be evaled if this is toggled"
                hideBorder={true}
            >
                Treat as Function
            </Switch>
        </>
    );
}

function PatchHelper() {
    const [find, setFind] = React.useState<string>("");
    const [match, setMatch] = React.useState<string>("");
    const [replacement, setReplacement] = React.useState<string | ReplaceFn>("");

    const [replacementError, setReplacementError] = React.useState<string>();

    const [module, setModule] = React.useState<[number, Function]>();
    const [findError, setFindError] = React.useState<string>();

    const code = React.useMemo(() => {
        return `
{
    find: ${JSON.stringify(find)},
    replacement: {
        match: /${match.replace(/(?<!\\)\//g, "\\/")}/,
        replace: ${typeof replacement === "function" ? replacement.toString() : JSON.stringify(replacement)}
    }
}
        `.trim();
    }, [find, match, replacement]);

    function onFindChange(v: string) {
        setFindError(void 0);
        setFind(v);
        if (v.length) {
            findCandidates({ find: v, setModule, setError: setFindError });
        }
    }

    function onMatchChange(v: string) {
        try {
            new RegExp(v);
            setFindError(void 0);
            setMatch(v);
        } catch (e: any) {
            setFindError((e as Error).message);
        }
    }

    return (
        <SettingsTab title="Patch Helper">
            <Forms.FormTitle>find</Forms.FormTitle>
            <TextInput
                type="text"
                value={find}
                onChange={onFindChange}
                error={findError}
            />

            <Forms.FormTitle>match</Forms.FormTitle>
            <CheckedTextInput
                value={match}
                onChange={onMatchChange}
                validate={v => {
                    try {
                        return (new RegExp(v), true);
                    } catch (e) {
                        return (e as Error).message;
                    }
                }}
            />

            <ReplacementInput
                replacement={replacement}
                setReplacement={setReplacement}
                replacementError={replacementError}
            />

            <Forms.FormDivider />
            {module && (
                <ReplacementComponent
                    module={module}
                    match={new RegExp(match)}
                    replacement={replacement}
                    setReplacementError={setReplacementError}
                />
            )}

            {!!(find && match && replacement) && (
                <>
                    <Forms.FormTitle className={Margins.top20}>Code</Forms.FormTitle>
                    <CodeBlock lang="js" content={code} />
                    <Button onClick={() => Clipboard.copy(code)}>Copy to Clipboard</Button>
                </>
            )}
        </SettingsTab>
    );
}

export default IS_DEV ? wrapTab(PatchHelper, "PatchHelper") : null;
