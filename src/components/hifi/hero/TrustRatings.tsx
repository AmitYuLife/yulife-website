import { hero } from "@/data/home-content";

function StarMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="#00d68f" aria-hidden="true">
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31 6.2 20.36l1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
    </svg>
  );
}

function CapterraMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
      <path d="M2 9.5 22 2v3.4L9.7 9.5H2Z" fill="#ff9d28" />
      <path d="M22 5.4V22L9.7 9.5 22 5.4Z" fill="#68c5ed" />
      <path d="M9.7 9.5 22 22H12.2L9.7 9.5Z" fill="#044d80" />
      <path d="M2 9.5h7.7L12.2 22 2 9.5Z" fill="#e54747" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 384 512" className="h-8 w-auto" fill="#fff" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

const MARKS: Record<string, React.ReactNode> = {
  Trustpilot: <StarMark />,
  Capterra: <CapterraMark />,
  "App Store": <AppleMark />,
};

export default function TrustRatings() {
  return (
    <div className="hero-ratings mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
      {hero.ratings.map((r) => (
        <div key={r.platform} className="flex items-center gap-4">
          {MARKS[r.platform]}
          <span
            className="font-body font-bold leading-none text-[2rem]"
            style={{ color: "#fff" }}
          >
            {r.score}
          </span>
          <span className="sr-only">
            {r.platform} rated {r.score} out of 5
          </span>
        </div>
      ))}
    </div>
  );
}
