import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Wrench, ArrowRight } from "lucide-react";
import Button from "../../components/common/Button";
import ProductGrid from "../../components/product/ProductGrid";
import CategoryCard from "../../components/category/CategoryCard";
import Spinner from "../../components/common/Spinner";
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import * as wishlistService from "../../services/wishlistService";
import { useAuth } from "../../hooks/useAuth";

const BUSINESS_PHONE = "+251-911-234-567";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: "Misgie LCD",
  image: "https://msglcd.com/logo.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
  telephone: BUSINESS_PHONE,
  priceRange: "$$",
};

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Every grade, clearly marked",
    text: "Original, Copy, or OEM — each screen and battery is graded honestly so you know exactly what you're selling to your customer.",
  },
  {
    icon: Wrench,
    title: "Built for technicians, by Merkato",
    text: "Search by brand, model, and quality grade to find the exact part for your repair — no digging through mismatched stock.",
  },
  {
    icon: Truck,
    title: "In stock at Merkato, ready now",
    text: "Skip the wait on imports — the parts that move fastest are stocked right here and ready to grab today.",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const loadFeatured = async (reset = true) => {
    if (reset) {
      setProductsLoading(true);
      setProductsError(null);
    }

    try {
      const res = await productService.getProducts({ featured: true, limit: 8 });
      setFeaturedProducts(res.data);
    } catch (err) {
      setProductsError(err.response?.data?.message || "Failed to load featured products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      await loadFeatured(false);
    };

    fetchFeatured();

    categoryService
      .getCategories()
      .then((res) => setCategories(res.data.slice(0, 6)))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistService
        .getWishlist()
        .then((res) => setWishlistedIds(res.data.map((w) => w.product._id)))
        .catch(() => setWishlistedIds([]));
    }
  }, [isAuthenticated]);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <div>
        {/* Hero — signature element: a skewed cyan "glass" panel behind the
            headline, echoing the reflective sheen of a phone screen catching light. */}
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
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                   Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-950">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories strip */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink-950">
                Shop by Category
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Find the exact part type you need.
              </p>
            </div>
            <Link
              to="/categories"
              className="hidden text-sm font-medium text-brand-600 hover:underline sm:block"
            >
              View all
            </Link>
          </div>

          <div className="mt-6">
            {categoriesLoading ? (
              <Spinner label="Loading categories" />
            ) : categories.length === 0 ? (
              <p className="text-sm text-ink-500">Categories will appear here soon.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            )}
          </div>

          <Link
            to="/categories"
            className="mt-4 block text-center text-sm font-medium text-brand-600 hover:underline sm:hidden"
          >
            View all categories
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink-950">
                Featured Products
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Popular parts our customers order most.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden text-sm font-medium text-brand-600 hover:underline sm:block"
            >
              View all
            </Link>
          </div>

          <div className="mt-6">
            <ProductGrid
              products={featuredProducts}
              loading={productsLoading}
              error={productsError}
              onRetry={loadFeatured}
              wishlistedIds={wishlistedIds}
            />
          </div>

          {!productsLoading && !productsError && featuredProducts.length > 0 && (
            <Link
              to="/products"
              className="mt-6 block text-center text-sm font-medium text-brand-600 hover:underline sm:hidden"
            >
              View all products
            </Link>
          )}
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;
