import React, { useState, KeyboardEvent } from "react";

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T = string | number> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  noOptionsText?: string;
}

export default function Select<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  label,
  error,
  disabled = false,
  clearable = false,
  noOptionsText = "No options found",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o.value === value);

  const handleSelect = (opt: SelectOption<T>) => {
    if (!opt.disabled) {
      onChange(opt.value);
      setOpen(false);
      setSearch("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg text-sm cursor-pointer
        ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        ${error ? "border-red-400" : "border-gray-300"}`}
      >
        <span className={!selected ? "text-gray-400" : ""}>
          {selected ? selected.label : placeholder}
        </span>

        {clearable && selected && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-md">
          {/* Search */}
          <div className="p-2 border-b">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder={searchPlaceholder}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>

          {/* Options */}
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">
                {noOptionsText}
              </li>
            ) : (
              filtered.map((opt, index) => (
                <li
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50
                    ${opt.value === value ? "bg-blue-100 text-blue-600" : ""}
                    ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
