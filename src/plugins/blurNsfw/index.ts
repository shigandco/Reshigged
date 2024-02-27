/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

let style: HTMLStyleElement;

function setCss() {
    style.textContent = `
        .vc-nsfw-img [class^=imageWrapper] img,
        .vc-nsfw-img [class^=wrapperPaused] video {
            filter: blur(${Settings.plugins.BlurNSFW.blurAmount}px);
            transition: filter 0.2s;
        }
        .vc-nsfw-img [class^=imageWrapper]:hover img,
        .vc-nsfw-img [class^=wrapperPaused]:hover video {
            filter: unset;
        }
        `;
}

export default definePlugin({
    name: "BlurNSFW",
    description: "Blur attachments in NSFW channels until hovered",
    authors: [Devs.Ven],

    patches: [
        {
            find: ".embedWrapper,embed",
            replacement: [{
                match: /\.embedWrapper(?=.+?channel_id:(\i)\.id)/g,
                replace: "$&+($1.nsfw?' vc-nsfw-img':'')"
            }]
        }
    ],

    options: {
        blurAmount: {
            type: OptionType.NUMBER,
            description: "Blur Amount",
            default: 10,
            onChange: setCss
        }
    },

    start() {
        style = document.createElement("style");
        style.id = "VcBlurNsfw";
        document.head.appendChild(style);

        setCss();
    },

    stop() {
        style?.remove();
    }
});
