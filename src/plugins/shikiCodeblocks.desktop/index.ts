/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./shiki.css";

import { enableStyle } from "@api/Styles";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import previewExampleText from "~fileContent/previewExample.tsx";

import { shiki } from "./api/shiki";
import { createHighlighter } from "./components/Highlighter";
import deviconStyle from "./devicon.css?managed";
import { settings } from "./settings";
import { DeviconSetting } from "./types";
import { clearStyles } from "./utils/createStyle";

export default definePlugin({
    name: "ShikiCodeblocks",
    description: "Brings vscode-style codeblocks into Discord, powered by Shiki",
    authors: [Devs.Vap],
    patches: [
        {
            find: "codeBlock:{react(",
            replacement: {
                match: /codeBlock:\{react\((\i),(\i),(\i)\)\{/,
                replace: "$&return $self.renderHighlighter($1,$2,$3);"
            }
        },
        {
            find: ".PREVIEW_NUM_LINES",
            replacement: {
                match: /(?<=function \i\((\i)\)\{)(?=let\{text:\i,language:)/,
                replace: "return $self.renderHighlighter({lang:$1.language,content:$1.text});"
            }
        }
    ],
    start: async () => {
        if (settings.store.useDevIcon !== DeviconSetting.Disabled)
            enableStyle(deviconStyle);

        await shiki.init(settings.store.customTheme || settings.store.theme);
    },
    stop: () => {
        shiki.destroy();
        clearStyles();
    },
    settingsAboutComponent: ({ tempSettings }) => createHighlighter({
        lang: "tsx",
        content: previewExampleText,
        isPreview: true,
        tempSettings,
    }),
    settings,

    // exports
    shiki,
    createHighlighter,
    renderHighlighter: ({ lang, content }: { lang: string; content: string; }) => {
        return createHighlighter({
            lang: lang?.toLowerCase(),
            content,
            isPreview: false,
        });
    },
});
