import { Loader2 } from "lucide-react";

const SIZES = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

const Spinner = ({ size = "md", label = "Loading", fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2 text-ink-500">
      <Loader2 className={`animate-spin text-brand-600 ${SIZES[size]}`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[50vh] items-center justify-center">{content}</div>;
  }

  return content;
};

export default Spinner;
