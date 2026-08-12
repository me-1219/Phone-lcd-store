import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import { QUALITY_GRADES, SCREEN_TYPES } from "../../utils/constants";

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-medium text-ink-950"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

// categories: [{ _id, name }] — passed in from the page, fetched via categoryService
// brands: string[] — derived from the current product list or passed in statically
const ProductFilter = ({ filters, onChange, categories = [], brands = [], onClose }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value || undefined });

  const clearAll = () => onChange({});

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-500" />
          <h2 className="font-display text-sm font-semibold text-ink-950">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Clear all
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="rounded-lg p-1 text-ink-500 hover:bg-muted lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <FilterSection title="Category">
        <select
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.name}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Brand">
        <select
          value={filters.brand || ""}
          onChange={(e) => update("brand", e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Compatible Model">
        <Input
          placeholder="e.g. iPhone 11"
          value={filters.compatibleModel || ""}
          onChange={(e) => update("compatibleModel", e.target.value)}
        />
      </FilterSection>

      <FilterSection title="Quality Grade">
        <div className="flex flex-col gap-2">
          {QUALITY_GRADES.map((grade) => (
            <label key={grade} className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="radio"
                name="qualityGrade"
                checked={filters.qualityGrade === grade}
                onChange={() => update("qualityGrade", grade)}
                className="h-4 w-4 accent-brand-600"
              />
              {grade}
            </label>
          ))}
          {filters.qualityGrade && (
            <button
              onClick={() => update("qualityGrade", undefined)}
              className="w-fit text-xs text-brand-600 hover:underline"
            >
              Clear grade
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Screen Type">
        <div className="flex flex-wrap gap-2">
          {SCREEN_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                update("screenType", filters.screenType === type ? undefined : type)
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.screenType === type
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-white text-ink-700 hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range (ETB)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => update("minPrice", e.target.value)}
          />
          <span className="text-ink-300">–</span>
          <Input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </div>
      </FilterSection>

      <Button variant="outline" fullWidth size="sm" className="mt-4 lg:hidden" onClick={onClose}>
        Show results
      </Button>
    </div>
  );
};

export default ProductFilter;