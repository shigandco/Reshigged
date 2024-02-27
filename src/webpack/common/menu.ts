/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// eslint-disable-next-line path-alias/no-relative
import { findByPropsLazy, waitFor } from "../webpack";
import type * as t from "./types/menu";

export let Menu = {} as t.Menu;

waitFor(["MenuItem", "MenuSliderControl"], m => Menu = m);

export const ContextMenuApi: t.ContextMenuApi = findByPropsLazy("closeContextMenu", "openContextMenu");

