/**
 * Fidelity invariants check, run with `npm run check:invariants`.
 * Each broken case copies howSureToday with spread and changes one thing;
 * the fixture itself is never mutated.
 */
import { checkInvariants } from '../invariants';
import { today, howSureToday as e } from '../__fixtures__/hanwella';
import type { AdaptedExplanation, InvariantName, InvariantResult } from '../explanation';

type Expect = (r: InvariantResult) => string | null; // null = ok, else why it failed

const passes: Expect = (r) => (r.pass ? null : `expected pass, got ${JSON.stringify(r)}`);
const fails: Expect = (r) => (r.pass ? 'expected fail, got pass' : null);
const missing = (name: InvariantName): Expect => (r) =>
  r.pass || !r.missing.includes(name) ? `expected missing '${name}', got ${JSON.stringify(r)}` : null;
const wrong = (name: InvariantName | 'forecastId'): Expect => (r) =>
  r.pass || !r.wrong.some((w) => w.invariant === name)
    ? `expected wrong '${name}', got ${JSON.stringify(r)}`
    : null;

/** Same ISO time, one day earlier, keeping the "+05:30" offset. */
const dayEarlier = (iso: string) => iso.replace('2026-10-15', '2026-10-14');

const cases: [string, AdaptedExplanation, Expect][] = [
  ['correct explanation passes', e, passes],
  ['uncertainty dropped', { ...e, likelihood: { ...e.likelihood, text: '' } }, missing('likelihood')],
  [
    'made more certain',
    { ...e, likelihood: { ...e.likelihood, value: { ...e.likelihood.value, certainty: 'Likely' } } },
    wrong('likelihood'),
  ],
  [
    'wrong day',
    {
      ...e,
      timeWindow: {
        ...e.timeWindow,
        value: { start: dayEarlier(e.timeWindow.value.start), end: dayEarlier(e.timeWindow.value.end) },
      },
    },
    wrong('timeWindow'),
  ],
  ['action missing', { ...e, action: { ...e.action, text: '' } }, missing('action')],
  ['wrong forecast', { ...e, forecastId: 'hanwella-2026-10-12' }, wrong('forecastId')],
  [
    'AI double negative',
    { ...e, layer: 4, likelihood: { ...e.likelihood, text: 'Flooding is not unlikely here on Thursday' } },
    fails,
  ],
  [
    'AI drops the CAP word',
    { ...e, layer: 4, likelihood: { ...e.likelihood, text: 'There may be flooding here on Thursday' } },
    fails,
  ],
  [
    'AI idiom',
    {
      ...e,
      layer: 4,
      action: { ...e.action, text: 'Keep an eye on the river and get your go-bag ready today' },
    },
    fails,
  ],
  [
    'good AI wording passes',
    { ...e, layer: 4, likelihood: { ...e.likelihood, text: 'Flooding is possible here on Thursday' } },
    passes,
  ],
];

const before = JSON.stringify([e, today]);
let failed = 0;

for (const [name, explanation, expect] of cases) {
  const why = expect(checkInvariants(explanation, today));
  if (why) failed++;
  console.log(why ? `FAIL ${name}: ${why}` : `PASS ${name}`);
}
console.log(`\n${cases.length - failed} of ${cases.length} passed`);

const mutated = JSON.stringify([e, today]) !== before;
if (mutated) console.log('FAIL fixtures unchanged: a case or checkInvariants mutated a fixture');

process.exit(failed || mutated ? 1 : 0);
