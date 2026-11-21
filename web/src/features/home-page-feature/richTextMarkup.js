import { parseFormatting } from './formatMarkup.js';

// Converts between the offer text markup ([b]bold[/b], [big]..[/big]...)
// and the rich text editor's document (TipTap/ProseMirror JSON), so the
// editor shows formatting instead of tags while offers are still stored as
// plain text with tags.

export const MIN_TEXT_SIZE = -2;
export const MAX_TEXT_SIZE = 3;

const MARK_FOR_TAG = { b: 'bold', i: 'italic', u: 'underline', s: 'strike' };
// Order of tags around a run of text: sizes outermost, then b, i, u, s
const STYLE_TAGS = [
  ['bold', 'b'],
  ['italic', 'i'],
  ['underline', 'u'],
  ['strike', 's'],
];

const clampSize = (level) => Math.max(MIN_TEXT_SIZE, Math.min(MAX_TEXT_SIZE, level));

// Font size (in em) of a text size level: each Bigger step is 1.25x and each
// Smaller step 0.85x, same as nested [big]/[small] tags when the offer shows.
export const textSizeEm = (level) => (level > 0 ? 1.25 ** level : 0.85 ** -level);

const buildMarks = (marks, size) => {
  const result = [...marks].map((type) => ({ type }));
  const level = clampSize(size);
  if (level !== 0) result.push({ type: 'textSize', attrs: { level } });
  return result;
};

// Markup -> editor document. Every line becomes a paragraph.
export const markupToDoc = (markup) => {
  const paragraphs = [[]];

  const addText = (text, marks, size) => {
    text.split(/\r?\n/).forEach((part, index) => {
      if (index > 0) paragraphs.push([]);
      if (!part) return;
      const node = { type: 'text', text: part };
      const nodeMarks = buildMarks(marks, size);
      if (nodeMarks.length) node.marks = nodeMarks;
      paragraphs[paragraphs.length - 1].push(node);
    });
  };

  const walk = (nodes, marks, size) => {
    nodes.forEach((node) => {
      if (typeof node === 'string') {
        addText(node, marks, size);
      } else if (MARK_FOR_TAG[node.tag]) {
        walk(node.children, new Set([...marks, MARK_FOR_TAG[node.tag]]), size);
      } else {
        walk(node.children, marks, size + (node.tag === 'big' ? 1 : -1));
      }
    });
  };

  walk(parseFormatting(markup || ''), new Set(), 0);

  return {
    type: 'doc',
    content: paragraphs.map((content) => (content.length ? { type: 'paragraph', content } : { type: 'paragraph' })),
  };
};

const tagsForMarks = (marks = []) => {
  const types = new Set(marks.map((mark) => mark.type));
  const level = clampSize(marks.find((mark) => mark.type === 'textSize')?.attrs?.level || 0);
  const tags = Array(Math.abs(level)).fill(level > 0 ? 'big' : 'small');
  STYLE_TAGS.forEach(([type, tag]) => types.has(type) && tags.push(tag));
  return tags;
};

// Editor document -> markup. Tags are always properly nested and closed at
// the end of each line; neighbouring text with the same formatting shares
// its tags.
export const docToMarkup = (doc) => {
  const lines = [];

  (doc?.content || []).forEach((paragraph) => {
    let line = '';
    let open = [];

    const closeAll = () => {
      line += open.map((tag) => `[/${tag}]`).reverse().join('');
      open = [];
    };

    (paragraph.content || []).forEach((node) => {
      if (node.type === 'hardBreak') {
        closeAll();
        lines.push(line);
        line = '';
        return;
      }
      if (node.type !== 'text' || !node.text) return;

      const wanted = tagsForMarks(node.marks);
      let common = 0;
      while (common < open.length && common < wanted.length && open[common] === wanted[common]) common++;
      line += open.slice(common).map((tag) => `[/${tag}]`).reverse().join('');
      line += wanted.slice(common).map((tag) => `[${tag}]`).join('');
      open = wanted;
      line += node.text;
    });

    closeAll();
    lines.push(line);
  });

  return lines.join('\n');
};
