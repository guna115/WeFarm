'use client';

import { Search, X } from 'lucide-react';
import { useState, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search plants, nurseries...',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-2 transition-all duration-200 ${
        focused
          ? 'border-primary-500 shadow-lg shadow-primary-500/10'
          : 'border-surface-200 shadow-sm'
      }`}
    >
      <Search
        className={`w-5 h-5 flex-shrink-0 transition-colors ${
          focused ? 'text-primary-600' : 'text-surface-400'
        }`}
      />
      <input
        ref={inputRef}
        id="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm font-medium text-surface-800 placeholder:text-surface-400 outline-none"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-100 hover:bg-surface-200 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5 text-surface-500" />
        </button>
      )}
    </div>
  );
}
