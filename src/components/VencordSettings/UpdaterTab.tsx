/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { ErrorCard } from "@components/ErrorCard";
import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { relaunch } from "@utils/native";
import { useAwaiter } from "@utils/react";
import { changes, checkForUpdates, getRepo, isNewer, update, updateError, UpdateLogger } from "@utils/updater";
import { Alerts, Button, Card, Forms, Parser, React, Switch, Toasts } from "@webpack/common";

import gitHash from "~git-hash";

import { SettingsTab, wrapTab } from "./shared";

function withDispatcher(dispatcher: React.Dispatch<React.SetStateAction<boolean>>, action: () => any) {
    return async () => {
        dispatcher(true);
        try {
            await action();
        } catch (e: any) {
            UpdateLogger.error("Failed to update", e);
            if (!e) {
                var err = "An unknown error occurred (error is undefined).\nPlease try again.";
            } else if (e.code && e.cmd) {
                const { code, path, cmd, stderr } = e;

                if (code === "ENOENT")
                    var err = `Command \`${path}\` not found.\nPlease install it and try again`;
                else {
                    var err = `An error occurred while running \`${cmd}\`:\n`;
                    err += stderr || `Code \`${code}\`. See the console for more info`;
                }

            } else {
                var err = "An unknown error occurred. See the console for more info.";
            }
            Alerts.show({
                title: "Oops!",
                body: (
                    <ErrorCard>
                        {err.split("\n").map(line => <div>{Parser.parse(line)}</div>)}
                    </ErrorCard>
                )
            });
        }
        finally {
            dispatcher(false);
        }
    };
}

interface CommonProps {
    repo: string;
    repoPending: boolean;
}

function HashLink({ repo, hash, disabled = false }: { repo: string, hash: string, disabled?: boolean; }) {
    return <Link href={`${repo}/commit/${hash}`} disabled={disabled}>
        {hash}
    </Link>;
}

function Changes({ updates, repo, repoPending }: CommonProps & { updates: typeof changes; }) {
    return (
        <Card style={{ padding: "0 0.5em" }}>
            {updates.map(({ hash, author, message }) => (
                <div style={{
                    marginTop: "0.5em",
                    marginBottom: "0.5em"
                }}>
                    <code><HashLink {...{ repo, hash }} disabled={repoPending} /></code>
                    <span style={{
                        marginLeft: "0.5em",
                        color: "var(--text-normal)"
                    }}>{message} - {author}</span>
                </div>
            ))}
        </Card>
    );
}

function Updatable(props: CommonProps) {
    const [updates, setUpdates] = React.useState(changes);
    const [isChecking, setIsChecking] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const isOutdated = (updates?.length ?? 0) > 0;

    return (
        <>
            {!updates && updateError ? (
                <>
                    <Forms.FormText>Failed to check updates. Check the console for more info</Forms.FormText>
                    <ErrorCard style={{ padding: "1em" }}>
                        <p>{updateError.stderr || updateError.stdout || "An unknown error occurred"}</p>
                    </ErrorCard>
                </>
            ) : (
                <Forms.FormText className={Margins.bottom8}>
                    {isOutdated ? (updates.length === 1 ? "There is 1 Update" : `There are ${updates.length} Updates`) : "Up to Date!"}
                </Forms.FormText>
            )}

            {isOutdated && <Changes updates={updates} {...props} />}

            <Flex className={classes(Margins.bottom8, Margins.top8)}>
                {isOutdated && <Button
                    size={Button.Sizes.SMALL}
                    disabled={isUpdating || isChecking}
                    onClick={withDispatcher(setIsUpdating, async () => {
                        if (await update()) {
                            setUpdates([]);
                            await new Promise<void>(r => {
                                Alerts.show({
                                    title: "Update Success!",
                                    body: "Successfully updated. Restart now to apply the changes?",
                                    confirmText: "Restart",
                                    cancelText: "Not now!",
                                    onConfirm() {
                                        relaunch();
                                        r();
                                    },
                                    onCancel: r
                                });
                            });
                        }
                    })}
                >
                    Update Now
                </Button>}
                <Button
                    size={Button.Sizes.SMALL}
                    disabled={isUpdating || isChecking}
                    onClick={withDispatcher(setIsChecking, async () => {
                        const outdated = await checkForUpdates();
                        if (outdated) {
                            setUpdates(changes);
                        } else {
                            setUpdates([]);
                            Toasts.show({
                                message: "No updates found!",
                                id: Toasts.genId(),
                                type: Toasts.Type.MESSAGE,
                                options: {
                                    position: Toasts.Position.BOTTOM
                                }
                            });
                        }
                    })}
                >
                    Check for Updates
                </Button>
            </Flex>
        </>
    );
}

function Newer(props: CommonProps) {
    return (
        <>
            <Forms.FormText className={Margins.bottom8}>
                Your local copy has more recent commits. Please stash or reset them.
            </Forms.FormText>
            <Changes {...props} updates={changes} />
        </>
    );
}

function Updater() {
    const settings = useSettings(["notifyAboutUpdates", "autoUpdate", "autoUpdateNotification"]);

    const [repo, err, repoPending] = useAwaiter(getRepo, { fallbackValue: "Loading..." });

    React.useEffect(() => {
        if (err)
            UpdateLogger.error("Failed to retrieve repo", err);
    }, [err]);

    const commonProps: CommonProps = {
        repo,
        repoPending
    };

    return (
        <SettingsTab title="Reshigged Updater">
            <Forms.FormTitle tag="h5">Updater Settings</Forms.FormTitle>
            <Switch
                value={settings.notifyAboutUpdates}
                onChange={(v: boolean) => settings.notifyAboutUpdates = v}
                note="Shows a notification on startup"
                disabled={settings.autoUpdate}
            >
                Get notified about new updates
            </Switch>
            <Switch
                value={settings.autoUpdateNotification}
                onChange={(v: boolean) => settings.autoUpdateNotification = v}
                note="Shows a notification when Reshigged automatically updates"
                disabled={!settings.autoUpdate}
            >
                Get notified when an automatic update completes
            </Switch>

            <Forms.FormTitle tag="h5">Repo</Forms.FormTitle>

            <Forms.FormText className="vc-text-selectable">
                {repoPending
                    ? repo
                    : err
                        ? "Failed to retrieve - check console"
                        : (
                            <Link href={repo}>
                                {repo.split("/").slice(-2).join("/")}
                            </Link>
                        )
                }
                {" "}(<HashLink hash={gitHash} repo={repo} disabled={repoPending} />)
            </Forms.FormText>

            <Forms.FormDivider className={Margins.top8 + " " + Margins.bottom8} />

            <Forms.FormTitle tag="h5">Updates</Forms.FormTitle>

            {isNewer ? <Newer {...commonProps} /> : <Updatable {...commonProps} />}
        </SettingsTab>
    );
}

export default IS_UPDATER_DISABLED ? null : wrapTab(Updater, "Updater");
