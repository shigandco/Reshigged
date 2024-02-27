/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy, findLazy } from "@webpack";

import * as t from "./types/classes";

export const ModalImageClasses: t.ImageModalClasses = findLazy(m => m.image && m.modal && !m.applicationIcon);
export const ButtonWrapperClasses: t.ButtonWrapperClasses = findByPropsLazy("buttonWrapper", "buttonContent");
