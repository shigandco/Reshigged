/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PlusIcon } from "@components/Icons";
import { i18n, Text } from "@webpack/common";
import { HTMLProps } from "react";

import { DecorationGridItem } from ".";

type DecorationGridCreateProps = HTMLProps<HTMLDivElement> & {
    onSelect: () => void;
};

export default function DecorationGridCreate(props: DecorationGridCreateProps) {
    return <DecorationGridItem
        {...props}
        isSelected={false}
    >
        <PlusIcon />
        <Text
            variant="text-xs/normal"
            color="header-primary"
        >
            {i18n.Messages.CREATE}
        </Text>
    </DecorationGridItem >;
}
