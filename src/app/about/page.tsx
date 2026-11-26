import { getCachedPublicPortfolio } from "@/lib/cache";
import { AboutPage } from "@/views/AboutPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Wild Rahi",
  description:
    "About Razaul Hafiz Rahi (Wild Rahi), wildlife photographer in Bangladesh.",
};

export default async function Page() {
  const { profile } = await getCachedPublicPortfolio();
  return <AboutPage profile={profile} />;
}
