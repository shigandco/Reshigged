/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function relaunch() {
    if (IS_DISCORD_DESKTOP)
        window.DiscordNative.app.relaunch();
    else
        window.VesktopNative.app.relaunch();
}

export function showItemInFolder(path: string) {
    if (IS_DISCORD_DESKTOP)
        window.DiscordNative.fileManager.showItemInFolder(path);
    else
        window.VesktopNative.fileManager.showItemInFolder(path);
}
