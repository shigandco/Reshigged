/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoRPC",
    description: "Disables Discord's RPC server.",
    authors: [Devs.Cyn],
    patches: [
        {
            find: '.ensureModule("discord_rpc")',
            replacement: {
                match: /\.ensureModule\("discord_rpc"\)\.then\(\(.+?\)\)}/,
                replace: '.ensureModule("discord_rpc")}',
            },
        },
    ],
});
