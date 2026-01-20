const fs = require('fs');
const axios = require('axios');

const generateSitemap = async () => {
  const baseUrl = 'https://yourdomain.com'; // Replace with your domain
  
  try {
    // Fetch products from API
    const productsResponse = await axios.get(`${baseUrl}/api/products`);
    const products = productsResponse.data.products || [];

    const staticPages = [
      '',
      '/products',
      '/products?category=men',
      '/products?category=women',
      '/products?category=unisex',
      '/products?category=kids'
    ];

    const dynamicPages = products.map(product => `/products/${product._id}`);

    const allPages = [...staticPages, ...dynamicPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : page.startsWith('/products/') ? 'weekly' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/products/') ? '0.8' : '0.7'}</priority>
  </url>`).join('')}
</urlset>`;

    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

generateSitemap();
