import { HomeBlocks } from "@/components/hifi/HomeBlocks";
import Hero from "@/components/hifi/hero/Hero";
import SolutionsSection from "@/components/hifi/solutions/SolutionsSection";
import EcosystemStats from "@/components/hifi/ecosystem/EcosystemStats";

export default function HomeHiFi() {
  return (
    <>
      <Hero variant="atmosphere" />
      <HomeBlocks
        replaceBlock5={<SolutionsSection />}
        replaceBlock2={<EcosystemStats />}
      />
    </>
  );
}
