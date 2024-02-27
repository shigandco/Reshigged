/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    addPreEditListener,
    addPreSendListener,
    MessageObject,
    removePreEditListener,
    removePreSendListener
} from "@api/MessageEvents";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import { defaultRules } from "./defaultRules";

// From lodash
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export default definePlugin({
    name: "ClearURLs",
    description: "Removes tracking garbage from URLs",
    authors: [Devs.adryd],
    dependencies: ["MessageEventsAPI"],

    escapeRegExp(str: string) {
        return (str && reHasRegExpChar.test(str))
            ? str.replace(reRegExpChar, "\\$&")
            : (str || "");
    },

    createRules() {
        // Can be extended upon once user configs are available
        // Eg. (useDefaultRules: boolean, customRules: Array[string])
        const rules = defaultRules;

        this.universalRules = new Set();
        this.rulesByHost = new Map();
        this.hostRules = new Map();

        for (const rule of rules) {
            const splitRule = rule.split("@");
            const paramRule = new RegExp(
                "^" +
                this.escapeRegExp(splitRule[0]).replace(/\\\*/, ".+?") +
                "$"
            );

            if (!splitRule[1]) {
                this.universalRules.add(paramRule);
                continue;
            }
            const hostRule = new RegExp(
                "^(www\\.)?" +
                this.escapeRegExp(splitRule[1])
                    .replace(/\\\./, "\\.")
                    .replace(/^\\\*\\\./, "(.+?\\.)?")
                    .replace(/\\\*/, ".+?") +
                "$"
            );
            const hostRuleIndex = hostRule.toString();

            this.hostRules.set(hostRuleIndex, hostRule);
            if (this.rulesByHost.get(hostRuleIndex) == null) {
                this.rulesByHost.set(hostRuleIndex, new Set());
            }
            this.rulesByHost.get(hostRuleIndex).add(paramRule);
        }
    },

    removeParam(rule: string | RegExp, param: string, parent: URLSearchParams) {
        if (param === rule || rule instanceof RegExp && rule.test(param)) {
            parent.delete(param);
        }
    },

    replacer(match: string) {
        // Parse URL without throwing errors
        try {
            var url = new URL(match);
        } catch (error) {
            // Don't modify anything if we can't parse the URL
            return match;
        }

        // Cheap way to check if there are any search params
        if (url.searchParams.entries().next().done) {
            // If there are none, we don't need to modify anything
            return match;
        }

        // Check all universal rules
        this.universalRules.forEach(rule => {
            url.searchParams.forEach((_value, param, parent) => {
                this.removeParam(rule, param, parent);
            });
        });

        // Check rules for each hosts that match
        this.hostRules.forEach((regex, hostRuleName) => {
            if (!regex.test(url.hostname)) return;
            this.rulesByHost.get(hostRuleName).forEach(rule => {
                url.searchParams.forEach((_value, param, parent) => {
                    this.removeParam(rule, param, parent);
                });
            });
        });

        return url.toString();
    },

    onSend(msg: MessageObject) {
        // Only run on messages that contain URLs
        if (msg.content.match(/http(s)?:\/\//)) {
            msg.content = msg.content.replace(
                /(https?:\/\/[^\s<]+[^<.,:;"'>)|\]\s])/g,
                match => this.replacer(match)
            );
        }
    },

    start() {
        this.createRules();
        this.preSend = addPreSendListener((_, msg) => this.onSend(msg));
        this.preEdit = addPreEditListener((_cid, _mid, msg) =>
            this.onSend(msg)
        );
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    },
});
