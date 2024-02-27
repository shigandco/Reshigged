/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { Devs, SUPPORT_CHANNEL_ID } from "@utils/constants";
import { isPluginDev } from "@utils/misc";
import { makeCodeblock } from "@utils/text";
import definePlugin from "@utils/types";
import { isOutdated } from "@utils/updater";
import { Alerts, Forms, UserStore } from "@webpack/common";

import gitHash from "~git-hash";
import plugins from "~plugins";

import settings from "./settings";

const REMEMBER_DISMISS_KEY = "Vencord-SupportHelper-Dismiss";

const AllowedChannelIds = [
    SUPPORT_CHANNEL_ID,
    "1024286218801926184", // Vencord > #bot-spam
    "1033680203433660458", // Vencord > #v
];

export default definePlugin({
    name: "SupportHelper",
    required: true,
    description: "Helps us provide support to you",
    authors: [Devs.Ven],
    dependencies: ["CommandsAPI"],

    commands: [{
        name: "vencord-debug",
        description: "Send Vencord Debug info",
        predicate: ctx => AllowedChannelIds.includes(ctx.channel.id),
        async execute() {
            const { RELEASE_CHANNEL } = window.GLOBAL_ENV;

            const client = (() => {
                if (IS_DISCORD_DESKTOP) return `Discord Desktop v${DiscordNative.app.getVersion()}`;
                if (IS_VESKTOP) return `Vesktop v${VesktopNative.app.getVersion()}`;
                if ("armcord" in window) return `ArmCord v${window.armcord.version}`;

                // @ts-expect-error
                const name = typeof unsafeWindow !== "undefined" ? "UserScript" : "Web";
                return `${name} (${navigator.userAgent})`;
            })();

            const isApiPlugin = (plugin: string) => plugin.endsWith("API") || plugins[plugin].required;

            const enabledPlugins = Object.keys(plugins).filter(p => Vencord.Plugins.isPluginEnabled(p) && !isApiPlugin(p));
            const enabledApiPlugins = Object.keys(plugins).filter(p => Vencord.Plugins.isPluginEnabled(p) && isApiPlugin(p));

            const info = {
                Vencord: `v${VERSION} • ${gitHash}${settings.additionalInfo} - ${Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(BUILD_TIMESTAMP)}`,
                "Discord Branch": RELEASE_CHANNEL,
                Client: client,
                Platform: window.navigator.platform,
                Outdated: isOutdated,
                OpenAsar: "openasar" in window,
            };

            if (IS_DISCORD_DESKTOP) {
                info["Last Crash Reason"] = (await DiscordNative.processUtils.getLastCrash())?.rendererCrashReason ?? "N/A";
            }

            const debugInfo = `
**Vencord Debug Info**
>>> ${Object.entries(info).map(([k, v]) => `${k}: ${v}`).join("\n")}

Enabled Plugins (${enabledPlugins.length + enabledApiPlugins.length}):
${makeCodeblock(enabledPlugins.join(", ") + "\n\n" + enabledApiPlugins.join(", "))}
`;

            return {
                content: debugInfo.trim().replaceAll("```\n", "```")
            };
        }
    }],

    flux: {
        async CHANNEL_SELECT({ channelId }) {
            if (channelId !== SUPPORT_CHANNEL_ID) return;

            if (isPluginDev(UserStore.getCurrentUser().id)) return;

            if (isOutdated && gitHash !== await DataStore.get(REMEMBER_DISMISS_KEY)) {
                const rememberDismiss = () => DataStore.set(REMEMBER_DISMISS_KEY, gitHash);

                Alerts.show({
                    title: "Hold on!",
                    body: <div>
                        <Forms.FormText>You are using an outdated version of Vencord! Chances are, your issue is already fixed.</Forms.FormText>
                        <Forms.FormText>
                            Please first update using the Updater Page in Settings, or use the VencordInstaller (Update Vencord Button)
                            to do so, in case you can't access the Updater page.
                        </Forms.FormText>
                    </div>,
                    onCancel: rememberDismiss,
                    onConfirm: rememberDismiss
                });
            }
        }
    }
});
