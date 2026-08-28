"use client";

import { useLayoutEffect, useState } from "react";

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * iPhone status bar chrome shared by the fake app screens. The clock shows the
 * viewer's real system time and ticks on the minute. The SSR/first render emits
 * the Figma value ("09:04") so the static export never hydrates mismatched —
 * but that placeholder stays masked (not shown) until the real time replaces
 * it, so the viewer never sees the wrong time flash before the correct one.
 */
export default function StatusBar() {
  const [time, setTime] = useState("09:04");
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      setTime(TIME_FORMAT.format(new Date()));
      setReady(true);
    };
    tick();
    // Align the interval to the next minute boundary so the clock never lags.
    const boundary = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(boundary);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative h-[44px] w-full opacity-90" style={{ color: "var(--app-status-ink)" }}>
      <p
        className="absolute left-[21px] top-[8px] flex h-[23px] items-center font-bold text-[15px] leading-none transition-opacity duration-150 motion-reduce:transition-none"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {time}
      </p>
      <div className="absolute right-[14px] top-[15px] flex h-[16px] items-center gap-[2px]">
        {/* Cell */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
          <path
            d="M2.66667 7.33366C3.21895 7.33366 3.66667 7.78137 3.66667 8.33366V10.3337C3.66649 10.8858 3.21884 11.3337 2.66667 11.3337H1.66667C1.11449 11.3337 0.666843 10.8858 0.666667 10.3337V8.33366C0.666667 7.78137 1.11438 7.33366 1.66667 7.33366H2.66667ZM7.33366 5.33366C7.88579 5.33383 8.33366 5.78148 8.33366 6.33366V10.3337C8.33348 10.8857 7.88569 11.3335 7.33366 11.3337H6.33366C5.78148 11.3337 5.33383 10.8858 5.33366 10.3337V6.33366C5.33366 5.78137 5.78137 5.33366 6.33366 5.33366H7.33366ZM11.9997 2.99967C12.5519 2.99967 12.9995 3.44754 12.9997 3.99967V10.3337C12.9995 10.8858 12.5519 11.3337 11.9997 11.3337H10.9997C10.4476 11.3335 9.99985 10.8857 9.99967 10.3337V3.99967C9.99985 3.44765 10.4476 2.99985 10.9997 2.99967H11.9997ZM16.6667 0.666667C17.219 0.666667 17.6667 1.11438 17.6667 1.66667V10.3337C17.6665 10.8858 17.2188 11.3337 16.6667 11.3337H15.6667C15.1145 11.3337 14.6668 10.8858 14.6667 10.3337V1.66667C14.6667 1.11438 15.1144 0.666667 15.6667 0.666667H16.6667Z"
            fill="currentColor"
          />
        </svg>
        {/* Wifi */}
        <svg width="21" height="15" viewBox="0 0 21 15" fill="none" aria-hidden="true">
          <path
            d="M8.10417 9.79937C9.39081 8.73367 11.2755 8.73378 12.5622 9.79937C12.6269 9.85664 12.6648 9.93764 12.6667 10.023C12.6685 10.1083 12.6341 10.1907 12.5719 10.2505L10.5573 12.2417C10.4983 12.3002 10.4176 12.3335 10.3337 12.3335C10.2496 12.3335 10.1691 12.3003 10.11 12.2417L8.09441 10.2505C8.0324 10.1907 7.99784 10.1083 7.99968 10.023C8.00157 9.93765 8.03949 9.8566 8.10417 9.79937ZM5.4323 6.93511C8.19457 4.35575 12.4718 4.35578 15.2341 6.93511C15.2964 6.99559 15.3328 7.07854 15.3337 7.16558C15.3345 7.25252 15.3 7.33631 15.2389 7.398L14.0788 8.57476C13.9592 8.69495 13.7659 8.6976 13.6432 8.58062C12.7361 7.75606 11.5554 7.29929 10.3317 7.29937C9.1091 7.29998 7.93044 7.75689 7.0241 8.58062C6.90144 8.69761 6.70816 8.69486 6.58855 8.57476L5.42742 7.398C5.3663 7.3364 5.3329 7.25252 5.33367 7.16558C5.33448 7.07856 5.36997 6.99558 5.4323 6.93511ZM2.76335 4.31401C6.99528 0.339821 13.6721 0.339725 17.904 4.31401C17.9651 4.37295 17.9991 4.45365 17.9997 4.53765C18.0002 4.62185 17.9665 4.70349 17.9059 4.76323L16.7458 5.91069C16.6262 6.02848 16.4316 6.02959 16.3102 5.91362C14.6979 4.41169 12.5582 3.57387 10.3337 3.57378C8.10879 3.5738 5.96866 4.41145 4.35613 5.91362C4.23482 6.02974 4.04107 6.02855 3.92156 5.91069L2.76042 4.76323C2.69992 4.70345 2.66611 4.62185 2.66667 4.53765C2.66733 4.45358 2.70214 4.37293 2.76335 4.31401Z"
            fill="currentColor"
          />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect opacity="0.35" x="0.5" y="0.833333" width="21" height="10.3333" rx="2.16667" stroke="currentColor" />
          <path
            opacity="0.4"
            d="M23 4V8C23.8079 7.66122 24.3333 6.87313 24.3333 6C24.3333 5.12687 23.8079 4.33878 23 4"
            fill="currentColor"
          />
          <rect x="2" y="2.33333" width="18" height="7.33333" rx="1.33333" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
