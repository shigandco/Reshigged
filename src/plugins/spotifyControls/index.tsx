/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "@api/Settings";
import { disableStyle, enableStyle } from "@api/Styles";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

import hoverOnlyStyle from "./hoverOnly.css?managed";
import { Player } from "./PlayerComponent";

function toggleHoverControls(value: boolean) {
    (value ? enableStyle : disableStyle)(hoverOnlyStyle);
}

export default definePlugin({
    name: "SpotifyControls",
    description: "Adds a Spotify player above the account panel",
    authors: [Devs.Ven, Devs.afn, Devs.KraXen72, Devs.Av32000],
    options: {
        hoverControls: {
            description: "Show controls on hover",
            type: OptionType.BOOLEAN,
            default: false,
            onChange: v => toggleHoverControls(v)
        },
        useSpotifyUris: {
            type: OptionType.BOOLEAN,
            description: "Open Spotify URIs instead of Spotify URLs. Will only work if you have Spotify installed and might not work on all platforms",
            default: false
        }
    },
    patches: [
        {
            find: "showTaglessAccountPanel:",
            replacement: {
                // return React.createElement(AccountPanel, { ..., showTaglessAccountPanel: blah })
                match: /return ?(.{0,30}\(.{1,3},\{[^}]+?,showTaglessAccountPanel:.+?\}\))/,
                // return [Player, Panel]
                replace: "return [$self.renderPlayer(),$1]"
            }
        },
        {
            find: ".PLAYER_DEVICES",
            replacement: [{
                // Adds POST and a Marker to the SpotifyAPI (so we can easily find it)
                match: /get:(\i)\.bind\(null,(\i\.\i)\.get\)/,
                replace: "post:$1.bind(null,$2.post),$&"
            },
            {
                // Spotify Connect API returns status 202 instead of 204 when skipping tracks.
                // Discord rejects 202 which causes the request to send twice. This patch prevents this.
                match: /202===\i\.status/,
                replace: "false",
            }]
        },
        // Discord doesn't give you the repeat kind, only a boolean
        {
            find: 'repeat:"off"!==',
            replacement: {
                match: /repeat:"off"!==(.{1,3}),/,
                replace: "actual_repeat:$1,$&"
            }
        }
    ],
    start: () => toggleHoverControls(Settings.plugins.SpotifyControls.hoverControls),
    renderPlayer: () => <Player />
});
