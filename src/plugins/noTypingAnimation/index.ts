/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoTypingAnimation",
    authors: [Devs.AutumnVN],
    description: "Disables the CPU-intensive typing dots animation",
    patches: [{
        find: "dotCycle",
        replacement: {
            match: /document.hasFocus\(\)/,
            replace: "false"
        }
    }]
});
