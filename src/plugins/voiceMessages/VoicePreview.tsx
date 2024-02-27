/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useTimer } from "@utils/react";
import { findComponentByCodeLazy } from "@webpack";

import { cl } from "./utils";

interface VoiceMessageProps {
    src: string;
    waveform: string;
}
const VoiceMessage = findComponentByCodeLazy<VoiceMessageProps>("waveform:", "onVolumeChange");

export type VoicePreviewOptions = {
    src?: string;
    waveform: string;
    recording?: boolean;
};
export const VoicePreview = ({
    src,
    waveform,
    recording,
}: VoicePreviewOptions) => {
    const durationMs = useTimer({
        deps: [recording]
    });

    const durationSeconds = recording ? Math.floor(durationMs / 1000) : 0;
    const durationDisplay = Math.floor(durationSeconds / 60) + ":" + (durationSeconds % 60).toString().padStart(2, "0");

    if (src && !recording)
        return <VoiceMessage key={src} src={src} waveform={waveform} />;

    return (
        <div className={cl("preview", recording ? "preview-recording" : [])}>
            <div className={cl("preview-indicator")} />
            <div className={cl("preview-time")}>{durationDisplay}</div>
            <div className={cl("preview-label")}>{recording ? "RECORDING" : "----"}</div>
        </div>
    );
};
