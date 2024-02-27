/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "iLoveSpam",
    description: "Do not hide messages from 'likely spammers'",
    authors: [Devs.botato, Devs.Nyako],
    patches: [
        {
            find: "hasFlag:{writable",
            replacement: {
                match: /if\((\i)<=(?:1<<30|1073741824)\)return/,
                replace: "if($1===(1<<20))return false;$&",
            },
        },
    ],
});
