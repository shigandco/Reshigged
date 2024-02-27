/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { get, set } from "@api/DataStore";
import { addButton, removeButton } from "@api/MessagePopover";
import { ImageInvisible, ImageVisible } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ChannelStore } from "@webpack/common";

let style: HTMLStyleElement;

const KEY = "HideAttachments_HiddenIds";

let hiddenMessages: Set<string> = new Set();
const getHiddenMessages = () => get(KEY).then(set => {
    hiddenMessages = set ?? new Set<string>();
    return hiddenMessages;
});
const saveHiddenMessages = (ids: Set<string>) => set(KEY, ids);

export default definePlugin({
    name: "HideAttachments",
    description: "Hide attachments and Embeds for individual messages via hover button",
    authors: [Devs.Ven],
    dependencies: ["MessagePopoverAPI"],

    async start() {
        style = document.createElement("style");
        style.id = "VencordHideAttachments";
        document.head.appendChild(style);

        await getHiddenMessages();
        await this.buildCss();

        addButton("HideAttachments", msg => {
            if (!msg.attachments.length && !msg.embeds.length && !msg.stickerItems.length) return null;

            const isHidden = hiddenMessages.has(msg.id);

            return {
                label: isHidden ? "Show Attachments" : "Hide Attachments",
                icon: isHidden ? ImageVisible : ImageInvisible,
                message: msg,
                channel: ChannelStore.getChannel(msg.channel_id),
                onClick: () => this.toggleHide(msg.id)
            };
        });
    },

    stop() {
        style.remove();
        hiddenMessages.clear();
        removeButton("HideAttachments");
    },

    async buildCss() {
        const elements = [...hiddenMessages].map(id => `#message-accessories-${id}`).join(",");
        style.textContent = `
        :is(${elements}) :is([class*="embedWrapper"], [class*="clickableSticker"]) {
            /* important is not necessary, but add it to make sure bad themes won't break it */
            display: none !important;
        }
        :is(${elements})::after {
            content: "Attachments hidden";
            color: var(--text-muted);
            font-size: 80%;
        }
        `;
    },

    async toggleHide(id: string) {
        const ids = await getHiddenMessages();
        if (!ids.delete(id))
            ids.add(id);

        await saveHiddenMessages(ids);
        await this.buildCss();
    }
});
