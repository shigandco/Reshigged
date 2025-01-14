/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { onceDefined } from "@utils/onceDefined";
import electron, { app, BrowserWindowConstructorOptions, Menu } from "electron";
import { dirname, join } from "path";

import { getSettings, initIpc } from "./ipcMain";
import { IS_VANILLA } from "./utils/constants";

console.log("[Vencord] Starting up...");

// Our injector file at app/index.js
const injectorPath = require.main!.filename;

// special discord_arch_electron injection method
const asarName = require.main!.path.endsWith("app.asar") ? "_app.asar" : "app.asar";

// The original app.asar
const asarPath = join(dirname(injectorPath), "..", asarName);

const discordPkg = require(join(asarPath, "package.json"));
require.main!.filename = join(asarPath, discordPkg.main);

// @ts-ignore Untyped method? Dies from cringe
app.setAppPath(asarPath);

if (!IS_VANILLA) {
    const settings = getSettings();

    // Repatch after host updates on Windows
    if (process.platform === "win32") {
        require("./patchWin32Updater");

        if (settings.winCtrlQ) {
            const originalBuild = Menu.buildFromTemplate;
            Menu.buildFromTemplate = function (template) {
                if (template[0]?.label === "&File") {
                    const { submenu } = template[0];
                    if (Array.isArray(submenu)) {
                        submenu.push({
                            label: "Quit (Hidden)",
                            visible: false,
                            acceleratorWorksWhenHidden: true,
                            accelerator: "Control+Q",
                            click: () => app.quit()
                        });
                    }
                }
                return originalBuild.call(this, template);
            };
        }
    }

    class BrowserWindow extends electron.BrowserWindow {
        constructor(options: BrowserWindowConstructorOptions) {
            if (options?.webPreferences?.preload && options.title) {
                const original = options.webPreferences.preload;
                options.webPreferences.preload = join(__dirname, IS_DISCORD_DESKTOP ? "preload.js" : "vencordDesktopPreload.js");
                options.webPreferences.sandbox = false;
                if (settings.frameless) {
                    options.frame = false;
                } else if (process.platform === "win32" && settings.winNativeTitleBar) {
                    delete options.frame;
                }

                if (settings.transparent) {
                    options.transparent = true;
                    options.backgroundColor = "#00000000";
                }

                const needsVibrancy = process.platform === "darwin" || (settings.macosVibrancyStyle || settings.macosTranslucency);

                if (needsVibrancy) {
                    options.backgroundColor = "#00000000";
                    if (settings.macosTranslucency) {
                        options.vibrancy = "sidebar";
                    } else if (settings.macosVibrancyStyle) {
                        options.vibrancy = settings.macosVibrancyStyle;
                    }
                }

                process.env.DISCORD_PRELOAD = original;

                super(options);
                initIpc(this);
            } else super(options);
        }
    }
    Object.assign(BrowserWindow, electron.BrowserWindow);
    // esbuild may rename our BrowserWindow, which leads to it being excluded
    // from getFocusedWindow(), so this is necessary
    // https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
    Object.defineProperty(BrowserWindow, "name", { value: "BrowserWindow", configurable: true });

    // Replace electrons exports with our custom BrowserWindow
    const electronPath = require.resolve("electron");
    delete require.cache[electronPath]!.exports;
    require.cache[electronPath]!.exports = {
        ...electron,
        BrowserWindow
    };

    // Patch appSettings to force enable devtools and optionally disable min size
    onceDefined(global, "appSettings", s => {
        s.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
        if (settings.disableMinSize) {
            s.set("MIN_WIDTH", 0);
            s.set("MIN_HEIGHT", 0);
        } else {
            s.set("MIN_WIDTH", 940);
            s.set("MIN_HEIGHT", 500);
        }
    });

    process.env.DATA_DIR = join(app.getPath("userData"), "..", "Vencord");

    // Monkey patch commandLine to disable WidgetLayering: Fix DevTools context menus https://github.com/electron/electron/issues/38790
    const originalAppend = app.commandLine.appendSwitch;
    app.commandLine.appendSwitch = function (...args) {
        if (args[0] === "disable-features" && !args[1]?.includes("WidgetLayering")) {
            args[1] += ",WidgetLayering";
        }
        return originalAppend.apply(this, args);
    };
} else {
    console.log("[Vencord] Running in vanilla mode. Not loading Vencord");
}

console.log("[Vencord] Loading original Discord app.asar");
require(require.main!.filename);
