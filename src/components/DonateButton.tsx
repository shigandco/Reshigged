/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@webpack/common";

import { Heart } from "./Heart";

export default function DonateButton(props: any) {
    return (
        <Button
            {...props}
            look={Button.Looks.LINK}
            color={Button.Colors.TRANSPARENT}
            onClick={() => VencordNative.native.openExternal("https://github.com/sponsors/Vendicated")}
        >
            <Heart />
            Donate
        </Button>
    );
}
