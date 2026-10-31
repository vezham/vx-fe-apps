import type { Persona } from './demo'

export const OUTFITS = [
  {
    id: 'rest',
    name: 'Tamizhi',
    label: 'Resting',
    code: 0,
    palette: 'persimmon',
    job: 'Dresses for the job'
  },
  {
    id: 'cook',
    name: 'Chef',
    label: 'Chef',
    code: 1,
    palette: 'honey',
    job: 'Recipes and meals'
  },
  {
    id: 'investigate',
    name: 'Detective',
    label: 'Detective',
    code: 2,
    palette: 'cornflower',
    job: 'Finds out why'
  },
  {
    id: 'write',
    name: 'Writer',
    label: 'Writer',
    code: 3,
    palette: 'matcha',
    job: 'Posts and emails'
  },
  {
    id: 'builder',
    name: 'Builder',
    label: 'Builder',
    code: 5,
    palette: 'wisteria',
    job: 'Apps and websites'
  },
  {
    id: 'music',
    name: 'Music',
    label: 'Music',
    code: 6,
    palette: 'rose',
    job: 'Playlists'
  },
  {
    id: 'tutor',
    name: 'Tutor',
    label: 'Tutor',
    code: 7,
    palette: 'teal',
    job: 'Explains things'
  },
  {
    id: 'garden',
    name: 'Gardener',
    label: 'Gardener',
    code: 8,
    palette: 'sand',
    job: 'Plants'
  },
  {
    id: 'designer',
    name: 'Designer',
    label: 'Designer',
    code: 9,
    palette: 'orchid',
    job: 'UI and type'
  },
  {
    id: 'director',
    name: 'Director',
    label: 'Director',
    code: 10,
    palette: 'slate',
    job: 'Video'
  },
  {
    id: 'coach',
    name: 'Coach',
    label: 'Coach',
    code: 11,
    palette: 'cherry',
    job: 'Fitness and habits'
  },
  {
    id: 'traveller',
    name: 'Traveller',
    label: 'Traveller',
    code: 12,
    palette: 'sky',
    job: 'Trips'
  },
  {
    id: 'money',
    name: 'Money',
    label: 'Money',
    code: 13,
    palette: 'piggy',
    job: 'Budgets'
  },
  {
    id: 'planner',
    name: 'Planner',
    label: 'Planner',
    code: 14,
    palette: 'mint',
    job: 'Plans and bookings'
  },
  {
    id: 'captain',
    name: 'Captain',
    label: 'Captain',
    code: 15,
    palette: 'lemon',
    job: 'Git and releases'
  },
  {
    id: 'tester',
    name: 'Tester',
    label: 'Tester',
    code: 16,
    palette: 'indigo',
    job: 'Runs the tests'
  },
  {
    id: 'guard',
    name: 'Guard',
    label: 'Guard',
    code: 17,
    palette: 'lime',
    job: 'Asks before risky steps'
  },
  {
    id: 'bug',
    name: 'Bug finder',
    label: 'Bug finder',
    code: 18,
    palette: 'ladybug',
    job: 'Bugs and errors'
  }
] as const

export type Outfit = (typeof OUTFITS)[number]['id']
export type Expression =
  | 'neutral'
  | 'happy'
  | 'wink'
  | 'sparkle'
  | 'surprised'
  | 'sorry'
  | 'dizzy'
  | 'sleepy'
