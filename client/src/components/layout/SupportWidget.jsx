import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Phone } from "lucide-react";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";

import {
  BUSINESS_PHONE,
  BUSINESS_PHONE_DISPLAY,
  TELEGRAM_USERNAME,
  WHATSAPP_NUMBER,
} from "../../utils/constants";

const CHANNELS = [
  {
    key: "telegram",
    label: "Telegram",
    sublabel: "Usually replies fast",
    icon: FaTelegramPlane,
    href: `https://t.me/${TELEGRAM_USERNAME}`,
    tone: "bg-[#26A5E4]",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    sublabel: "Chat with us",
    icon: FaWhatsapp,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    tone: "bg-[#25D366]",
  },
  {
    key: "call",
    label: "Call Us",
    sublabel: BUSINESS_PHONE_DISPLAY,
    icon: Phone,
    href: `tel:${BUSINESS_PHONE}`,
    tone: "bg-ink-950",
  },
];

const SupportWidget = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
    >
      {/* Support Menu */}
      {open && (
        <div className="w-64 rounded-xl border border-border bg-white p-2 shadow-xl animate-[toast-in_0.2s_ease-out]">
          {/* Header */}
          <div className="px-2.5 py-2">
            <p className="text-sm font-semibold text-ink-950">
              Need help?
            </p>

            <p className="text-xs text-ink-500">
              Reach out — we usually reply quickly.
            </p>
          </div>

          {/* Channels */}
          <div className="flex flex-col gap-1">
            {CHANNELS.map(
              ({
                key,
                label,
                sublabel,
                icon: Icon,
                href,
                tone,
              }) => (
                <a
                  key={key}
                  href={href}
                  target={key === "call" ? undefined : "_blank"}
                  rel={
                    key === "call"
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted"
                >
                  {/* Icon */}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  {/* Text */}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-950">
                      {label}
                    </span>

                    <span className="block truncate text-xs text-ink-500">
                      {sublabel}
                    </span>
                  </span>
                </a>
              )
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          open
            ? "Close support menu"
            : "Open support menu"
        }
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-700"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

export default SupportWidget;
