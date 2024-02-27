/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "BetterUploadButton",
    authors: [Devs.obscurity, Devs.Ven],
    description: "Upload with a single click, open menu with right click",
    patches: [
        {
            find: "Messages.CHAT_ATTACH_UPLOAD_OR_INVITE",
            replacement: {
                // Discord merges multiple props here with Object.assign()
                // This patch passes a third object to it with which we override onClick and onContextMenu
                match: /CHAT_ATTACH_UPLOAD_OR_INVITE,onDoubleClick:(.+?:void 0),\.\.\.(\i),/,
                replace: "$&onClick:$1,onContextMenu:$2.onClick,",
            },
        },
    ],
});
