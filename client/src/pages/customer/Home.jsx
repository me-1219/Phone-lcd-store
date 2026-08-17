import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import * as wishlistService from "../../services/wishlistService";
import { useAuth } from "../../hooks/useAuth";
import HeroSection from "../../components/customer/HeroSection";
import AnnouncementsSection from "../../components/customer/AnnouncementsSection";
import CategoriesSection from "../../components/customer/CategoriesSection";
import FeaturedSection from "../../components/customer/FeaturedSection";

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
const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <div>
        <HeroSection />
        <AnnouncementsSection />
        <CategoriesSection />
        <FeaturedSection />
      </div>
    </>
  );
};

export default Home;
