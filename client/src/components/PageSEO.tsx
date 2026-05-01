"use client";

import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
}

export function PageSEO({
  title,
  description,
  image,
  url,
  type = "website",
  publishedTime,
  author,
}: PageSEOProps) {
  const siteName = "Watchman Lekki";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  const defaultDescription = "Welcome to Watchman Lekki - your church family. Join us for worship, fellowship, and spiritual growth.";

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {author && <meta property="article:author" content={author} />}
    </Helmet>
  );
}
