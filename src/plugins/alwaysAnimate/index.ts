/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "AlwaysAnimate",
    description: "Animates anything that can be animated",
    authors: [Devs.FieryFlames],

    patches: [
        {
            find: "canAnimate:",
            all: true,
            // Some modules match the find but the replacement is returned untouched
            noWarn: true,
            replacement: {
                match: /canAnimate:.+?(?=([,}].*?\)))/g,
                replace: (m, rest) => {
                    const destructuringMatch = rest.match(/}=.+/);
                    if (destructuringMatch == null) return "canAnimate:!0";
                    return m;
                }
            }
        },
        {
            // Status emojis
            find: ".Messages.GUILD_OWNER,",
            replacement: {
                match: /(?<=\.activityEmoji,.+?animate:)\i/,
                replace: "!0"
            }
        },
        {
            // Guild Banner
            find: ".animatedBannerHoverLayer,onMouseEnter:",
            replacement: {
                match: /(?<=guildBanner:\i,animate:)\i(?=}\))/,
                replace: "!0"
            }
        }
    ]
});
