/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { findByPropsLazy } from "@webpack";
import { Forms, React } from "@webpack/common";

interface AppStartPerformance {
    prefix: string;
    logs: Log[];
    logGroups: LogGroup[];
    endTime_: number;
    isTracing_: boolean;
}

interface LogGroup {
    index: number;
    timestamp: number;
    logs: Log[];
    nativeLogs: any[];
    serverTrace: string;
}

interface Log {
    emoji: string;
    prefix: string;
    log: string;
    timestamp?: number;
    delta?: number;
}

const AppStartPerformance = findByPropsLazy("markWithDelta", "markAndLog", "markAt") as AppStartPerformance;

interface TimerItemProps extends Log {
    instance: {
        sinceStart: number;
        sinceLast: number;
    };
}

function TimerItem({ emoji, prefix, log, delta, instance }: TimerItemProps) {
    return (
        <React.Fragment>
            <span>{instance.sinceStart.toFixed(3)}s</span>
            <span>{instance.sinceLast.toFixed(3)}s</span>
            <span>{delta?.toFixed(0) ?? ""}</span>
            <span><pre>{emoji} {prefix ?? " "}{log}</pre></span>
        </React.Fragment>
    );
}

interface TimingSectionProps {
    title: string;
    logs: Log[];
    traceEnd?: number;
}

function TimingSection({ title, logs, traceEnd }: TimingSectionProps) {
    const startTime = logs.find(l => l.timestamp)?.timestamp ?? 0;

    let lastTimestamp = startTime;
    const timings = logs.map(log => {
        // Get last log entry with valid timestamp
        const timestamp = log.timestamp ?? lastTimestamp;

        const sinceStart = (timestamp - startTime) / 1000;
        const sinceLast = (timestamp - lastTimestamp) / 1000;

        lastTimestamp = timestamp;

        return { sinceStart, sinceLast };
    });

    return (
        <Forms.FormSection title={title} tag="h1">
            <code>
                {traceEnd && (
                    <div style={{ color: "var(--header-primary)", marginBottom: 5, userSelect: "text" }}>
                        Trace ended at: {(new Date(traceEnd)).toTimeString()}
                    </div>
                )}
                <div style={{ color: "var(--header-primary)", display: "grid", gridTemplateColumns: "repeat(3, auto) 1fr", gap: "2px 10px", userSelect: "text" }}>
                    <span>Start</span>
                    <span>Interval</span>
                    <span>Delta</span>
                    <span style={{ marginBottom: 5 }}>Event</span>
                    {AppStartPerformance.logs.map((log, i) => (
                        <TimerItem key={i} {...log} instance={timings[i]} />
                    ))}
                </div>
            </code>
        </Forms.FormSection>
    );
}

interface ServerTraceProps {
    trace: string;
}

function ServerTrace({ trace }: ServerTraceProps) {
    const lines = trace.split("\n");

    return (
        <Forms.FormSection title="Server Trace" tag="h2">
            <code>
                <Flex flexDirection="column" style={{ color: "var(--header-primary)", gap: 5, userSelect: "text" }}>
                    {lines.map(line => (
                        <span>{line}</span>
                    ))}
                </Flex>
            </code>
        </Forms.FormSection>
    );
}

function StartupTimingPage() {
    if (!AppStartPerformance?.logs) return <div>Loading...</div>;

    const serverTrace = AppStartPerformance.logGroups.find(g => g.serverTrace)?.serverTrace;

    return (
        <React.Fragment>
            <TimingSection
                title="Startup Timings"
                logs={AppStartPerformance.logs}
                traceEnd={AppStartPerformance.endTime_}
            />
            {/* Lazy Divider */}
            <div style={{ marginTop: 5 }}>&nbsp;</div>
            {serverTrace && <ServerTrace trace={serverTrace} />}
        </React.Fragment>
    );
}

export default ErrorBoundary.wrap(StartupTimingPage);
