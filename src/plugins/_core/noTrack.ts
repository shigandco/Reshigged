/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoTrack",
    description: "Disable Discord's tracking ('science'), metrics and Sentry crash reporting",
    authors: [Devs.Cyn, Devs.Ven, Devs.Nuckyz, Devs.Arrow],
    required: true,
    patches: [
        {
            find: "AnalyticsActionHandlers.handle",
            replacement: {
                match: /^.+$/,
                replace: "()=>{}",
            },
        },
        {
            find: "window.DiscordSentry=",
            replacement: {
                match: /^.+$/,
                replace: "()=>{}",
            }
        },
        {
            find: ".METRICS,",
            replacement: [
                {
                    match: /this\._intervalId=/,
                    replace: "this._intervalId=undefined&&"
                },
                {
                    match: /(increment\(\i\){)/,
                    replace: "$1return;"
                }
            ]
        },
        {
            find: ".installedLogHooks)",
            replacement: {
                // if getDebugLogging() returns false, the hooks don't get installed.
                match: "getDebugLogging(){",
                replace: "getDebugLogging(){return false;"
            }
        },
    ]
});
