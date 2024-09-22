"use client";

import Footer from "@/components/Footer";

import ScrollToTop from "@/components/ScrollToTop";
import { Roboto } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.scss";
import { Providers } from "./providers";

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-white dark:bg-black ${roboto.className}`}>
        <Providers>
          {/*<Header />*/}
          {children}
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

