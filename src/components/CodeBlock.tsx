/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy } from "@webpack";
import { Parser } from "@webpack/common";

const CodeContainerClasses = findByPropsLazy("markup", "codeContainer");

/**
 * Renders code in a Discord codeblock
 */
export function CodeBlock(props: { content?: string, lang: string; }) {
    return (
        <div className={CodeContainerClasses.markup}>
            {Parser.defaultRules.codeBlock.react(props, null, {})}
        </div>
    );
}
