import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonSize = "sm" | "lg";
export type ButtonVariant = "solid" | "outline";
export type ButtonTheme = "onDark" | "onLight";

type ButtonBaseProps = {
  /** Figma: Size (SM | LG) */
  size?: ButtonSize;
  /** Figma: Style (Solid | Outline) */
  variant?: ButtonVariant;
  /** Figma: Theme — the surface the button sits on (On Dark | On Light) */
  theme?: ButtonTheme;
  /** Figma: Trailing icon — renders a chevron after the label */
  trailingIcon?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, keyof ButtonBaseProps>;

type ButtonAsLink = ButtonBaseProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps | "href">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeClasses: Record<ButtonSize, string> = {
  sm: "type-nav-link px-16 py-8",
  lg: "type-button-lg px-32 py-16",
};

const toneClasses: Record<`${ButtonVariant}-${ButtonTheme}`, string> = {
  "solid-onDark": "bg-action-primary text-on-action-primary",
  "solid-onLight": "bg-surface-inverse text-on-inverse",
  "outline-onDark": "border border-action-secondary text-on-inverse",
  "outline-onLight": "border border-surface-inverse text-default",
};

function ChevronDownIcon({ size }: { size: ButtonSize }) {
  const px = size === "lg" ? 24 : 16;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Button(props: ButtonProps) {
  const {
    size = "sm",
    variant = "solid",
    theme = "onDark",
    trailingIcon = false,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-8 rounded-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    sizeClasses[size],
    toneClasses[`${variant}-${theme}`],
    className,
  );

  const content = (
    <>
      {children}
      {trailingIcon && <ChevronDownIcon size={size} />}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkProps } = rest as Omit<ButtonAsLink, keyof ButtonBaseProps>;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as Omit<ButtonAsButton, keyof ButtonBaseProps>)}>
      {content}
    </button>
  );
}

export default Button;
