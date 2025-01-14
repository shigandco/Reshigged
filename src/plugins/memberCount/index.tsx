/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { getCurrentChannel } from "@utils/discord";
import definePlugin from "@utils/types";
import { findStoreLazy } from "@webpack";
import { SelectedChannelStore, Tooltip, useStateFromStores } from "@webpack/common";
import { FluxStore } from "@webpack/types";

const GuildMemberCountStore = findStoreLazy("GuildMemberCountStore") as FluxStore & { getMemberCount(guildId: string): number | null; };
const ChannelMemberStore = findStoreLazy("ChannelMemberStore") as FluxStore & {
    getProps(guildId: string, channelId: string): { groups: { count: number; id: string; }[]; };
};

const sharedIntlNumberFormat = new Intl.NumberFormat();
const numberFormat = (value: number) => sharedIntlNumberFormat.format(value);

function MemberCount() {
    const { id: channelId, guild_id: guildId } = useStateFromStores([SelectedChannelStore], () => getCurrentChannel());
    const { groups } = useStateFromStores(
        [ChannelMemberStore],
        () => ChannelMemberStore.getProps(guildId, channelId)
    );
    const total = useStateFromStores(
        [GuildMemberCountStore],
        () => GuildMemberCountStore.getMemberCount(guildId)
    );

    if (total == null)
        return null;

    const online =
        (groups.length === 1 && groups[0].id === "unknown")
            ? 0
            : groups.reduce((count, curr) => count + (curr.id === "offline" ? 0 : curr.count), 0);

    return (
        <Flex id="vc-membercount" style={{
            marginTop: "1em",
            paddingInline: "1em",
            justifyContent: "center",
            alignContent: "center",
            gap: 0
        }}>
            <Tooltip text={`${numberFormat(online)} online in this channel`} position="bottom">
                {props => (
                    <div {...props}>
                        <span
                            style={{
                                backgroundColor: "var(--green-360)",
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                display: "inline-block",
                                marginRight: "0.5em"
                            }}
                        />
                        <span style={{ color: "var(--green-360)" }}>{numberFormat(online)}</span>
                    </div>
                )}
            </Tooltip>
            <Tooltip text={`${numberFormat(total)} total server members`} position="bottom">
                {props => (
                    <div {...props}>
                        <span
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                border: "3px solid var(--primary-400)",
                                display: "inline-block",
                                marginRight: "0.5em",
                                marginLeft: "1em"
                            }}
                        />
                        <span style={{ color: "var(--primary-400)" }}>{numberFormat(total)}</span>
                    </div>
                )}
            </Tooltip>
        </Flex>
    );
}

export default definePlugin({
    name: "MemberCount",
    description: "Shows the amount of online & total members in the server member list",
    authors: [Devs.Ven, Devs.Commandtechno],

    patches: [{
        find: "{isSidebarVisible:",
        replacement: {
            match: /(?<=let\{className:(\i),.+?children):\[(\i\.useMemo[^}]+"aria-multiselectable")/,
            replace: ":[$1?.startsWith('members')?$self.render():null,$2"
        }
    }],

    render: ErrorBoundary.wrap(MemberCount, { noop: true })
});
