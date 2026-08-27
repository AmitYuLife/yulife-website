import Hero from "@/components/sections/Hero";
import EcosystemStats from "@/components/sections/EcosystemStats";
import ProductShowcase from "@/components/sections/ProductShowcase";
import PillarsSection from "@/components/sections/PillarsSection";
import TrustedSection from "@/components/sections/TrustedSection";
import JoinMissionCard from "@/components/sections/JoinMissionCard";

export default function HomePage() {
  return (
    <>
      <Hero variant="atmosphere" />
      <EcosystemStats />
      <ProductShowcase />
      <PillarsSection />
      <TrustedSection />
      <JoinMissionCard />
    </>
  );
}
