/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addContextMenuPatch, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { LinkIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Clipboard, Menu } from "@webpack/common";
import type { Channel, User } from "discord-types/general";

interface UserContextProps {
    channel: Channel;
    guildId?: string;
    user: User;
}

const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => () => {
    if (!user) return;

    children.push(
        <Menu.MenuItem
            id="vc-copy-user-url"
            label="Copy User URL"
            action={() => Clipboard.copy(`<https://discord.com/users/${user.id}>`)}
            icon={LinkIcon}
        />
    );
};

export default definePlugin({
    name: "CopyUserURLs",
    authors: [Devs.castdrian],
    description: "Adds a 'Copy User URL' option to the user context menu.",

    start() {
        addContextMenuPatch("user-context", UserContextMenuPatch);
    },

    stop() {
        removeContextMenuPatch("user-context", UserContextMenuPatch);
    },
});
