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

// Letters are spread across the wheel (7 steps apart), so neighbouring
// letters like A, B and C get clearly different colors.
const colorForIndex = (index) => PALETTE[(index * 7) % PALETTE.length];

const letterIndex = (ch) => {
  const code = ch.toLowerCase().charCodeAt(0);
  if (code >= 97 && code <= 122) return code - 97; // a-z
  if (code >= 0x430 && code <= 0x44f) return (code - 0x430) % 26; // Cyrillic а-я
  return code % 26; // any other letter
};

// Color of a category (hashtag name, with or without "#"), by its first letter.
export const categoryColor = (name) => {
  const firstLetter = (name || '').match(/\p{L}/u)?.[0];
  return firstLetter ? colorForIndex(letterIndex(firstLetter)) : PALETTE[0];
};
