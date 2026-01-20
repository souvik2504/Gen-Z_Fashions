import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSEO } from '../contexts/SEOContext';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  image, 
  type = 'website',
  article = null,
  product = null 
}) => {
  const { seoData } = useSEO();
  
  const seoTitle = title || seoData.title;
  const seoDescription = description || seoData.description;
  const seoKeywords = keywords || seoData.keywords;
  const seoCanonical = canonical || seoData.canonical;
  const seoImage = image || seoData.image;
  const seoType = type || seoData.type;

  const siteName = 'Gen-Z Fashions';
  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="author" content="Gen-Z Fashions" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoCanonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={seoType} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoCanonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:creator" content="@tshirtstore" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Article Specific Tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          <meta property="article:tag" content={article.tags} />
        </>
      )}
      
      {/* Product Specific Tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="INR" />
          <meta property="product:availability" content={product.availability} />
          <meta property="product:condition" content="new" />
          <meta property="product:retailer_item_id" content={product.id} />
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "url": siteUrl,
          "description": seoDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/products?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
