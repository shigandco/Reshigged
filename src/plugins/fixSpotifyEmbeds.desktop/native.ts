/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { app } from "electron";
import { getSettings } from "main/ipcMain";

app.on("browser-window-created", (_, win) => {
    win.webContents.on("frame-created", (_, { frame }) => {
        frame.once("dom-ready", () => {
            if (frame.url.startsWith("https://open.spotify.com/embed/")) {
                const settings = getSettings().plugins?.FixSpotifyEmbeds;
                if (!settings?.enabled) return;

                frame.executeJavaScript(`
                    const original = Audio.prototype.play;
                    Audio.prototype.play = function() {
                        this.volume = ${(settings.volume / 100) || 0.1};
                        return original.apply(this, arguments);
                    }
                `);
            }
        });
    });
});
