/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoProfileThemes",
    description: "Completely removes Nitro profile themes",
    authors: [Devs.TheKodeToad],
    patches: [
        {
            find: ".NITRO_BANNER,",
            replacement: {
                // = isPremiumAtLeast(user.premiumType, TIER_2)
                match: /=(?=\i\.\i\.isPremiumAtLeast\(null==(\i))/,
                // = user.banner && isPremiumAtLeast(user.premiumType, TIER_2)
                replace: "=(arguments[0]?.bannerSrc||$1?.banner)&&"
            }
        },
        {
            find: ".avatarPositionPremiumNoBanner,default:",
            replacement: {
                // premiumUserWithoutBanner: foo().avatarPositionPremiumNoBanner, default: foo().avatarPositionNormal
                match: /\.avatarPositionPremiumNoBanner(?=,default:\i\.(\i))/,
                // premiumUserWithoutBanner: foo().avatarPositionNormal...
                replace: ".$1"
            }
        },
        {
            find: "hasThemeColors(){",
            replacement: {
                match: /get canUsePremiumProfileCustomization\(\){return /,
                replace: "$&false &&"
            }
        }
    ]
});
