/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";

const { closeExpressionPicker } = findByPropsLazy("closeExpressionPicker");

export default definePlugin({
    name: "GifPaste",
    description: "Makes picking a gif in the gif picker insert a link into the chatbox instead of instantly sending it",
    authors: [Devs.Ven],

    patches: [{
        find: ".handleSelectGIF=",
        replacement: {
            match: /\.handleSelectGIF=(\i)=>\{/,
            replace: ".handleSelectGIF=$1=>{if (!this.props.className) return $self.handleSelect($1);"
        }
    }],

    handleSelect(gif?: { url: string; }) {
        if (gif) {
            insertTextIntoChatInputBox(gif.url + " ");
            closeExpressionPicker();
        }
    }
});
