export type StatsColumnItem = {
  /** Display value, e.g. "80%" */
  value: string;
  /** Label below the number. Use `\n` for intentional line breaks. */
  label: string;
  /** Copy revealed on hover / tap */
  note: string;
  /** Optional source marker shown as subscript on the label */
  footnote?: number;
  /** Stable key for lists / CMS items */
  id?: string;
};

export type StatsColumnsProps = {
  stats: readonly StatsColumnItem[];
  /** Anchor for footnote links. Defaults to `#sources`. */
  sourcesHref?: string;
  /** Full-bleed horizontal rule behind the grid (tablet+). */
  showHorizontalRule?: boolean;
  className?: string;
};

export type StatColumnProps = {
  value: string;
  label: string;
  note: string;
  footnote?: number;
  sourcesHref?: string;
  className?: string;
  index?: number;
};
