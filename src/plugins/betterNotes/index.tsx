/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";

const UserPopoutSectionCssClasses = findByPropsLazy("section", "lastSection");

export default definePlugin({
    name: "BetterNotesBox",
    description: "Hide notes or disable spellcheck (Configure in settings!!)",
    authors: [Devs.Ven],

    patches: [
        {
            find: "hideNote:",
            all: true,
            // Some modules match the find but the replacement is returned untouched
            noWarn: true,
            predicate: () => Vencord.Settings.plugins.BetterNotesBox.hide,
            replacement: {
                match: /hideNote:.+?(?=([,}].*?\)))/g,
                replace: (m, rest) => {
                    const destructuringMatch = rest.match(/}=.+/);
                    if (destructuringMatch == null) return "hideNote:!0";
                    return m;
                }
            }
        },
        {
            find: "Messages.NOTE_PLACEHOLDER",
            replacement: {
                match: /\.NOTE_PLACEHOLDER,/,
                replace: "$&spellCheck:!Vencord.Settings.plugins.BetterNotesBox.noSpellCheck,"
            }
        },
        {
            find: ".Messages.NOTE}",
            replacement: {
                match: /(?<=return \i\?)null(?=:\(0,\i\.jsxs)/,
                replace: "$self.patchPadding(arguments[0])"
            }
        }
    ],

    options: {
        hide: {
            type: OptionType.BOOLEAN,
            description: "Hide notes",
            default: false,
            restartNeeded: true
        },
        noSpellCheck: {
            type: OptionType.BOOLEAN,
            description: "Disable spellcheck in notes",
            disabled: () => Settings.plugins.BetterNotesBox.hide,
            default: false
        }
    },

    patchPadding(e: any) {
        if (!e.lastSection) return;
        return (
            <div className={UserPopoutSectionCssClasses.lastSection}></div>
        );
    }
});
