/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";


export default definePlugin({
    name: "NoUnblockToJump",
    description: "Allows you to jump to messages of blocked users without unblocking them",
    authors: [Devs.dzshn],
    patches: [
        {
            find: '.id,"Search Results"',
            replacement: {
                match: /if\(.{1,10}\)(.{1,10}\.show\({.{1,50}UNBLOCK_TO_JUMP_TITLE)/,
                replace: "if(false)$1"
            }
        },
        {
            find: "renderJumpButton()",
            replacement: {
                match: /if\(.{1,10}\)(.{1,10}\.show\({.{1,50}UNBLOCK_TO_JUMP_TITLE)/,
                replace: "if(false)$1"
            }
        },
        {
            find: "flash:!0,returnMessageId",
            replacement: {
                match: /.\?(.{1,10}\.show\({.{1,50}UNBLOCK_TO_JUMP_TITLE)/,
                replace: "false?$1"
            }
        }
    ]
});
