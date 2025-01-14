/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { wordsToTitle } from "@utils/text";
import { GuildStore, i18n, Parser } from "@webpack/common";
import { Guild, GuildMember, Role } from "discord-types/general";
import type { ReactNode } from "react";

import { PermissionsSortOrder, settings } from ".";
import { PermissionType } from "./components/RolesAndUsersPermissions";

export const cl = classNameFactory("vc-permviewer-");

function formatPermissionWithoutMatchingString(permission: string) {
    return wordsToTitle(permission.toLowerCase().split("_"));
}

// because discord is unable to be consistent with their names
const PermissionKeyMap = {
    MANAGE_GUILD: "MANAGE_SERVER",
    MANAGE_GUILD_EXPRESSIONS: "MANAGE_EXPRESSIONS",
    CREATE_GUILD_EXPRESSIONS: "CREATE_EXPRESSIONS",
    MODERATE_MEMBERS: "MODERATE_MEMBER", // HELLOOOO ??????
    STREAM: "VIDEO",
    SEND_VOICE_MESSAGES: "ROLE_PERMISSIONS_SEND_VOICE_MESSAGE",
} as const;

export function getPermissionString(permission: string) {
    permission = PermissionKeyMap[permission] || permission;

    return i18n.Messages[permission] ||
        // shouldn't get here but just in case
        formatPermissionWithoutMatchingString(permission);
}

export function getPermissionDescription(permission: string): ReactNode {
    // DISCORD PLEEEEEEEEAAAAASE IM BEGGING YOU :(
    if (permission === "USE_APPLICATION_COMMANDS")
        permission = "USE_APPLICATION_COMMANDS_GUILD";
    else if (permission === "SEND_VOICE_MESSAGES")
        permission = "SEND_VOICE_MESSAGE_GUILD";
    else if (permission !== "STREAM")
        permission = PermissionKeyMap[permission] || permission;

    const msg = i18n.Messages[`ROLE_PERMISSIONS_${permission}_DESCRIPTION`] as any;
    if (msg?.hasMarkdown)
        return Parser.parse(msg.message);

    if (typeof msg === "string") return msg;

    return "";
}

export function getSortedRoles({ roles, id }: Guild, member: GuildMember) {
    return [...member.roles, id]
        .map(id => roles[id])
        .sort((a, b) => b.position - a.position);
}

export function sortUserRoles(roles: Role[]) {
    switch (settings.store.permissionsSortOrder) {
        case PermissionsSortOrder.HighestRole:
            return roles.sort((a, b) => b.position - a.position);
        case PermissionsSortOrder.LowestRole:
            return roles.sort((a, b) => a.position - b.position);
        default:
            return roles;
    }
}

export function sortPermissionOverwrites<T extends { id: string; type: number; }>(overwrites: T[], guildId: string) {
    const guild = GuildStore.getGuild(guildId);

    return overwrites.sort((a, b) => {
        if (a.type !== PermissionType.Role || b.type !== PermissionType.Role) return 0;

        const roleA = guild.roles[a.id];
        const roleB = guild.roles[b.id];

        return roleB.position - roleA.position;
    });
}
