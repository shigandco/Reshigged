/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findStoreLazy } from "@webpack";

import * as t from "./types/stores";

export const ApplicationStreamPreviewStore: t.ApplicationStreamPreviewStore = findStoreLazy("ApplicationStreamPreviewStore");
export const ApplicationStreamingStore: t.ApplicationStreamingStore = findStoreLazy("ApplicationStreamingStore");
