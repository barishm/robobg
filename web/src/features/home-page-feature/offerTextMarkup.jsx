import { Link } from 'react-router-dom';
import { NO_IMAGE } from 'src/constants';

const URL_REGEX = /(https?:\/\/[^\s<>()[\]]+|www\.[^\s<>()[\]]+)/gi;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isWordChar = (ch) => ch !== undefined && /[\p{L}\p{N}]/u.test(ch);

// Matches robot/consumable names as whole words, longest name first, so a
// name that is a prefix of another (e.g. "S8" vs "S8 Pro Ultra") doesn't
// steal the match.
const findEntityMatches = (text, entities) => {
  const taken = new Array(text.length).fill(false);
  const matches = [];

  const sorted = [...entities].filter((entity) => entity.name).sort((a, b) => b.name.length - a.name.length);

  sorted.forEach((entity) => {
    const regex = new RegExp(escapeRegExp(entity.name), 'gi');
    let match;
    while ((match = regex.exec(text))) {
      const start = match.index;
      const end = start + match[0].length;

      if (isWordChar(text[start - 1]) || isWordChar(text[end])) continue;
      if (taken.slice(start, end).some(Boolean)) continue;

      for (let i = start; i < end; i++) taken[i] = true;
      matches.push({ start, end, type: entity.type, id: entity.id, label: match[0], image: entity.image });
    }
  });

  return matches;
};

const findUrlMatches = (text, taken) => {
  const matches = [];
  URL_REGEX.lastIndex = 0;
  let match;
  while ((match = URL_REGEX.exec(text))) {
    const start = match.index;
    const end = start + match[0].length;
    if (taken.slice(start, end).some(Boolean)) continue;
    for (let i = start; i < end; i++) taken[i] = true;
    matches.push({ start, end, type: 'url', label: match[0] });
  }
  return matches;
};

// [custom text](url) renders as a link with that custom text instead of the
// raw URL, same idea as a markdown link.
const findMarkdownLinkMatches = (text) => {
  const regex = /\[([^\]\n]+)\]\(([^()\s]+)\)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(text))) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'mdlink',
      label: match[1].trim(),
      url: match[2].trim(),
    });
  }
  return matches;
};

export const renderOfferText = (text, robots, consumables) => {
  if (!text) return null;

  const entities = [
    ...(robots || []).map((robot) => ({
      name: robot.model,
      type: 'robot',
      id: robot.id,
      image: robot.image || NO_IMAGE,
    })),
    ...(consumables || []).map((consumable) => ({
      name: consumable.title,
      type: 'consumable',
      id: consumable.id,
      image: consumable.images?.[0] || NO_IMAGE,
    })),
  ];

  const taken = new Array(text.length).fill(false);

  const linkMatches = findMarkdownLinkMatches(text);
  linkMatches.forEach(({ start, end }) => {
    for (let i = start; i < end; i++) taken[i] = true;
  });

  const entityMatches = findEntityMatches(text, entities).filter(
    (match) => !taken.slice(match.start, match.end).some(Boolean)
  );
  entityMatches.forEach(({ start, end }) => {
    for (let i = start; i < end; i++) taken[i] = true;
  });

  const urlMatches = findUrlMatches(text, taken);

  const allMatches = [...linkMatches, ...entityMatches, ...urlMatches].sort((a, b) => a.start - b.start);

  const nodes = [];
  let cursor = 0;
  allMatches.forEach((match, index) => {
    if (match.start > cursor) {
      nodes.push(text.slice(cursor, match.start));
    }

    if (match.type === 'mdlink') {
      const href = match.url.startsWith('http') ? match.url : `https://${match.url}`;
      nodes.push(
        <a key={`mdlink-${index}`} href={href} target="_blank" rel="noreferrer" className="text-info">
          {match.label}
        </a>
      );
    } else if (match.type === 'url') {
      const href = match.label.startsWith('http') ? match.label : `https://${match.label}`;
      nodes.push(
        <a key={`url-${index}`} href={href} target="_blank" rel="noreferrer" className="text-info">
          {match.label}
        </a>
      );
    } else {
      const to = match.type === 'robot' ? `/robots/${match.id}` : `/consumables/${match.id}`;
      nodes.push(
        <Link key={`${match.type}-${index}`} to={to} target="_blank" rel="noreferrer" className="text-info">
          {match.image && (
            <img
              src={match.image}
              alt=""
              className="border"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'cover',
                borderRadius: '4px',
                verticalAlign: 'middle',
                marginRight: '4px',
              }}
            />
          )}
          {match.label}
        </Link>
      );
    }

    cursor = match.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
};
