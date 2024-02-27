/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy, findLazy } from "@webpack";
import { i18n, useToken } from "@webpack/common";

const ColorMap = findLazy(m => m.colors?.INTERACTIVE_MUTED?.css);
const VerifiedIconComponent = findComponentByCodeLazy(".CONNECTIONS_ROLE_OFFICIAL_ICON_TOOLTIP");

export function VerifiedIcon() {
    const color = useToken(ColorMap.colors.INTERACTIVE_MUTED).hex();
    const forcedIconColor = useToken(ColorMap.colors.INTERACTIVE_ACTIVE).hex();

    return (
        <VerifiedIconComponent
            color={color}
            forcedIconColor={forcedIconColor}
            size={16}
            tooltipText={i18n.Messages.CONNECTION_VERIFIED}
        />
    );
}
