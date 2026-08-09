import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

// Debounced search input for the Products page itself (separate from the
// navbar's search-and-navigate bar — this one filters in place).
const ProductSearch = ({ value = "", onSearch, placeholder = "Search products...", delay = 400 }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) onSearch(inputValue);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-border bg-white pl-9 pr-9 text-sm placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue("");
            onSearch("");
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;