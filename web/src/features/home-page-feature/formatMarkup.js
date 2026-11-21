// The text formatting markup used in offers, shared by the renderer
// (offerTextMarkup.jsx) and the rich text editor (RichTextEditor.jsx).
export const FORMAT_TAGS = ['b', 'i', 'u', 's', 'big', 'small'];
const FORMAT_TAG_REGEX = /\[(\/?)(b|i|u|s|big|small)\]/g;

export const stripFormatting = (text) => (text ? text.replace(FORMAT_TAG_REGEX, '') : '');

// Parses the format tags into a tree. A tag without its matching pair is kept
// as plain text, so a stray "[b]" never swallows the rest of the offer.
export const parseFormatting = (text) => {
  const root = { tag: null, children: [] };
  const stack = [root];
  let cursor = 0;
  FORMAT_TAG_REGEX.lastIndex = 0;
  let match;

  const pushText = (value) => {
    if (!value) return;
    const { children } = stack[stack.length - 1];
    if (typeof children[children.length - 1] === 'string') {
      children[children.length - 1] += value;
    } else {
      children.push(value);
    }
  };

  while ((match = FORMAT_TAG_REGEX.exec(text))) {
    pushText(text.slice(cursor, match.index));
    cursor = match.index + match[0].length;
    const [raw, closing, tag] = match;
    const top = stack[stack.length - 1];

    if (!closing) {
      const node = { tag, raw, children: [] };
      top.children.push(node);
      stack.push(node);
    } else if (top.tag === tag) {
      stack.pop();
    } else {
      pushText(raw);
    }
  }
  pushText(text.slice(cursor));

  // Unclosed tags: put the opening tag back as text and keep their content
  while (stack.length > 1) {
    const node = stack.pop();
    const parent = stack[stack.length - 1];
    const index = parent.children.indexOf(node);
    parent.children.splice(index, 1, node.raw, ...node.children);
  }

  return root.children;
};
