/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

if (!IS_UPDATER_DISABLED)
    import(IS_STANDALONE ? "./http" : "./git");
