import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import CardAnimation from "../card-animation";
import ThankYouContent from "./thank-you-content";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Thank you for getting in touch with Beckett House Montessori.",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ThankYouContent animation={<CardAnimation name="morphball" />} />
      </main>
      <SiteFooter />
    </>
  );
}
