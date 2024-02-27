/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function Badge({ text, color }): JSX.Element {
    return (
        <div className="vc-plugins-badge" style={{
            backgroundColor: color,
            justifySelf: "flex-end",
            marginLeft: "auto"
        }}>
            {text}
        </div>
    );
}
