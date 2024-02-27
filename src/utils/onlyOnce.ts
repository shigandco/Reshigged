/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function onlyOnce<F extends Function>(f: F): F {
    let called = false;
    let result: any;
    return function onlyOnceWrapper(this: unknown) {
        if (called) return result;

        called = true;

        return (result = f.apply(this, arguments));
    } as unknown as F;
}
