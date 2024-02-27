/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "MessageDecorationsAPI",
    description: "API to add decorations to messages",
    authors: [Devs.TheSun],
    patches: [
        {
            find: '"Message Username"',
            replacement: {
                match: /\.Messages\.GUILD_COMMUNICATION_DISABLED_BOTTOM_SHEET_TITLE.+?}\),\i(?=\])/,
                replace: "$&,...Vencord.Api.MessageDecorations.__addDecorationsToMessage(arguments[0])"
            }
        }
    ],
});
