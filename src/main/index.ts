/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { app, protocol, session } from "electron";
import { join } from "path";

import { ensureSafePath, getSettings } from "./ipcMain";
import { IS_VANILLA, THEMES_DIR } from "./utils/constants";
import { installExt } from "./utils/extensions";

if (IS_VESKTOP || !IS_VANILLA) {
    app.whenReady().then(() => {
        // Source Maps! Maybe there's a better way but since the renderer is executed
        // from a string I don't think any other form of sourcemaps would work
        protocol.registerFileProtocol("vencord", ({ url: unsafeUrl }, cb) => {
            let url = unsafeUrl.slice("vencord://".length);
            if (url.endsWith("/")) url = url.slice(0, -1);
            if (url.startsWith("/themes/")) {
                const theme = url.slice("/themes/".length);
                const safeUrl = ensureSafePath(THEMES_DIR, theme);
                if (!safeUrl) {
                    cb({ statusCode: 403 });
                    return;
                }
                cb(safeUrl.replace(/\?v=\d+$/, ""));
                return;
            }
            switch (url) {
                case "renderer.js.map":
                case "vencordDesktopRenderer.js.map":
                case "preload.js.map":
                case "vencordDesktopPreload.js.map":
                case "patcher.js.map":
                case "vencordDesktopMain.js.map":
                    cb(join(__dirname, url));
                    break;
                default:
                    cb({ statusCode: 403 });
            }
        });

        try {
            if (getSettings().enableReactDevtools)
                installExt("fmkadmapgofadopljbjfkapdkoienihi")
                    .then(() => console.info("[Reshigged] Installed React Developer Tools"))
                    .catch(err => console.error("[Reshigged] Failed to install React Developer Tools", err));
        } catch { }


        const findHeader = (headers: Record<string, string[]>, headerName: Lowercase<string>) => {
            return Object.keys(headers).find(h => h.toLowerCase() === headerName);
        };

        // Remove CSP
        type PolicyResult = Record<string, string[]>;

        const parsePolicy = (policy: string): PolicyResult => {
            const result: PolicyResult = {};
            policy.split(";").forEach(directive => {
                const [directiveKey, ...directiveValue] = directive.trim().split(/\s+/g);
                if (directiveKey && !Object.prototype.hasOwnProperty.call(result, directiveKey)) {
                    result[directiveKey] = directiveValue;
                }
            });

            return result;
        };
        const stringifyPolicy = (policy: PolicyResult): string =>
            Object.entries(policy)
                .filter(([, values]) => values?.length)
                .map(directive => directive.flat().join(" "))
                .join("; ");

        const patchCsp = (headers: Record<string, string[]>) => {
            const header = findHeader(headers, "content-security-policy");

            if (header) {
                const csp = parsePolicy(headers[header][0]);

                for (const directive of ["style-src", "connect-src", "img-src", "font-src", "media-src", "worker-src"]) {
                    csp[directive] ??= [];
                    csp[directive].push("*", "blob:", "data:", "vencord:", "'unsafe-inline'");
                }

                // TODO: Restrict this to only imported packages with fixed version.
                // Perhaps auto generate with esbuild
                csp["script-src"] ??= [];
                csp["script-src"].push("'unsafe-eval'", "https://unpkg.com", "https://cdnjs.cloudflare.com");
                headers[header] = [stringifyPolicy(csp)];
            }
        };

        session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders, resourceType }, cb) => {
            if (responseHeaders) {
                if (resourceType === "mainFrame")
                    patchCsp(responseHeaders);

                // Fix hosts that don't properly set the css content type, such as
                // raw.githubusercontent.com
                if (resourceType === "stylesheet") {
                    const header = findHeader(responseHeaders, "content-type");
                    if (header)
                        responseHeaders[header] = ["text/css"];
                }
            }

            cb({ cancel: false, responseHeaders });
        });

        // assign a noop to onHeadersReceived to prevent other mods from adding their own incompatible ones.
        // For instance, OpenAsar adds their own that doesn't fix content-type for stylesheets which makes it
        // impossible to load css from github raw despite our fix above
        session.defaultSession.webRequest.onHeadersReceived = () => { };
    });
}

if (IS_DISCORD_DESKTOP) {
    require("./patcher");
}
