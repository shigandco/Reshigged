/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

const enum Intensity {
    Normal,
    Better,
    ProjectX,
}

const settings = definePluginSettings({
    superIntensePartyMode: {
        description: "Party intensity",
        type: OptionType.SELECT,
        options: [
            { label: "Normal", value: Intensity.Normal, default: true },
            { label: "Better", value: Intensity.Better },
            { label: "Project X", value: Intensity.ProjectX },
        ],
        restartNeeded: false,
        onChange: setSettings
    },
});

export default definePlugin({
    name: "Party mode 🎉",
    description: "Allows you to use party mode cause the party never ends ✨",
    authors: [Devs.UwUDev],
    settings,

    start() {
        setPoggerState(true);
        setSettings(settings.store.superIntensePartyMode);
    },

    stop() {
        setPoggerState(false);
    },
});

function setPoggerState(state: boolean) {
    FluxDispatcher.dispatch({
        type: "POGGERMODE_SETTINGS_UPDATE",
        settings: {
            enabled: state,
            settingsVisible: state
        }
    });
}

function setSettings(intensity: Intensity) {
    const state = {
        screenshakeEnabledLocations: { 0: true, 1: true, 2: true },
        shakeIntensity: 1,
        confettiSize: 16,
        confettiCount: 5,
        combosRequiredCount: 1
    };

    switch (intensity) {
        case Intensity.Normal: {
            Object.assign(state, {
                screenshakeEnabledLocations: { 0: true, 1: false, 2: false },
                combosRequiredCount: 5
            });
            break;
        }
        case Intensity.Better: {
            Object.assign(state, {
                confettiSize: 12,
                confettiCount: 8,
            });
            break;
        }
        case Intensity.ProjectX: {
            Object.assign(state, {
                shakeIntensity: 20,
                confettiSize: 25,
                confettiCount: 15,
            });
            break;
        }
    }

    FluxDispatcher.dispatch({
        type: "POGGERMODE_SETTINGS_UPDATE",
        settings: state
    });
}
