const VARIANTS = {
  neutral: "bg-muted text-ink-700 border-border",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  amber: "bg-amber-100 text-amber-600 border-amber-100",
  success: "bg-emerald-50 text-success-500 border-emerald-100",
  danger: "bg-red-50 text-danger-500 border-red-100",
};

const Badge = ({ children, variant = "neutral", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
