/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoScreensharePreview",
    description: "Disables screenshare previews from being sent.",
    authors: [Devs.Nuckyz],
    patches: [
        {
            find: '"ApplicationStreamPreviewUploadManager"',
            replacement: {
                match: /await \i\.\i\.(makeChunkedRequest\(|post\(\{url:)\i\.\i\.STREAM_PREVIEW.+?\}\)/g,
                replace: "0"
            }
        }
    ]
});
