/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { React } from "@webpack/common";

let ERROR_CODES: any;

export default definePlugin({
    name: "ReactErrorDecoder",
    description: 'Replaces "Minifed React Error" with the actual error.',
    authors: [Devs.Cyn, Devs.maisymoe],
    patches: [
        {
            find: '"https://reactjs.org/docs/error-decoder.html?invariant="',
            replacement: {
                match: /(function .\(.\)){(for\(var .="https:\/\/reactjs\.org\/docs\/error-decoder\.html\?invariant="\+.,.=1;.<arguments\.length;.\+\+\).\+="&args\[\]="\+encodeURIComponent\(arguments\[.\]\);return"Minified React error #"\+.\+"; visit "\+.\+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings.")}/,
                replace: (_, func, original) =>
                    `${func}{var decoded=$self.decodeError.apply(null, arguments);if(decoded)return decoded;${original}}`,
            },
        },
    ],

    async start() {
        const CODES_URL = `https://raw.githubusercontent.com/facebook/react/v${React.version}/scripts/error-codes/codes.json`;

        ERROR_CODES = await fetch(CODES_URL)
            .then(res => res.json())
            .catch(e => console.error("[ReactErrorDecoder] Failed to fetch React error codes\n", e));
    },

    stop() {
        ERROR_CODES = undefined;
    },

    decodeError(code: number, ...args: any) {
        let index = 0;
        return ERROR_CODES?.[code]?.replace(/%s/g, () => {
            const arg = args[index];
            index++;
            return arg;
        });
    },
});
