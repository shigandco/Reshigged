/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { makeLazy } from "./lazy";
import { EXTENSION_BASE_URL } from "./web-metadata";

/*
    Add dynamically loaded dependencies for plugins here.
 */

// needed to parse APNGs in the nitroBypass plugin
export const importApngJs = makeLazy(() => {
    return require("./apng-canvas").APNG as { parseURL(url: string): Promise<ApngFrameData>; };
});

// https://wiki.mozilla.org/APNG_Specification#.60fcTL.60:_The_Frame_Control_Chunk
export const enum ApngDisposeOp {
    /**
     * no disposal is done on this frame before rendering the next; the contents of the output buffer are left as is.
     */
    NONE,
    /**
     * the frame's region of the output buffer is to be cleared to fully transparent black before rendering the next frame.
     */
    BACKGROUND,
    /**
     * the frame's region of the output buffer is to be reverted to the previous contents before rendering the next frame.
     */
    PREVIOUS
}

// TODO: Might need to somehow implement this
export const enum ApngBlendOp {
    SOURCE,
    OVER
}
export interface ApngFrame {
    left: number;
    top: number;
    width: number;
    height: number;
    img: HTMLImageElement;
    delay: number;
    blendOp: ApngBlendOp;
    disposeOp: ApngDisposeOp;
}

export interface ApngFrameData {
    width: number;
    height: number;
    frames: ApngFrame[];
    playTime: number;
}

// On web (extensions), use extension uri as basepath (load files from extension)
// On desktop (electron), load from cdn
export const rnnoiseDist = IS_EXTENSION
    ? new URL("/third-party/rnnoise", EXTENSION_BASE_URL).toString()
    : "https://unpkg.com/@sapphi-red/web-noise-suppressor@0.3.3/dist";
export const rnnoiseWasmSrc = (simd = false) => `${rnnoiseDist}/rnnoise${simd ? "_simd" : ""}.wasm`;
export const rnnoiseWorkletSrc = `${rnnoiseDist}/rnnoise/workletProcessor.js`;


// The below code is only used on the Desktop (electron) build of Vencord.
// Browser (extension) builds do not contain these remote imports.

export const shikiWorkerSrc = `https://unpkg.com/@vap/shiki-worker@0.0.8/dist/${IS_DEV ? "index.js" : "index.min.js"}`;
export const shikiOnigasmSrc = "https://unpkg.com/@vap/shiki@0.10.3/dist/onig.wasm";

// @ts-expect-error
export const getStegCloak = /* #__PURE__*/ makeLazy(() => import("https://unpkg.com/stegcloak-dist@1.0.0/index.js"));
