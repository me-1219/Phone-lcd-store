import { FaFacebookF, FaInstagram, FaTelegramPlane, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";

const SOCIAL_LINKS = [
  { icon: FaTelegramPlane, href: "https://t.me/Msglcd", label: "Telegram" },
  { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaTiktok, href: "https://tiktok.com", label: "TikTok" },
  { icon: FaWhatsapp,href: "https://wa.me/251962725252",label: "WhatsApp", },
];

const Footer = () => (
  <footer className="border-t border-border bg-linear-to-r from-ink-950 via-ink-900 to-brand-700 md:block text-ink-400">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">

      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white/10">
          <span className="absolute -left-2 top-0 h-full w-5 -skew-x-12 bg-gradient-to-b from-brand-300 to-brand-500 opacity-90" />
          <span className="relative font-display text-xs font-bold text-white">
            M
          </span>
        </span>

        <span className="font-display text-sm font-semibold text-white">
          Misgie LCD
        </span>
      </div>

      {/* Social Icons */}
      <div className="flex gap-2">
        {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white transition-colors hover:bg-brand-600"
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>

      {/* Copyright */}
      <div className="flex flex-col items-center gap-1 text-xs sm:items-end">
        <p className="text-white/90">
          © {new Date().getFullYear()} Misgie LCD. All rights reserved.
        </p>
        <p className="text-white/90">
          Merkato Sket Building 3rd Floor 323, Addis Ababa, Ethiopia
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;