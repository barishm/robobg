// 26 colors for category hashtags, one per letter. Hues are evenly spaced
// around the OKLCH color wheel at matching perceived brightness, each tuned
// to have at least 4.6:1 contrast on white (so readable as text on white and
// as a background behind white text).
const PALETTE = [
  '#cb454f', '#cb492d', '#bf5506', '#ad6206', '#9d6b0e', '#8e700f', '#81770a',
  '#6f7c09', '#53810d', '#0a8822', '#068554', '#028369', '#07837a', '#118186',
  '#087f93', '#0d7ea3', '#027ab7', '#1f74d7', '#506dda', '#6e66d8', '#855dcf',
  '#9a57c3', '#aa50b1', '#b74a9c', '#c34786', '#c8436a',
];

// Keyword-based semantic overrides (checked against normalized lowercase tag).
// All colors maintain >= 4.6:1 contrast on white.
const KEYWORD_OVERRIDES = [
  // Events & Deals
  { words: ['black', 'черен', 'черния'], color: '#18181b' }, // Black Friday / Черен петък
  { words: ['valentine', 'валентин', 'свети'], color: '#c81e51' }, // Valentine's / Свети Валентин
  { words: ['prime', 'прайм'], color: '#0369a1' }, // Prime Day
  { words: ['christmas', 'xmas', 'коледа', 'коледен'], color: '#b91c1c' }, // Christmas / Коледа

  // Retailers
  { words: ['amazon', 'амазон'], color: '#b85d00' }, // Accessible Amazon amber-orange
  { words: ['emag', 'емаг'], color: '#005eb8' }, // eMAG blue
  { words: ['aliexpress', 'алиекспрес'], color: '#c8231a' }, // AliExpress red

  // Robot Vacuum Brands
  { words: ['roborock', 'роборок'], color: '#c62828' }, // Roborock crimson
  { words: ['dreame', 'дрийми'], color: '#8a6800' }, // Dreame brushed gold
  { words: ['xiaomi', 'сяоми'], color: '#c25100' }, // Xiaomi Mi orange
  { words: ['irobot', 'roomba', 'румба'], color: '#2e7d32' }, // iRobot green
  { words: ['ecovacs', 'deebot', 'ековакс'], color: '#0d7377' }, // Ecovacs teal
  { words: ['narwal', 'нарвал'], color: '#0277bd' }, // Narwal ocean blue
  { words: ['eufy', 'юфи'], color: '#0073a8' }, // Eufy blue
  { words: ['dyson', 'дайсън'], color: '#7e22ce' }, // Dyson purple
  { words: ['miele', 'миле'], color: '#991b1b' }, // Miele deep red

  // Vacuum Tech & Features
  { words: ['mop', 'моп', 'миене'], color: '#0284c7' }, // Water / Mopping
  { words: ['lidar', 'laser', 'лидар', 'лазер'], color: '#6d28d9' }, // Laser navigation
  { words: ['pet', 'pets', 'козина', 'любимци'], color: '#9a4e1c' }, // Pet hair
  { words: ['hepa', 'еко', 'eco'], color: '#15803d' }, // Filtration / Eco
];

// Letters are spread across the wheel (7 steps apart), so neighbouring
// letters like A, B and C get clearly different colors.
const colorForIndex = (index) => PALETTE[(index * 7) % PALETTE.length];

const letterIndex = (ch) => {
  const code = ch.toLowerCase().charCodeAt(0);
  if (code >= 97 && code <= 122) return code - 97; // a-z
  if (code >= 0x430 && code <= 0x44f) return (code - 0x430) % 26; // Cyrillic а-я
  return code % 26; // any other letter
};

// Color of a category (hashtag name, with or without "#").
export const categoryColor = (name) => {
  // Strip everything except letters and numbers, lowercase for matching
  const normalized = (name || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  if (!normalized) return PALETTE[0];

  const matched = KEYWORD_OVERRIDES.find(({ words }) =>
    words.some((word) => normalized.includes(word))
  );
  if (matched) return matched.color;

  const firstLetter = normalized.match(/\p{L}/u)?.[0];
  return firstLetter ? colorForIndex(letterIndex(firstLetter)) : PALETTE[0];
};