import { Button } from "@/components/ui/Button";

export default function HeroButtons() {
  return (
    <div className="hero-cta-row flex flex-col items-center justify-center gap-controls tablet:flex-row">
      <Button href="/who-we-help/businesses" size="lg" variant="outline" theme="onDark" trailingIcon>
        Who we help
      </Button>
      <Button href="/contact" size="lg" variant="solid" theme="onDark">
        Speak to our team
      </Button>
    </div>
  );
}
