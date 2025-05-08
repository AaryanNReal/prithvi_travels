"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "../styles/index.css";
import { usePathname } from 'next/navigation';
const inter = Inter({ subsets: ["latin"] });


const HIDE_HEADER_FOOTER_ROUTES = [
  '/categories',
  '/tag'
  // Add more routes as needed
];


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldHide = HIDE_HEADER_FOOTER_ROUTES.includes(pathname);
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-[#FCFCFC]  ${inter.className} pathname === '/categories' ? 'hidden' : ''`}>
      <Providers>
          {!shouldHide && <Header />} {/* 👈 Hide on /categories */}
          {children}
          {!shouldHide && <Footer />}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";

