import { getCachedPublicPortfolio } from "@/lib/cache";
import { HomePage } from "@/views/HomePage";

export default async function Page() {
  const { heroSlides, photographs, videos, stories, profile } =
    await getCachedPublicPortfolio();

  return (
    <HomePage
      heroSlides={heroSlides}
      photographs={photographs}
      videos={videos}
      stories={stories}
      profile={profile}
    />
  );
}
