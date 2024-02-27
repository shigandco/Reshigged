/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { migratePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

migratePluginSettings("DisableCallIdle", "DisableDMCallIdle");
export default definePlugin({
    name: "DisableCallIdle",
    description: "Disables automatically getting kicked from a DM voice call after 3 minutes and being moved to an AFK voice channel.",
    authors: [Devs.Nuckyz],
    patches: [
        {
            find: ".Messages.BOT_CALL_IDLE_DISCONNECT",
            replacement: {
                match: /,?(?=this\.idleTimeout=new \i\.Timeout)/,
                replace: ";return;"
            }
        },
        {
            find: "handleIdleUpdate(){",
            replacement: {
                match: /(?<=_initialize\(\){)/,
                replace: "return;"
            }
        }
    ]
});
