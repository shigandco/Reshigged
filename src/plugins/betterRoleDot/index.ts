/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Clipboard, Toasts } from "@webpack/common";

export default definePlugin({
    name: "BetterRoleDot",
    authors: [Devs.Ven, Devs.AutumnVN],
    description:
        "Copy role colour on RoleDot (accessibility setting) click. Also allows using both RoleDot and coloured names simultaneously",

    patches: [
        {
            find: ".dotBorderBase",
            replacement: {
                match: /,viewBox:"0 0 20 20"/,
                replace: "$&,onClick:()=>$self.copyToClipBoard(arguments[0].color),style:{cursor:'pointer'}",
            },
        },
        {
            find: '"dot"===',
            all: true,
            noWarn: true,
            predicate: () => Settings.plugins.BetterRoleDot.bothStyles,
            replacement: {
                match: /"(?:username|dot)"===\i(?!\.\i)/g,
                replace: "true",
            },
        },

        {
            find: ".ADD_ROLE_A11Y_LABEL",
            predicate: () => Settings.plugins.BetterRoleDot.copyRoleColorInProfilePopout && !Settings.plugins.BetterRoleDot.bothStyles,
            noWarn: true,
            replacement: {
                match: /"dot"===\i/,
                replace: "true"
            }
        },
        {
            find: ".roleVerifiedIcon",
            predicate: () => Settings.plugins.BetterRoleDot.copyRoleColorInProfilePopout && !Settings.plugins.BetterRoleDot.bothStyles,
            noWarn: true,
            replacement: {
                match: /"dot"===\i/,
                replace: "true"
            }
        }
    ],

    options: {
        bothStyles: {
            type: OptionType.BOOLEAN,
            description: "Show both role dot and coloured names",
            restartNeeded: true,
            default: false,
        },
        copyRoleColorInProfilePopout: {
            type: OptionType.BOOLEAN,
            description: "Allow click on role dot in profile popout to copy role color",
            restartNeeded: true,
            default: false
        }
    },

    copyToClipBoard(color: string) {
        Clipboard.copy(color);
        Toasts.show({
            message: "Copied to Clipboard!",
            type: Toasts.Type.SUCCESS,
            id: Toasts.genId(),
            options: {
                duration: 1000,
                position: Toasts.Position.BOTTOM
            }
        });
    },
});
