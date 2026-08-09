import { AlertTriangle, RotateCw } from "lucide-react";
import Button from "./Button";

const ErrorMessage = ({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-white px-6 py-14 text-center">
    <div className="rounded-full bg-red-50 p-3">
      <AlertTriangle className="h-6 w-6 text-danger-500" />
    </div>
    <div>
      <p className="font-display text-base font-semibold text-ink-950">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{message}</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" icon={RotateCw} onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export default ErrorMessage;
