/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageObject } from "@api/MessageEvents";
import { ChannelStore, ComponentDispatch, FluxDispatcher, GuildStore, InviteActions, MaskedLink, MessageActions, ModalImageClasses, PrivateChannelsStore, RestAPI, SelectedChannelStore, SelectedGuildStore, UserProfileActions, UserProfileStore, UserSettingsActionCreators, UserUtils } from "@webpack/common";
import { Guild, Message, User } from "discord-types/general";

import { ImageModal, ModalRoot, ModalSize, openModal } from "./modal";

/**
 * Open the invite modal
 * @param code The invite code
 * @returns Whether the invite was accepted
 */
export async function openInviteModal(code: string) {
    const { invite } = await InviteActions.resolveInvite(code, "Desktop Modal");
    if (!invite) throw new Error("Invalid invite: " + code);

    FluxDispatcher.dispatch({
        type: "INVITE_MODAL_OPEN",
        invite,
        code,
        context: "APP"
    });

    return new Promise<boolean>(r => {
        let onClose: () => void, onAccept: () => void;
        let inviteAccepted = false;

        FluxDispatcher.subscribe("INVITE_ACCEPT", onAccept = () => {
            inviteAccepted = true;
        });

        FluxDispatcher.subscribe("INVITE_MODAL_CLOSE", onClose = () => {
            FluxDispatcher.unsubscribe("INVITE_MODAL_CLOSE", onClose);
            FluxDispatcher.unsubscribe("INVITE_ACCEPT", onAccept);
            r(inviteAccepted);
        });
    });
}

export function getCurrentChannel() {
    return ChannelStore.getChannel(SelectedChannelStore.getChannelId());
}

export function getCurrentGuild(): Guild | undefined {
    return GuildStore.getGuild(getCurrentChannel()?.guild_id);
}

export function openPrivateChannel(userId: string) {
    PrivateChannelsStore.openPrivateChannel(userId);
}

export const enum Theme {
    Dark = 1,
    Light = 2
}

export function getTheme(): Theme {
    return UserSettingsActionCreators.PreloadedUserSettingsActionCreators.getCurrentValue()?.appearance?.theme;
}

export function insertTextIntoChatInputBox(text: string) {
    ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
        rawText: text,
        plainText: text
    });
}

interface MessageExtra {
    messageReference: Message["messageReference"];
    allowedMentions: {
        parse: string[];
        replied_user: boolean;
    };
    stickerIds: string[];
}

export function sendMessage(
    channelId: string,
    data: Partial<MessageObject>,
    waitForChannelReady?: boolean,
    extra?: Partial<MessageExtra>
) {
    const messageData = {
        content: "",
        invalidEmojis: [],
        tts: false,
        validNonShortcutEmojis: [],
        ...data
    };

    return MessageActions.sendMessage(channelId, messageData, waitForChannelReady, extra);
}

export function openImageModal(url: string, props?: Partial<React.ComponentProps<ImageModal>>): string {
    return openModal(modalProps => (
        <ModalRoot
            {...modalProps}
            className={ModalImageClasses.modal}
            size={ModalSize.DYNAMIC}>
            <ImageModal
                className={ModalImageClasses.image}
                original={url}
                placeholder={url}
                src={url}
                renderLinkComponent={props => <MaskedLink {...props} />}
                shouldHideMediaOptions={false}
                shouldAnimate
                {...props}
            />
        </ModalRoot>
    ));
}

export async function openUserProfile(id: string) {
    const user = await UserUtils.getUser(id);
    if (!user) throw new Error("No such user: " + id);

    const guildId = SelectedGuildStore.getGuildId();
    UserProfileActions.openUserProfileModal({
        userId: id,
        guildId,
        channelId: SelectedChannelStore.getChannelId(),
        analyticsLocation: {
            page: guildId ? "Guild Channel" : "DM Channel",
            section: "Profile Popout"
        }
    });
}

interface FetchUserProfileOptions {
    friend_token?: string;
    connections_role_id?: string;
    guild_id?: string;
    with_mutual_guilds?: boolean;
    with_mutual_friends_count?: boolean;
}

/**
 * Fetch a user's profile
 */
export async function fetchUserProfile(id: string, options?: FetchUserProfileOptions) {
    const cached = UserProfileStore.getUserProfile(id);
    if (cached) return cached;

    FluxDispatcher.dispatch({ type: "USER_PROFILE_FETCH_START", userId: id });

    const { body } = await RestAPI.get({
        url: `/users/${id}/profile`,
        query: {
            with_mutual_guilds: false,
            with_mutual_friends_count: false,
            ...options
        },
        oldFormErrors: true,
    });

    FluxDispatcher.dispatch({ type: "USER_UPDATE", user: body.user });
    await FluxDispatcher.dispatch({ type: "USER_PROFILE_FETCH_SUCCESS", ...body });
    if (options?.guild_id && body.guild_member)
        FluxDispatcher.dispatch({ type: "GUILD_MEMBER_PROFILE_UPDATE", guildId: options.guild_id, guildMember: body.guild_member });

    return UserProfileStore.getUserProfile(id);
}

/**
 * Get the unique username for a user. Returns user.username for pomelo people, user.tag otherwise
 */
export function getUniqueUsername(user: User) {
    return user.discriminator === "0" ? user.username : user.tag;
}
