import { CheckCircle2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

// A focused variant of Modal for "action succeeded, here's what's next"
// moments — login/register/order-placed, anywhere a redirect shouldn't
// happen silently out from under the user.
const SuccessModal = ({ open, title, message, buttonLabel = "Continue", onContinue }) => (
  <Modal open={open} onClose={onContinue} title="">
    <div className="flex flex-col items-center py-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-7 w-7 text-success-500" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink-950">{title}</h2>
      {message && <p className="mt-1.5 text-sm text-ink-500">{message}</p>}

      <Button fullWidth size="lg" className="mt-6" onClick={onContinue}>
        {buttonLabel}
      </Button>
    </div>
  </Modal>
);

export default SuccessModal;