import test from 'node:test';
import assert from 'node:assert/strict';
import { splitIntoBentoRows } from './bentoLayout';

test('splitIntoBentoRows produces exact 2-3-3-2 rhythm for 10 items', () => {
  const rows = splitIntoBentoRows([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(
    rows.map((r) => [r.variant, r.items.length]),
    [
      ['two', 2],
      ['three', 3],
      ['three', 3],
      ['two', 2],
    ]
  );
});

test('splitIntoBentoRows balances shorter collections cleanly without holes', () => {
  assert.deepEqual(
    splitIntoBentoRows([1, 2, 3, 4, 5]).map((r) => [r.variant, r.items.length]),
    [
      ['two', 2],
      ['three', 3],
    ]
  );
  assert.deepEqual(
    splitIntoBentoRows([1, 2, 3, 4, 5, 6]).map((r) => r.items.length),
    [2, 2, 2]
  );
  assert.deepEqual(
    splitIntoBentoRows([1, 2, 3, 4, 5, 6, 7]).map((r) => r.items.length),
    [2, 3, 2]
  );
  assert.deepEqual(
    splitIntoBentoRows([1, 2, 3, 4, 5, 6, 7, 8]).map((r) => [r.variant, r.items.length]),
    [
      ['two', 2],
      ['three', 3],
      ['three', 3],
    ]
  );
  assert.deepEqual(
    splitIntoBentoRows([1]).map((r) => r.items.length),
    [1]
  );
});

