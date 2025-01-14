/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { openUserProfile } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import { Avatar, GuildMemberStore, React, RelationshipStore } from "@webpack/common";
import { User } from "discord-types/general";

const settings = definePluginSettings({
    showAvatars: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show avatars in the typing indicator"
    },
    showRoleColors: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show role colors in the typing indicator"
    },
    alternativeFormatting: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show a more useful message when several users are typing"
    }
});

export function buildSeveralUsers({ a, b, count }: { a: string, b: string, count: number; }) {
    return [
        <strong key="0">{a}</strong>,
        ", ",
        <strong key="1">{b}</strong>,
        `, and ${count} others are typing...`
    ];
}

interface Props {
    user: User;
    guildId: string;
}

const TypingUser = ErrorBoundary.wrap(function ({ user, guildId }: Props) {
    return (
        <strong
            role="button"
            onClick={() => {
                openUserProfile(user.id);
            }}
            style={{
                display: "grid",
                gridAutoFlow: "column",
                gap: "4px",
                color: settings.store.showRoleColors ? GuildMemberStore.getMember(guildId, user.id)?.colorString : undefined,
                cursor: "pointer"
            }}
        >
            {settings.store.showAvatars && (
                <div style={{ marginTop: "4px" }}>
                    <Avatar
                        size="SIZE_16"
                        src={user.getAvatarURL(guildId, 128)} />
                </div>
            )}
            {GuildMemberStore.getNick(guildId!, user.id)
                || (!guildId && RelationshipStore.getNickname(user.id))
                || (user as any).globalName
                || user.username
            }
        </strong>
    );
}, { noop: true });

export default definePlugin({
    name: "TypingTweaks",
    description: "Show avatars and role colours in the typing indicator",
    authors: [Devs.zt],
    patches: [
        // Style the indicator and add function call to modify the children before rendering
        {
            find: "getCooldownTextStyle",
            replacement: {
                match: /(?<=children:\[(\i)\.length>0.{0,200}?"aria-atomic":!0,children:)\i/,
                replace: "$self.mutateChildren(this.props, $1, $&), style: $self.TYPING_TEXT_STYLE"
            }
        },
        // Changes the indicator to keep the user object when creating the list of typing users
        {
            find: "getCooldownTextStyle",
            replacement: {
                match: /(?<=map\(\i=>)\i\.\i\.getName\(\i,this\.props\.channel\.id,(\i)\)/,
                replace: "$1"
            }
        },
        // Adds the alternative formatting for several users typing
        {
            find: "getCooldownTextStyle",
            replacement: {
                match: /(?<=(\i)\.length\?\i.\i\.Messages.THREE_USERS_TYPING\.format\({\i:(\i),(?:\i:)?(\i),\i:\i}\):)\i\.\i\.Messages\.SEVERAL_USERS_TYPING/,
                replace: (_, users, a, b) => `$self.buildSeveralUsers({ a: ${a}, b: ${b}, count: ${users}.length - 2 })`
            },
            predicate: () => settings.store.alternativeFormatting
        }
    ],
    settings,

    TYPING_TEXT_STYLE: {
        display: "grid",
        gridAutoFlow: "column",
        gridGap: "0.25em"
    },

    buildSeveralUsers,

    mutateChildren(props: any, users: User[], children: any) {
        if (!Array.isArray(children)) return children;

        let element = 0;

        return children.map(c =>
            c.type === "strong"
                ? <TypingUser {...props} user={users[element++]} />
                : c
        );
    }
});
