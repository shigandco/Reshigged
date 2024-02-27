/*
 * Reshigged, a Discord client mod
 * forked from vencord
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PluginOptionSlider } from "@utils/types";
import { Forms, React, Slider } from "@webpack/common";

import { ISettingElementProps } from ".";

export function makeRange(start: number, end: number, step = 1) {
    const ranges: number[] = [];
    for (let value = start; value <= end; value += step) {
        ranges.push(Math.round(value * 100) / 100);
    }
    return ranges;
}

export function SettingSliderComponent({ option, pluginSettings, definedSettings, id, onChange, onError }: ISettingElementProps<PluginOptionSlider>) {
    const def = pluginSettings[id] ?? option.default;

    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        onError(error !== null);
    }, [error]);

    function handleChange(newValue: number): void {
        const isValid = option.isValid?.call(definedSettings, newValue) ?? true;
        if (typeof isValid === "string") setError(isValid);
        else if (!isValid) setError("Invalid input provided.");
        else {
            setError(null);
            onChange(newValue);
        }
    }

    return (
        <Forms.FormSection>
            <Forms.FormTitle>{option.description}</Forms.FormTitle>
            <Slider
                disabled={option.disabled?.call(definedSettings) ?? false}
                markers={option.markers}
                minValue={option.markers[0]}
                maxValue={option.markers[option.markers.length - 1]}
                initialValue={def}
                onValueChange={handleChange}
                onValueRender={(v: number) => String(v.toFixed(2))}
                stickToMarkers={option.stickToMarkers ?? true}
                {...option.componentProps}
            />
        </Forms.FormSection>
    );
}

