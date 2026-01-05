/**
 * DimensionSlider component using Radix UI Slider.
 * Styled for scientific paper aesthetic.
 */

import * as Slider from "@radix-ui/react-slider";
import { cn } from "../lib/utils";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  observation?: string;
}

export function DimensionSlider({ label, value, min, max, onChange, observation }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex justify-between items-baseline">
        <span className="font-medium capitalize text-[0.9rem]">{label}</span>
        <span className="font-mono text-base font-medium">{value}</span>
      </div>

      {/* Radix Slider */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="bg-[var(--color-border)] relative grow h-[6px]">
          <Slider.Range className="absolute bg-[var(--color-ink)] h-full" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            "block w-4 h-4 bg-[var(--color-ink)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2",
            "hover:bg-[var(--color-ink-light)] transition-colors cursor-pointer"
          )}
          aria-label={label}
        />
      </Slider.Root>

      {/* Observation */}
      {observation && (
        <p className="text-[0.8rem] text-[var(--color-ink-muted)] italic">
          "{observation}"
        </p>
      )}
    </div>
  );
}
