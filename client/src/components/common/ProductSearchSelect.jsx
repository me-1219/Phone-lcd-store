import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ImageOff } from "lucide-react";
import * as productService from "../../services/productService";

// value: selected product object ({ _id, name, ... }) or null
// onChange(product): called with the full product object on selection, or null on clear
const ProductSearchSelect = ({ value, onChange, placeholder = "Search product by name, brand, or SKU..." }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await productService.searchProducts(q.trim());
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product) => {
    onChange(product);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  // Already have a product selected — show it as a resolved chip instead
  // of the search input, so it's unambiguous what will actually be adjusted.
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
          {value.images?.[0] ? (
            <img src={value.images[0]} alt={value.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-4 w-4 text-ink-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-950">{value.name}</p>
          <p className="font-mono-data text-xs text-ink-500">
            {value.sku || "No SKU"} · Stock: {value.stock ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear selected product"
          className="shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-white hover:text-danger-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
          {loading ? (
            <p className="px-3 py-3 text-sm text-ink-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-ink-500">No products found.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {results.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted"
                >
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-3.5 w-3.5 text-ink-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-950">{product.name}</p>
                    <p className="font-mono-data text-xs text-ink-500">
                      {product.sku || "No SKU"} · Stock: {product.stock}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchSelect;