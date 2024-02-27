/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LazyComponent } from "@utils/react";

// eslint-disable-next-line path-alias/no-relative
import { FilterFn, filters, lazyWebpackSearchHistory, waitFor } from "../webpack";

export function waitForComponent<T extends React.ComponentType<any> = React.ComponentType<any> & Record<string, any>>(name: string, filter: FilterFn | string | string[]): T {
    if (IS_DEV) lazyWebpackSearchHistory.push(["waitForComponent", Array.isArray(filter) ? filter : [filter]]);

    let myValue: T = function () {
        throw new Error(`Vencord could not find the ${name} Component`);
    } as any;

    const lazyComponent = LazyComponent(() => myValue) as T;
    waitFor(filter, (v: any) => {
        myValue = v;
        Object.assign(lazyComponent, v);
    }, { isIndirect: true });

    return lazyComponent;
}

export function waitForStore(name: string, cb: (v: any) => void) {
    if (IS_DEV) lazyWebpackSearchHistory.push(["waitForStore", [name]]);

    waitFor(filters.byStoreName(name), cb, { isIndirect: true });
}
