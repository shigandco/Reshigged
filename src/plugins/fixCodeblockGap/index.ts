/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "FixCodeblockGap",
    description: "Removes the gap between codeblocks and text below it",
    authors: [Devs.Grzesiek11],
    patches: [
        {
            find: ".default.Messages.DELETED_ROLE_PLACEHOLDER",
            replacement: {
                match: String.raw`/^${"```"}(?:([a-z0-9_+\-.#]+?)\n)?\n*([^\n][^]*?)\n*${"```"}`,
                replace: "$&\\n?",
            },
        },
    ],
});
