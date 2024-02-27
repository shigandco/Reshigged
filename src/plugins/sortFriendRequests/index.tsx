/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { RelationshipStore } from "@webpack/common";
import { User } from "discord-types/general";

const settings = definePluginSettings({
    showDates: {
        type: OptionType.BOOLEAN,
        description: "Show dates on friend requests",
        default: false,
        restartNeeded: true
    }
});

export default definePlugin({
    name: "SortFriendRequests",
    authors: [Devs.Megu],
    description: "Sorts friend requests by date of receipt",
    settings,

    patches: [{
        find: "getRelationshipCounts(){",
        replacement: {
            match: /\.sortBy\(\i=>\i\.comparator\)/,
            replace: ".sortBy((row) => $self.sortList(row))"
        }
    }, {
        find: ".Messages.FRIEND_REQUEST_CANCEL",
        replacement: {
            predicate: () => settings.store.showDates,
            match: /subText:(\i)(?=,className:\i\.userInfo}\))(?<=user:(\i).+?)/,
            replace: (_, subtext, user) => `subText:$self.makeSubtext(${subtext},${user})`
        }
    }],

    sortList(row: any) {
        return row.type === 3 || row.type === 4
            ? -this.getSince(row.user)
            : row.comparator;
    },

    getSince(user: User) {
        return new Date(RelationshipStore.getSince(user.id));
    },

    makeSubtext(text: string, user: User) {
        const since = this.getSince(user);
        return (
            <Flex flexDirection="row" style={{ gap: 0, flexWrap: "wrap", lineHeight: "0.9rem" }}>
                <span>{text}</span>
                {!isNaN(since.getTime()) && <span>Received &mdash; {since.toDateString()}</span>}
            </Flex>
        );
    }
});
