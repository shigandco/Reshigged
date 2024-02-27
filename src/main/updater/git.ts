/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcEvents } from "@utils/IpcEvents";
import { execFile as cpExecFile } from "child_process";
import { ipcMain } from "electron";
import { join } from "path";
import { promisify } from "util";

import { serializeErrors } from "./common";

const VENCORD_SRC_DIR = join(__dirname, "..");

const execFile = promisify(cpExecFile);

const isFlatpak = process.platform === "linux" && Boolean(process.env.FLATPAK_ID?.includes("discordapp") || process.env.FLATPAK_ID?.includes("Discord"));

if (process.platform === "darwin") process.env.PATH = `/usr/local/bin:${process.env.PATH}`;

function git(...args: string[]) {
    const opts = { cwd: VENCORD_SRC_DIR };

    if (isFlatpak) return execFile("flatpak-spawn", ["--host", "git", ...args], opts);
    else return execFile("git", args, opts);
}

async function getRepo() {
    const res = await git("remote", "get-url", "origin");
    return res.stdout.trim()
        .replace(/git@(.+):/, "https://$1/")
        .replace(/\.git$/, "");
}

async function calculateGitChanges() {
    await git("fetch");

    const branch = await git("branch", "--show-current");

    const res = await git("log", `HEAD...origin/${branch.stdout.trim()}`, "--pretty=format:%an/%h/%s");

    const commits = res.stdout.trim();
    return commits ? commits.split("\n").map(line => {
        const [author, hash, ...rest] = line.split("/");
        return {
            hash, author, message: rest.join("/")
        };
    }) : [];
}

async function pull() {
    const res = await git("pull");
    return res.stdout.includes("Fast-forward");
}

async function build() {
    const opts = { cwd: VENCORD_SRC_DIR };

    const command = isFlatpak ? "flatpak-spawn" : "node";
    const args = isFlatpak ? ["--host", "node", "scripts/build/build.mjs"] : ["scripts/build/build.mjs"];

    if (IS_DEV) args.push("--dev");

    const res = await execFile(command, args, opts);

    return !res.stderr.includes("Build failed");
}

ipcMain.handle(IpcEvents.GET_REPO, serializeErrors(getRepo));
ipcMain.handle(IpcEvents.GET_UPDATES, serializeErrors(calculateGitChanges));
ipcMain.handle(IpcEvents.UPDATE, serializeErrors(pull));
ipcMain.handle(IpcEvents.BUILD, serializeErrors(build));
