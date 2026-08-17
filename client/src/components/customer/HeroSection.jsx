import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../common/Button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute -right-24 top-1/2 h-[140%] w-1/2 -translate-y-1/2 -skew-x-12 bg-linear-to-b from-brand-500/30 via-brand-600/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-brand-300">
            Genuine Screen Type, Quality and in stock
          </span>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white sm:text-4xl">
            Misgie LCD
            <br />
            <span className="text-2xl font-normal text-gray-50">
              Addis Ababa,Merkato Sket Building 3rd Floor 324
            </span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-ink-300 sm:text-lg">
            Misgie Touch screens replacement, batteries, and phone
            parts by brand, model, and quality grade — so you spend less
            time guessing and more time repairing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/products" className="w-full sm:w-auto">
              <Button
                size="lg"
                icon={ArrowRight}
                className="w-full flex-row-reverse sm:w-auto"
              >
                View Products
              </Button>
            </Link>

            <Link to="/categories" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-white/20 text-white hover:bg-white/20 sm:w-auto"
              >
                Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
