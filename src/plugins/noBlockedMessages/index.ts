/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";

const RelationshipStore = findByPropsLazy("getRelationships", "isBlocked");

export default definePlugin({
    name: "NoBlockedMessages",
    description: "Hides all blocked messages from chat completely.",
    authors: [Devs.rushii, Devs.Samu],
    patches: [
        {
            find: "Messages.BLOCKED_MESSAGES_HIDE",
            replacement: [
                {
                    match: /let\{[^}]*collapsedReason[^}]*\}/,
                    replace: "return null;$&"
                }
            ]
        },
        ...[
            'displayName="MessageStore"',
            'displayName="ReadStateStore"'
        ].map(find => ({
            find,
            predicate: () => Settings.plugins.NoBlockedMessages.ignoreBlockedMessages === true,
            replacement: [
                {
                    match: /(?<=MESSAGE_CREATE:function\((\i)\){)/,
                    replace: (_, props) => `if($self.isBlocked(${props}.message))return;`
                }
            ]
        }))
    ],
    options: {
        ignoreBlockedMessages: {
            description: "Completely ignores (recent) incoming messages from blocked users (locally).",
            type: OptionType.BOOLEAN,
            default: false,
            restartNeeded: true,
        },
    },
    isBlocked: message =>
        RelationshipStore.isBlocked(message.author.id)
});
