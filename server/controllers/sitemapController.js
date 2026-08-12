export const getSitemap = async (req, res) => {
    const products = await Product.find({ isActive: true }).select("slug updatedAt");
    const categories = await Category.find({ isActive: true }).select("slug updatedAt");

    const staticUrls = ["", "/products", "/categories"];

    const urls = [
        ...staticUrls.map((path) => `<url><loc>https://msglcd.com${path}</loc></url>`),
        ...categories.map(
            (c) => `<url><loc>https://msglcd.com/products?category=${c.slug}</loc><lastmod>${c.updatedAt.toISOString()}</lastmod></url>`
        ),
        ...products.map(
            (p) => `<url><loc>https://msglcd.com/products/${p.slug || p._id}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`
        ),
    ].join("");

    res.set("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
};