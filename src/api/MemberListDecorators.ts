/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, User } from "discord-types/general/index.js";

interface DecoratorProps {
    activities: any[];
    channel: Channel;
    /**
     * Only for DM members
     */
    channelName?: string;
    /**
     * Only for server members
     */
    currentUser?: User;
    guildId?: string;
    isMobile: boolean;
    isOwner?: boolean;
    isTyping: boolean;
    selected: boolean;
    status: string;
    user: User;
    [key: string]: any;
}
export type Decorator = (props: DecoratorProps) => JSX.Element | null;
type OnlyIn = "guilds" | "dms";

export const decorators = new Map<string, { decorator: Decorator, onlyIn?: OnlyIn; }>();

export function addDecorator(identifier: string, decorator: Decorator, onlyIn?: OnlyIn) {
    decorators.set(identifier, { decorator, onlyIn });
}

export function removeDecorator(identifier: string) {
    decorators.delete(identifier);
}

export function __getDecorators(props: DecoratorProps): (JSX.Element | null)[] {
    const isInGuild = !!(props.guildId);
    return Array.from(decorators.values(), decoratorObj => {
        const { decorator, onlyIn } = decoratorObj;
        // this can most likely be done cleaner
        if (!onlyIn || (onlyIn === "guilds" && isInGuild) || (onlyIn === "dms" && !isInGuild)) {
            return decorator(props);
        }
        return null;
    });
}
