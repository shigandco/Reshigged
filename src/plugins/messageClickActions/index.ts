/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addClickListener, removeClickListener } from "@api/MessageEvents";
import { definePluginSettings, Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { FluxDispatcher, PermissionsBits, PermissionStore, UserStore } from "@webpack/common";

let isDeletePressed = false;
const keydown = (e: KeyboardEvent) => e.key === "Backspace" && (isDeletePressed = true);
const keyup = (e: KeyboardEvent) => e.key === "Backspace" && (isDeletePressed = false);


const settings = definePluginSettings({
    enableDeleteOnClick: {
        type: OptionType.BOOLEAN,
        description: "Enable delete on click while holding backspace",
        default: true
    },
    enableDoubleClickToEdit: {
        type: OptionType.BOOLEAN,
        description: "Enable double click to edit",
        default: true
    },
    enableDoubleClickToReply: {
        type: OptionType.BOOLEAN,
        description: "Enable double click to reply",
        default: true
    },
    requireModifier: {
        type: OptionType.BOOLEAN,
        description: "Only do double click actions when shift/ctrl is held",
        default: false
    }
});

export default definePlugin({
    name: "MessageClickActions",
    description: "Hold Backspace and click to delete, double click to edit/reply",
    authors: [Devs.Ven],
    dependencies: ["MessageEventsAPI"],

    settings,

    start() {
        const MessageActions = findByPropsLazy("deleteMessage", "startEditMessage");
        const EditStore = findByPropsLazy("isEditing", "isEditingAny");

        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);

        this.onClick = addClickListener((msg: any, channel, event) => {
            const isMe = msg.author.id === UserStore.getCurrentUser().id;
            if (!isDeletePressed) {
                if (event.detail < 2) return;
                if (settings.store.requireModifier && !event.ctrlKey && !event.shiftKey) return;
                if (channel.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, channel)) return;
                if (msg.deleted === true) return;

                if (isMe) {
                    if (!settings.store.enableDoubleClickToEdit || EditStore.isEditing(channel.id, msg.id)) return;

                    MessageActions.startEditMessage(channel.id, msg.id, msg.content);
                    event.preventDefault();
                } else {
                    if (!settings.store.enableDoubleClickToReply) return;

                    const EPHEMERAL = 64;
                    if (msg.hasFlag(EPHEMERAL)) return;

                    FluxDispatcher.dispatch({
                        type: "CREATE_PENDING_REPLY",
                        channel,
                        message: msg,
                        shouldMention: !Settings.plugins.NoReplyMention.enabled,
                        showMentionToggle: channel.guild_id !== null
                    });
                }
            } else if (settings.store.enableDeleteOnClick && (isMe || PermissionStore.can(PermissionsBits.MANAGE_MESSAGES, channel))) {
                if (msg.deleted) {
                    FluxDispatcher.dispatch({
                        type: "MESSAGE_DELETE",
                        channelId: channel.id,
                        id: msg.id,
                        mlDeleted: true
                    });
                } else {
                    MessageActions.deleteMessage(channel.id, msg.id);
                }
                event.preventDefault();
            }
        });
    },

    stop() {
        removeClickListener(this.onClick);
        document.removeEventListener("keydown", keydown);
        document.removeEventListener("keyup", keyup);
    }
});
