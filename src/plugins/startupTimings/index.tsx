/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import { LazyComponent } from "@utils/react";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "StartupTimings",
    description: "Adds Startup Timings to the Settings menu",
    authors: [Devs.Megu],
    patches: [{
        find: "UserSettingsSections.PAYMENT_FLOW_MODAL_TEST_PAGE,",
        replacement: {
            match: /{section:\i\.UserSettingsSections\.PAYMENT_FLOW_MODAL_TEST_PAGE/,
            replace: '{section:"StartupTimings",label:"Startup Timings",element:$self.StartupTimingPage},$&'
        }
    }],
    StartupTimingPage: LazyComponent(() => require("./StartupTimingPage").default)
});
