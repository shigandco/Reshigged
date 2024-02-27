/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { extractAndLoadChunksLazy, findByPropsLazy } from "@webpack";

export const cl = classNameFactory("vc-decor-");
export const DecorationModalStyles = findByPropsLazy("modalFooterShopButton");

export const requireAvatarDecorationModal = extractAndLoadChunksLazy(["openAvatarDecorationModal:"]);
export const requireCreateStickerModal = extractAndLoadChunksLazy(["stickerInspected]:"]);
