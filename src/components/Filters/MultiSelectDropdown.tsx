"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type GroupedOptions = {
  label: string;
  options: string[];
};

type MultiSelectDropdownProps = {
  groupedOptions: GroupedOptions[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  label: string;
};

export default function MultiSelectDropdown({
  groupedOptions,
  selectedOptions,
  onChange,
  label,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle option selection
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((o) => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  // Button label: show selected count or default label
  const selectedCount = selectedOptions.length;
  const buttonLabel = selectedCount === 0 ? label : `${selectedCount} selected`;

  return (
    <div className="relative inline-block w-64" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-gray-300 hover:text-white transition flex items-center justify-between"
      >
        {buttonLabel}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-chevron-down"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
          >
            {groupedOptions.map(({ label, options }) => (
              <div key={label} className="p-2 border-b last:border-b-0">
                <p className="font-semibold text-gray-700 mb-1">{label}</p>
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer text-gray-800 hover:bg-gray-100 rounded px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={() => toggleOption(option)}
                      className="form-checkbox h-4 w-4"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
