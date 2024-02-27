/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function waitFor(condition: () => boolean, cb: () => void) {
    if (condition()) cb();
    else requestAnimationFrame(() => waitFor(condition, cb));
}
