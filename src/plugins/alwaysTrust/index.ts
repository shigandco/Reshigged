/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "AlwaysTrust",
    description: "Removes the annoying untrusted domain and suspicious file popup",
    authors: [Devs.zt],
    patches: [
        {
            find: ".displayName=\"MaskedLinkStore\"",
            replacement: {
                match: /(?<=isTrustedDomain\(\i\){)return \i\(\i\)/,
                replace: "return true"
            }
        },
        {
            find: "isSuspiciousDownload:",
            replacement: {
                match: /function \i\(\i\){(?=.{0,60}\.parse\(\i\))/,
                replace: "$&return null;"
            }
        }
    ]
});
