export type BentoRowVariant = 'one' | 'two' | 'three';

export interface BentoRow<T> {
  variant: BentoRowVariant;
  items: T[];
}

const PATTERN: number[] = [2, 3, 3, 2];

/**
 * Groups an arbitrary list of items into an alternating 2 - 3 - 3 - 2 bento
 * rhythm without leaving awkward empty trailing slots on incomplete rows.
 */
export function splitIntoBentoRows<T>(items: T[]): BentoRow<T>[] {
  if (items.length === 0) return [];

  const rows: BentoRow<T>[] = [];
  let cursor = 0;
  let step = 0;

  while (cursor < items.length) {
    const remaining = items.length - cursor;

    if (remaining === 1) {
      rows.push({ variant: 'one', items: items.slice(cursor, cursor + 1) });
      break;
    }

    if (remaining === 2) {
      rows.push({ variant: 'two', items: items.slice(cursor, cursor + 2) });
      break;
    }

    if (remaining === 3) {
      rows.push({ variant: 'three', items: items.slice(cursor, cursor + 3) });
      break;
    }

    if (remaining === 4) {
      rows.push({ variant: 'two', items: items.slice(cursor, cursor + 2) });
      rows.push({ variant: 'two', items: items.slice(cursor + 2, cursor + 4) });
      break;
    }

    const desired = PATTERN[step % PATTERN.length];
    const take = Math.min(desired, remaining);
    rows.push({
      variant: take === 3 ? 'three' : take === 2 ? 'two' : 'one',
      items: items.slice(cursor, cursor + take),
    });
    cursor += take;
    step += 1;
  }

  return rows;
}

