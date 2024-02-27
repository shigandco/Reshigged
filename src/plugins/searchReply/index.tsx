/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addContextMenuPatch, findGroupChildrenByChildId, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { ReplyIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { ChannelStore, i18n, Menu, PermissionsBits, PermissionStore, SelectedChannelStore } from "@webpack/common";
import { Message } from "discord-types/general";


const messageUtils = findByPropsLazy("replyToMessage");

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => () => {
    // make sure the message is in the selected channel
    if (SelectedChannelStore.getChannelId() !== message.channel_id) return;
    const channel = ChannelStore.getChannel(message?.channel_id);
    if (!channel) return;
    if (channel.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, channel)) return;

    // dms and group chats
    const dmGroup = findGroupChildrenByChildId("pin", children);
    if (dmGroup && !dmGroup.some(child => child?.props?.id === "reply")) {
        const pinIndex = dmGroup.findIndex(c => c?.props.id === "pin");
        return dmGroup.splice(pinIndex + 1, 0, (
            <Menu.MenuItem
                id="reply"
                label={i18n.Messages.MESSAGE_ACTION_REPLY}
                icon={ReplyIcon}
                action={(e: React.MouseEvent) => messageUtils.replyToMessage(channel, message, e)}
            />
        ));
    }

    // servers
    const serverGroup = findGroupChildrenByChildId("mark-unread", children);
    if (serverGroup && !serverGroup.some(child => child?.props?.id === "reply")) {
        return serverGroup.unshift((
            <Menu.MenuItem
                id="reply"
                label={i18n.Messages.MESSAGE_ACTION_REPLY}
                icon={ReplyIcon}
                action={(e: React.MouseEvent) => messageUtils.replyToMessage(channel, message, e)}
            />
        ));
    }
};


export default definePlugin({
    name: "SearchReply",
    description: "Adds a reply button to search results",
    authors: [Devs.Aria],

    start() {
        addContextMenuPatch("message", messageContextMenuPatch);
    },

    stop() {
        removeContextMenuPatch("message", messageContextMenuPatch);
    }
});
