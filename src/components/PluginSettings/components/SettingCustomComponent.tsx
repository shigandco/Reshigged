/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PluginOptionComponent } from "@utils/types";

import { ISettingElementProps } from ".";

export function SettingCustomComponent({ option, onChange, onError }: ISettingElementProps<PluginOptionComponent>) {
    return option.component({ setValue: onChange, setError: onError, option });
}
