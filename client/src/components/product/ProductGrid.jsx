import ProductCard from "./ProductCard";
import Spinner from "../common/Spinner";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import { PackageSearch } from "lucide-react";

const ProductGrid = ({
  products = [],
  loading = false,
  error = null,
  onRetry,
  wishlistedIds = [],
}) => {
  if (loading) {
    return <Spinner fullPage label="Loading products" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Couldn't load products"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        message="Try changing your filters or search term."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isWishlisted={wishlistedIds.includes(product._id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;