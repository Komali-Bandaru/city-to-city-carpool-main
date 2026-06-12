import React, { useState, useRef } from "react";

type Props = {
  onConfirm: () => void;
  onCancel?: () => void;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

// Simple accessible slider-based confirm control using <input type="range">.
// When the user slides to 100, we call onConfirm and reset the slider.
export default function SlideToConfirm({ onConfirm, onCancel, label = "Slide to accept", confirmLabel = "Accept", cancelLabel = "Decline" }: Props) {
  const [value, setValue] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [disabled, setDisabled] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setValue(v);
    if (v >= 100 && !disabled) {
      setDisabled(true);
      // small delay so user sees the knob at the end
      setTimeout(() => {
        onConfirm();
        setValue(0);
        setDisabled(false);
        if (inputRef.current) inputRef.current.blur();
      }, 250);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    // allow Enter to confirm when value is > 50
    if (e.key === "Enter" && value >= 50 && !disabled) {
      setDisabled(true);
      setTimeout(() => {
        onConfirm();
        setValue(0);
        setDisabled(false);
      }, 150);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="text-sm text-white/90 mb-1">{label}</div>
        <div className="relative">
          <input
            ref={inputRef}
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            disabled={disabled}
            className="w-full h-10 appearance-none rounded-full bg-slate-600/40"
            aria-label={label}
          />
          <div className="absolute left-1 top-1 bottom-1 w-20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/10 text-white px-2 py-1 rounded">{value}%</div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => {
            if (disabled) return;
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        {onCancel ? (
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
            onClick={() => onCancel()}
          >
            {cancelLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
