export const WILDLIFE_CATEGORIES = [
  { id: 'birds', label: 'Birds', inFooter: true },
  { id: 'mammals', label: 'Mammals', inFooter: true },
  { id: 'reptiles', label: 'Reptiles', inFooter: true },
  { id: 'amphibians', label: 'Amphibians', inFooter: false },
  { id: 'insects', label: 'Insects', inFooter: false },
  { id: 'landscapes', label: 'Landscapes', inFooter: true },
  { id: 'others', label: 'Others', inFooter: true },
] as const;

export type WildlifeCategory = (typeof WILDLIFE_CATEGORIES)[number]['id'];

export const ALLOWED_WILDLIFE_CATEGORIES: readonly WildlifeCategory[] = WILDLIFE_CATEGORIES.map(
  (cat) => cat.id
);

export const GALLERY_FILTER_TABS: ReadonlyArray<{ id: 'all' | WildlifeCategory; label: string }> = [
  { id: 'all', label: 'All' },
  ...WILDLIFE_CATEGORIES.map(({ id, label }) => ({ id, label })),
];

export const FOOTER_CATEGORY_LINKS: ReadonlyArray<{ id: WildlifeCategory; label: string; href: string }> =
  WILDLIFE_CATEGORIES.filter((cat) => cat.inFooter).map(({ id, label }) => ({
    id,
    label,
    href: `/gallery?category=${id}`,
  }));
