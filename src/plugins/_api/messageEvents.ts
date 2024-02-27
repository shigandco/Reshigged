/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "MessageEventsAPI",
    description: "Api required by anything using message events.",
    authors: [Devs.Arjix, Devs.hunt, Devs.Ven],
    patches: [
        {
            find: ".Messages.EDIT_TEXTAREA_HELP",
            replacement: {
                match: /(?<=,channel:\i\}\)\.then\().+?(?=return \i\.content!==this\.props\.message\.content&&\i\((.+?)\))/,
                replace: (match, args) => "" +
                    `async ${match}` +
                    `if(await Vencord.Api.MessageEvents._handlePreEdit(${args}))` +
                    "return Promise.resolve({shoudClear:true,shouldRefocus:true});"
            }
        },
        {
            find: ".handleSendMessage=",
            replacement: {
                // props.chatInputType...then((function(isMessageValid)... var parsedMessage = b.c.parse(channel,... var replyOptions = f.g.getSendMessageOptionsForReply(pendingReply);
                // Lookbehind: validateMessage)({openWarningPopout:..., type: i.props.chatInputType, content: t, stickers: r, ...}).then((function(isMessageValid)
                match: /(type:this\.props\.chatInputType.+?\.then\()(\i=>\{.+?let (\i)=\i\.\i\.parse\((\i),.+?let (\i)=\i\.\i\.getSendMessageOptionsForReply\(\i\);)(?<=\)\(({.+?})\)\.then.+?)/,
                // props.chatInputType...then((async function(isMessageValid)... var replyOptions = f.g.getSendMessageOptionsForReply(pendingReply); if(await Vencord.api...) return { shoudClear:true, shouldRefocus:true };
                replace: (_, rest1, rest2, parsedMessage, channel, replyOptions, extra) => "" +
                    `${rest1}async ${rest2}` +
                    `if(await Vencord.Api.MessageEvents._handlePreSend(${channel}.id,${parsedMessage},${extra},${replyOptions}))` +
                    "return{shoudClear:true,shouldRefocus:true};"
            }
        },
        {
            find: '("interactionUsernameProfile',
            replacement: {
                match: /let\{id:\i}=(\i),{id:\i}=(\i);return \i\.useCallback\((\i)=>\{/,
                replace: (m, message, channel, event) =>
                    // the message param is shadowed by the event param, so need to alias them
                    `const vcMsg=${message},vcChan=${channel};${m}Vencord.Api.MessageEvents._handleClick(vcMsg, vcChan, ${event});`
            }
        }
    ]
});
