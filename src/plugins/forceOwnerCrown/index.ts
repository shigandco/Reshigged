/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { GuildStore } from "@webpack/common";
import { Channel, User } from "discord-types/general";

export default definePlugin({
    name: "ForceOwnerCrown",
    description: "Force the owner crown next to usernames even if the server is large.",
    authors: [Devs.D3SOX, Devs.Nickyux],
    patches: [
        {
            find: "AVATAR_DECORATION_PADDING:",
            replacement: {
                match: /,isOwner:(\i),/,
                replace: ",_isOwner:$1=$self.isGuildOwner(e),"
            }
        }
    ],
    isGuildOwner(props: { user: User, channel: Channel, isOwner: boolean, guildId?: string; }) {
        if (!props?.user?.id) return props.isOwner;
        if (props.channel?.type === 3 /* GROUP_DM */)
            return props.isOwner;

        // guild id is in props twice, fallback if the first is undefined
        const guildId = props.guildId ?? props.channel?.guild_id;
        const userId = props.user.id;

        return GuildStore.getGuild(guildId)?.ownerId === userId;
    },
});
