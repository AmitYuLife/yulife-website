export type StatsColumnItem = {
  /** Display value, e.g. "80%" */
  value: string;
  /** Label below the number. Use `\n` for intentional line breaks. */
  label: string;
  /** Copy revealed on hover / tap */
  note: string;
  /** Optional citation shown, muted, beneath the note on the reveal. */
  source?: string;
  /** Optional source marker shown as subscript on the label */
  footnote?: number;
  /** Stable key for lists / CMS items */
  id?: string;
};

export type StatsColumnsProps = {
  stats: readonly StatsColumnItem[];
  /** Anchor for footnote links. Defaults to `#sources`. */
  sourcesHref?: string;
  /** Type utility for the reveal note. Defaults to `type-body-sm`; pass a
   * larger utility when a section wants a bigger reveal. */
  noteClassName?: string;
  className?: string;
};

export type StatColumnProps = {
  value: string;
  label: string;
  note: string;
  source?: string;
  footnote?: number;
  sourcesHref?: string;
  /** Type utility for the reveal note. Defaults to `type-body-sm`. */
  noteClassName?: string;
  className?: string;
  index?: number;
};
