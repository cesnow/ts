import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import Hero from "@/components/Hero";
import getConfig from "next/config";

export const metadata: Metadata = {
  title: "Free Next.js Template for Startup and SaaS",
  description: "This is Home for Startup Nextjs Template",
  // other metadata
};

export default function Home() {

  return (
    <>
      <ScrollUp />
      <Hero />
    </>
  );
}
