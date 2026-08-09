const Input = ({ label, error, icon: Icon, className = "", id, ...props }) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink-900"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        )}
        <input
          id={inputId}
          className={`
            h-10 w-full rounded-lg border bg-white text-sm text-ink-950
            placeholder:text-ink-300 transition-colors
            ${Icon ? "pl-9 pr-3" : "px-3"}
            ${error ? "border-danger-500" : "border-border focus:border-brand-500"}
            focus:outline-none focus:ring-2 focus:ring-brand-500/20
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
  );
};

export default Input;
