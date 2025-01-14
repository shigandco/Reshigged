/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "BetterGifPicker",
    description: "Makes the gif picker open the favourite category by default",
    authors: [Devs.Samwich],
    patches: [
        {
            find: ".GIFPickerResultTypes.SEARCH",
            replacement: [{
                match: "this.state={resultType:null}",
                replace: 'this.state={resultType:"Favorites"}'
            }]
        }
    ]
});
