/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy } from "@webpack";

export const TextAndImagesSettingsStores = findByPropsLazy("MessageDisplayCompact");
export const StatusSettingsStores = findByPropsLazy("ShowCurrentGame");

export const UserSettingsActionCreators = findByPropsLazy("PreloadedUserSettingsActionCreators");
