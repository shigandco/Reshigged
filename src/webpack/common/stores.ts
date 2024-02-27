/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type * as Stores from "discord-types/stores";

// eslint-disable-next-line path-alias/no-relative
import { findByPropsLazy } from "../webpack";
import { waitForStore } from "./internal";
import * as t from "./types/stores";

export const Flux: t.Flux = findByPropsLazy("connectStores");

export type GenericStore = t.FluxStore & Record<string, any>;

export enum DraftType {
    ChannelMessage = 0,
    ThreadSettings = 1,
    FirstThreadMessage = 2,
    ApplicationLauncherCommand = 3
}

export let MessageStore: Omit<Stores.MessageStore, "getMessages"> & {
    getMessages(chanId: string): any;
};

// this is not actually a FluxStore
export const PrivateChannelsStore = findByPropsLazy("openPrivateChannel");
export let PermissionStore: GenericStore;
export let GuildChannelStore: GenericStore;
export let ReadStateStore: GenericStore;
export let PresenceStore: GenericStore;
export let PoggerModeSettingsStore: GenericStore;

export let GuildStore: Stores.GuildStore & t.FluxStore;
export let UserStore: Stores.UserStore & t.FluxStore;
export let UserProfileStore: GenericStore;
export let SelectedChannelStore: Stores.SelectedChannelStore & t.FluxStore;
export let SelectedGuildStore: t.FluxStore & Record<string, any>;
export let ChannelStore: Stores.ChannelStore & t.FluxStore;
export let GuildMemberStore: Stores.GuildMemberStore & t.FluxStore;
export let RelationshipStore: Stores.RelationshipStore & t.FluxStore & {
    /** Get the date (as a string) that the relationship was created */
    getSince(userId: string): string;
};

export let EmojiStore: t.EmojiStore;
export let WindowStore: t.WindowStore;
export let DraftStore: t.DraftStore;

/**
 * React hook that returns stateful data for one or more stores
 * You might need a custom comparator (4th argument) if your store data is an object
 *
 * @param stores The stores to listen to
 * @param mapper A function that returns the data you need
 * @param idk some thing, idk just pass null
 * @param isEqual A custom comparator for the data returned by mapper
 *
 * @example const user = useStateFromStores([UserStore], () => UserStore.getCurrentUser(), null, (old, current) => old.id === current.id);
 */
export const { useStateFromStores }: {
    useStateFromStores: <T>(
        stores: t.FluxStore[],
        mapper: () => T,
        idk?: any,
        isEqual?: (old: T, newer: T) => boolean
    ) => T;
}
    = findByPropsLazy("useStateFromStores");

waitForStore("DraftStore", s => DraftStore = s);
waitForStore("UserStore", s => UserStore = s);
waitForStore("UserProfileStore", m => UserProfileStore = m);
waitForStore("ChannelStore", m => ChannelStore = m);
waitForStore("SelectedChannelStore", m => SelectedChannelStore = m);
waitForStore("SelectedGuildStore", m => SelectedGuildStore = m);
waitForStore("GuildStore", m => GuildStore = m);
waitForStore("GuildMemberStore", m => GuildMemberStore = m);
waitForStore("RelationshipStore", m => RelationshipStore = m);
waitForStore("PermissionStore", m => PermissionStore = m);
waitForStore("PresenceStore", m => PresenceStore = m);
waitForStore("ReadStateStore", m => ReadStateStore = m);
waitForStore("GuildChannelStore", m => GuildChannelStore = m);
waitForStore("MessageStore", m => MessageStore = m);
waitForStore("WindowStore", m => WindowStore = m);
waitForStore("EmojiStore", m => EmojiStore = m);
