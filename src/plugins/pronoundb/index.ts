/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import PronounsAboutComponent from "./components/PronounsAboutComponent";
import { CompactPronounsChatComponentWrapper, PronounsChatComponentWrapper } from "./components/PronounsChatComponent";
import { useProfilePronouns } from "./pronoundbUtils";
import { settings } from "./settings";

const PRONOUN_TOOLTIP_PATCH = {
    match: /text:(.{0,10}.Messages\.USER_PROFILE_PRONOUNS)(?=,)/,
    replace: '$& + (typeof vcPronounSource !== "undefined" ? ` (${vcPronounSource})` : "")'
};

export default definePlugin({
    name: "PronounDB",
    authors: [Devs.Tyman, Devs.TheKodeToad, Devs.Ven],
    description: "Adds pronouns to user messages using pronoundb",
    patches: [
        // Add next to username (compact mode)
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /("span",{id:\i,className:\i,children:\i}\))/,
                replace: "$1, $self.CompactPronounsChatComponentWrapper(arguments[0])"
            }
        },
        // Patch the chat timestamp element (normal mode)
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /(?<=return\s*\(0,\i\.jsxs?\)\(.+!\i&&)(\(0,\i.jsxs?\)\(.+?\{.+?\}\))/,
                replace: "[$1, $self.PronounsChatComponentWrapper(arguments[0])]"
            }
        },
        // Patch the profile popout username header to use our pronoun hook instead of Discord's pronouns
        {
            find: ".userTagNoNickname",
            replacement: [
                {
                    match: /{user:(\i),[^}]*,pronouns:(\i),[^}]*}=\i;/,
                    replace: "$&let vcPronounSource;[$2,vcPronounSource]=$self.useProfilePronouns($1.id);"
                },
                PRONOUN_TOOLTIP_PATCH
            ]
        },
        // Patch the profile modal username header to use our pronoun hook instead of Discord's pronouns
        {
            find: ".nameTagSmall)",
            replacement: [
                {
                    match: /\.getName\(\i\);(?<=displayProfile.{0,200})/,
                    replace: "$&const [vcPronounce,vcPronounSource]=$self.useProfilePronouns(arguments[0].user.id,true);if(arguments[0].displayProfile&&vcPronounce)arguments[0].displayProfile.pronouns=vcPronounce;"
                },
                PRONOUN_TOOLTIP_PATCH
            ]
        }
    ],

    settings,

    settingsAboutComponent: PronounsAboutComponent,

    // Re-export the components on the plugin object so it is easily accessible in patches
    PronounsChatComponentWrapper,
    CompactPronounsChatComponentWrapper,
    useProfilePronouns
});