export const EXPRESSIONS: { id: Expression; label: string; face: number }[] = [
  { id: 'neutral', label: 'Neutral', face: 0 },
  { id: 'happy', label: 'Happy', face: 1 },
  { id: 'wink', label: 'Wink', face: 8 },
  { id: 'sparkle', label: 'Idea', face: 7 },
  { id: 'surprised', label: 'Surprised', face: 5 },
  { id: 'sorry', label: 'Sorry', face: 10 },
  { id: 'dizzy', label: 'Dizzy', face: 6 },
  { id: 'sleepy', label: 'Sleepy', face: 9 }
]
export const COLOURS = [
  { id: 'persimmon', name: 'Persimmon', color: 'rgb(239, 140, 102)' },
  { id: 'honey', name: 'Honey', color: 'rgb(243, 189, 88)' },
  { id: 'cornflower', name: 'Cornflower', color: 'rgb(134, 163, 240)' },
  { id: 'matcha', name: 'Matcha', color: 'rgb(163, 201, 119)' },
  { id: 'wisteria', name: 'Wisteria', color: 'rgb(170, 149, 233)' },
  { id: 'rose', name: 'Rose', color: 'rgb(238, 147, 169)' }
]
export const PALETTE_COLOURS: Record<string, string> = {
  ...Object.fromEntries(COLOURS.map(colour => [colour.id, colour.color])),
  teal: 'rgb(116, 207, 194)',
  sand: 'rgb(235, 201, 155)',
  orchid: 'rgb(206, 147, 228)',
  slate: 'rgb(147, 166, 207)',
  cherry: 'rgb(236, 134, 134)',
  sky: 'rgb(135, 204, 238)',
  piggy: 'rgb(251, 185, 198)',
  mint: 'rgb(143, 217, 162)',
  lemon: 'rgb(240, 217, 94)',
  indigo: 'rgb(160, 165, 240)',
  lime: 'rgb(201, 226, 108)',
  ladybug: 'rgb(245, 122, 108)'
}
export const outfitForPersona = (persona: Persona): Outfit =>
  (
    ({
      helper: 'rest',
      coder: 'builder',
      writer: 'write',
      planner: 'planner',
      tutor: 'tutor',
      explorer: 'traveller'
    }) as const
  )[persona]

const RULES: [Outfit, RegExp][] = [
  [
    'cook',
    /\b(cook\w*|recipe\w*|dinner|lunch|breakfast|food|baking|eggs?|meal\w*|kitchen)\b/i
  ],
  ['guard', /\b(delete|wipe|erase|sudo|permission\w*|approval)\b|rm -rf/i],
  ['tester', /\b(tests?|testing|coverage|jest|vitest|pytest|playwright|qa)\b/i],
  [
    'bug',
    /\b(bugs?|errors?|exceptions?|crash\w*|debug\w*|broken|typeerror)\b/i
  ],
  ['investigate', /\b(fail\w*|why|investigat\w*|outage|detective)\b/i],
  [
    'captain',
    /\b(git|github|commits?|merge|release\w*|deploy\w*|changelog)\b/i
  ],
  ['director', /\b(video\w*|youtube|reels?|podcast\w*|filming)\b/i],
  [
    'designer',
    /\b(figma|design\w*|ui|ux|logo\w*|font\w*|typography|palette\w*)\b/i
  ],
  [
    'builder',
    /\b(build\w*|code|coding|react|app|website|portfolio|component)\b/i
  ],
  ['music', /\b(music|playlist|songs?|album|audio|beats?)\b/i],
  ['planner', /\b(plan|day|schedule\w*|calendar|meetings?|remind\w*|todo)\b/i],
  [
    'traveller',
    /\b(trip\w*|travel\w*|packing|itinerary|holiday\w*|chennai|explor\w*)\b/i
  ],
  ['money', /\b(budget\w*|money|saving\w*|tax\w*|invoice\w*|salary)\b/i],
  [
    'coach',
    /\b(workout\w*|exercise\w*|gym|fitness|sleep|stretch\w*|habit\w*)\b/i
  ],
  ['tutor', /\b(explain\w*|teach\w*|learn\w*|understand|how|what is)\b/i],
  ['garden', /\b(plants?|garden\w*|basil|soil|seeds?|wilting)\b/i],
  ['write', /\b(write|writing|draft|email|blog|essay|poem|introduction)\b/i]
]
export const detectOutfit = (text: string): Outfit =>
  RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? 'rest'
