/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings,migratePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";

const { updateGuildNotificationSettings } = findByPropsLazy("updateGuildNotificationSettings");
const { toggleShowAllChannels } = findByPropsLazy("toggleShowAllChannels");
const { isOptInEnabledForGuild } = findByPropsLazy("isOptInEnabledForGuild");

const settings = definePluginSettings({
    guild: {
        description: "Mute Guild automatically",
        type: OptionType.BOOLEAN,
        default: true
    },
    everyone: {
        description: "Suppress @everyone and @here",
        type: OptionType.BOOLEAN,
        default: true
    },
    role: {
        description: "Suppress All Role @mentions",
        type: OptionType.BOOLEAN,
        default: true
    },
    showAllChannels: {
        description: "Show all channels automatically",
        type: OptionType.BOOLEAN,
        default: true
    }
});

migratePluginSettings("NewGuildSettings", "MuteNewGuild");
export default definePlugin({
    name: "NewGuildSettings",
    description: "Automatically mute new servers and change various other settings upon joining",
    tags: ["MuteNewGuild", "mute", "server"],
    authors: [Devs.Glitch, Devs.Nuckyz, Devs.carince, Devs.Mopi],
    patches: [
        {
            find: ",acceptInvite(",
            replacement: {
                match: /INVITE_ACCEPT_SUCCESS.+?,(\i)=null!==.+?;/,
                replace: (m, guildId) => `${m}$self.handleMute(${guildId});`
            }
        },
        {
            find: "{joinGuild:",
            replacement: {
                match: /guildId:(\i),lurker:(\i).{0,20}}\)\);/,
                replace: (m, guildId, lurker) => `${m}if(!${lurker})$self.handleMute(${guildId});`
            }
        }
    ],
    settings,

    handleMute(guildId: string | null) {
        if (guildId === "@me" || guildId === "null" || guildId == null) return;
        updateGuildNotificationSettings(guildId,
            {
                muted: settings.store.guild,
                suppress_everyone: settings.store.everyone,
                suppress_roles: settings.store.role
            });
        if (settings.store.showAllChannels && isOptInEnabledForGuild(guildId)) {
            toggleShowAllChannels(guildId);
        }
    }
});
