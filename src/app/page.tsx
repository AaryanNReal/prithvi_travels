import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Domestic from "@/components/Domestic/Domestic";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import International from "@/components/International/Intertional";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prithvi Travels",
  description: "",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Domestic/>
      <International/>
      <Features />
      
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      
      <Blog />
      <Contact />
    </>
  );
}
