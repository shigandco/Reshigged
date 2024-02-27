/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "ShowTimeouts",
    description: "Display member timeout icons in chat regardless of permissions.",
    authors: [Devs.Dolfies],
    patches: [
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /&&\i\.\i\.canManageUser\(\i\.\i\.MODERATE_MEMBERS,\i\.author,\i\)/,
                replace: "",
            },
        },
    ],
});
