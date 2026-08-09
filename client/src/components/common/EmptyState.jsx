import { PackageSearch } from "lucide-react";

const EmptyState = ({
  icon: Icon = PackageSearch,
  title = "Nothing here yet",
  message,
  action,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white px-6 py-14 text-center">
    <div className="rounded-full bg-muted p-3">
      <Icon className="h-6 w-6 text-ink-500" />
    </div>
    <div>
      <p className="font-display text-base font-semibold text-ink-950">{title}</p>
      {message && <p className="mt-1 text-sm text-ink-500">{message}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
