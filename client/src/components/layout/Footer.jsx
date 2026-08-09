import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from "react-icons/fa";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Categories", to: "/categories" },
    { label: "Track an Order", to: "/orders" },
  ],
  Support: [
    { label: "Contact Us", to: "/contact" },
    { label: "Return & Refund Policy", to: "/returns" },
    { label: "FAQs", to: "/faq" },
  ],
  Company: [
    { label: "About Misgie LCD", to: "/about" },
    { label: "Login", to: "/login" },
  ],
};

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaTelegramPlane, href: "https://t.me", label: "Telegram" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

const Footer = () => (
  <footer className="border-t border-border bg-ink-950 text-ink-300">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10">
              <span className="absolute -left-2 top-0 h-full w-6 -skew-x-12 bg-gradient-to-b from-brand-300 to-brand-500 opacity-90" />
              <span className="relative font-display text-sm font-bold text-white">M</span>
            </span>
            <span className="font-display text-lg font-semibold text-white">
              Misgie LCD
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Genuine and OEM replacement screens, batteries, and phone parts —
            sourced, tested, and stocked in Addis Ababa.
          </p>

          <div className="mt-5 flex gap-2">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-brand-600"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="font-display text-sm font-semibold text-white">{heading}</h3>
            <ul className="mt-3 space-y-2.5">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Misgie LCD. All rights reserved.</p>
        <p>Addis Ababa, Ethiopia</p>
      </div>
    </div>
  </footer>
);

export default Footer;
