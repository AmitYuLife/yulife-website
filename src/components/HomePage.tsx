import Hero from "@/components/hero/Hero";
import EcosystemStats from "@/components/ecosystem/EcosystemStats";
import ProductShowcase from "@/components/home/ProductShowcase";
import PillarsSection from "@/components/home/pillars/PillarsSection";
import TrustedSection from "@/components/home/TrustedSection";
import JoinMissionCard from "@/components/home/JoinMissionCard";

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
