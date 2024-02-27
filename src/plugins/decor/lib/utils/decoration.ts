/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { AvatarDecoration } from "../../";
import { Decoration } from "../api";
import { SKU_ID } from "../constants";

export function decorationToAsset(decoration: Decoration) {
    return `${decoration.animated ? "a_" : ""}${decoration.hash}`;
}

export function decorationToAvatarDecoration(decoration: Decoration): AvatarDecoration {
    return { asset: decorationToAsset(decoration), skuId: SKU_ID };
}
