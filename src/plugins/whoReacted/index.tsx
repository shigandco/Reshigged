/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { sleep } from "@utils/misc";
import { Queue } from "@utils/Queue";
import { useForceUpdater } from "@utils/react";
import definePlugin from "@utils/types";
import { findByPropsLazy, findComponentByCodeLazy } from "@webpack";
import { ChannelStore, FluxDispatcher, React, RestAPI, Tooltip } from "@webpack/common";
import { CustomEmoji } from "@webpack/types";
import { Message, ReactionEmoji, User } from "discord-types/general";

const UserSummaryItem = findComponentByCodeLazy("defaultRenderUser", "showDefaultAvatarsForNullUsers");
const AvatarStyles = findByPropsLazy("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar");

const queue = new Queue();
let reactions: Record<string, ReactionCacheEntry>;

function fetchReactions(msg: Message, emoji: ReactionEmoji, type: number) {
    const key = emoji.name + (emoji.id ? `:${emoji.id}` : "");
    return RestAPI.get({
        url: `/channels/${msg.channel_id}/messages/${msg.id}/reactions/${key}`,
        query: {
            limit: 100,
            type
        },
        oldFormErrors: true
    })
        .then(res => FluxDispatcher.dispatch({
            type: "MESSAGE_REACTION_ADD_USERS",
            channelId: msg.channel_id,
            messageId: msg.id,
            users: res.body,
            emoji,
            reactionType: type
        }))
        .catch(console.error)
        .finally(() => sleep(250));
}

function getReactionsWithQueue(msg: Message, e: ReactionEmoji, type: number) {
    const key = `${msg.id}:${e.name}:${e.id ?? ""}:${type}`;
    const cache = reactions[key] ??= { fetched: false, users: {} };
    if (!cache.fetched) {
        queue.unshift(() => fetchReactions(msg, e, type));
        cache.fetched = true;
    }

    return cache.users;
}

function makeRenderMoreUsers(users: User[]) {
    return function renderMoreUsers(_label: string, _count: number) {
        return (
            <Tooltip text={users.slice(4).map(u => u.username).join(", ")} >
                {({ onMouseEnter, onMouseLeave }) => (
                    <div
                        className={AvatarStyles.moreUsers}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    >
                        +{users.length - 4}
                    </div>
                )}
            </Tooltip >
        );
    };
}

function handleClickAvatar(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.stopPropagation();
}

export default definePlugin({
    name: "WhoReacted",
    description: "Renders the avatars of users who reacted to a message",
    authors: [Devs.Ven, Devs.KannaDev],

    patches: [{
        find: ",reactionRef:",
        replacement: {
            match: /(\i)\?null:\(0,\i\.jsx\)\(\i\.\i,{className:\i\.reactionCount,.*?}\),/,
            replace: "$&$1?null:$self.renderUsers(this.props),"
        }
    }, {
        find: '.displayName="MessageReactionsStore";',
        replacement: {
            match: /(?<=CONNECTION_OPEN:function\(\){)(\i)={}/,
            replace: "$&;$self.reactions=$1"
        }
    }],

    renderUsers(props: RootObject) {
        return props.message.reactions.length > 10 ? null : (
            <ErrorBoundary noop>
                <this._renderUsers {...props} />
            </ErrorBoundary>
        );
    },

    _renderUsers({ message, emoji, type }: RootObject) {
        const forceUpdate = useForceUpdater();
        React.useEffect(() => {
            const cb = (e: any) => {
                if (e.messageId === message.id)
                    forceUpdate();
            };
            FluxDispatcher.subscribe("MESSAGE_REACTION_ADD_USERS", cb);

            return () => FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD_USERS", cb);
        }, [message.id]);

        const reactions = getReactionsWithQueue(message, emoji, type);
        const users = Object.values(reactions).filter(Boolean) as User[];

        for (const user of users) {
            FluxDispatcher.dispatch({
                type: "USER_UPDATE",
                user
            });
        }

        return (
            <div
                style={{ marginLeft: "0.5em", transform: "scale(0.9)" }}
            >
                <div onClick={handleClickAvatar}>
                    <UserSummaryItem
                        users={users}
                        guildId={ChannelStore.getChannel(message.channel_id)?.guild_id}
                        renderIcon={false}
                        max={5}
                        showDefaultAvatarsForNullUsers
                        showUserPopout
                        renderMoreUsers={makeRenderMoreUsers(users)}
                    />
                </div>
            </div>
        );
    },

    set reactions(value: any) {
        reactions = value;
    }
});

interface ReactionCacheEntry {
    fetched: boolean;
    users: Record<string, User>;
}

interface RootObject {
    message: Message;
    readOnly: boolean;
    isLurking: boolean;
    isPendingMember: boolean;
    useChatFontScaling: boolean;
    emoji: CustomEmoji;
    count: number;
    burst_user_ids: any[];
    burst_count: number;
    burst_colors: any[];
    burst_me: boolean;
    me: boolean;
    type: number;
    hideEmoji: boolean;
    remainingBurstCurrency: number;
}
