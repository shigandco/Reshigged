/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "oneko",
    description: "cat follow mouse (real)",
    // Listing adryd here because this literally just evals her script
    authors: [Devs.Ven, Devs.adryd],

    start() {
        fetch("https://raw.githubusercontent.com/adryd325/oneko.js/8fa8a1864aa71cd7a794d58bc139e755e96a236c/oneko.js")
            .then(x => x.text())
            .then(s => s.replace("./oneko.gif", "https://raw.githubusercontent.com/adryd325/oneko.js/14bab15a755d0e35cd4ae19c931d96d306f99f42/oneko.gif")
                .replace("(isReducedMotion)", "(false)"))
            .then(eval);
    },

    stop() {
        document.getElementById("oneko")?.remove();
    }
});
