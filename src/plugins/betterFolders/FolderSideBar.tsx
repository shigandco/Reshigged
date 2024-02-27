/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { findByPropsLazy, findComponentByCodeLazy, findStoreLazy } from "@webpack";
import { useStateFromStores } from "@webpack/common";
import type { CSSProperties } from "react";

import { ExpandedGuildFolderStore, settings } from ".";

const ChannelRTCStore = findStoreLazy("ChannelRTCStore");
const Animations = findByPropsLazy("a", "animated", "useTransition");
const GuildsBar = findComponentByCodeLazy('("guildsnav")');

export default ErrorBoundary.wrap(guildsBarProps => {
    const expandedFolders = useStateFromStores([ExpandedGuildFolderStore], () => ExpandedGuildFolderStore.getExpandedFolders());
    const isFullscreen = useStateFromStores([ChannelRTCStore], () => ChannelRTCStore.isFullscreenInContext());

    const Sidebar = (
        <GuildsBar
            {...guildsBarProps}
            isBetterFolders={true}
            betterFoldersExpandedIds={expandedFolders}
        />
    );

    const visible = !!expandedFolders.size;
    const guilds = document.querySelector(guildsBarProps.className.split(" ").map(c => `.${c}`).join(""));

    // We need to display none if we are in fullscreen. Yes this seems horrible doing with css, but it's literally how Discord does it.
    // Also display flex otherwise to fix scrolling
    const barStyle = {
        display: isFullscreen ? "none" : "flex",
    } as CSSProperties;

    if (!guilds || !settings.store.sidebarAnim) {
        return visible
            ? <div style={barStyle}>{Sidebar}</div>
            : null;
    }

    return (
        <Animations.Transition
            items={visible}
            from={{ width: 0 }}
            enter={{ width: guilds.getBoundingClientRect().width }}
            leave={{ width: 0 }}
            config={{ duration: 200 }}
        >
            {(animationStyle, show) =>
                show && (
                    <Animations.animated.div style={{ ...animationStyle, ...barStyle }}>
                        {Sidebar}
                    </Animations.animated.div>
                )
            }
        </Animations.Transition>
    );
}, { noop: true });
