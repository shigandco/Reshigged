/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "MemberListDecoratorsAPI",
    description: "API to add decorators to member list (both in servers and DMs)",
    authors: [Devs.TheSun, Devs.Ven],
    patches: [
        {
            find: ".lostPermission)",
            replacement: [
                {
                    match: /let\{[^}]*lostPermissionTooltipText:\i[^}]*\}=(\i),/,
                    replace: "$&vencordProps=$1,"
                }, {
                    match: /decorators:.{0,100}?children:\[/,
                    replace: "$&...(typeof vencordProps=='undefined'?[]:Vencord.Api.MemberListDecorators.__getDecorators(vencordProps)),"
                }
            ]
        },
        {
            find: "PrivateChannel.renderAvatar",
            replacement: {
                match: /decorators:(\i\.isSystemDM\(\))\?(.+?):null/,
                replace: "decorators:[...Vencord.Api.MemberListDecorators.__getDecorators(arguments[0]), $1?$2:null]"
            }
        }
    ],
});
