import { useEffect, useRef } from 'react';
import { EditorContent, Mark, mergeAttributes, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE, docToMarkup, markupToDoc, textSizeEm } from './richTextMarkup.js';

// Bigger/smaller text: one mark with a level (+1 = one Bigger step, -1 = one
// Smaller step), saved as nested [big]/[small] tags.
const TextSize = Mark.create({
  name: 'textSize',
  addAttributes() {
    return {
      level: {
        default: 0,
        parseHTML: (element) => parseInt(element.getAttribute('data-size') || '0', 10),
        renderHTML: (attributes) => ({
          'data-size': attributes.level,
          style: `font-size: ${textSizeEm(attributes.level)}em`,
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-size]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const ToolbarButton = ({ label, active, onClick, children }) => (
  <button
    type="button"
    className={`btn btn-sm fw-semibold ${active ? 'btn-secondary' : 'btn-light'}`}
    style={{ minWidth: '32px' }}
    title={label}
    aria-label={label}
    aria-pressed={active}
    // Keeps the editor's selection while clicking the toolbar
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
  >
    {children}
  </button>
);

// What-you-see-is-what-you-get editor for the offer text: the text shows
// bold, italic, sizes... directly while typing. value/onChange use the offer
// markup ([b]..[/b] etc.), so the rest of the app is unchanged.
const RichTextEditor = ({ value, onChange, rows = 4, placeholder }) => {
  // Last markup sent to/received from the parent, to tell our own edits apart
  // from outside changes (form reset after posting, a different offer).
  const lastValue = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Underline,
      TextSize,
      Placeholder.configure({ placeholder }),
    ],
    content: markupToDoc(value),
    editorProps: {
      attributes: {
        class: 'form-control border-0 rounded-top-0 shadow-none offer-rich-editor',
        style: `min-height: ${rows * 1.5 + 0.75}rem`,
        'aria-label': placeholder || 'Offer text',
      },
    },
    onUpdate: ({ editor: current }) => {
      const markup = docToMarkup(current.getJSON());
      lastValue.current = markup;
      onChange(markup);
    },
  });

  useEffect(() => {
    if (!editor || value === lastValue.current) return;
    lastValue.current = value;
    editor.commands.setContent(markupToDoc(value), false);
  }, [editor, value]);

  if (!editor) return null;

  const sizeLevel = editor.getAttributes('textSize').level || 0;

  const changeSize = (delta) => {
    const next = Math.max(MIN_TEXT_SIZE, Math.min(MAX_TEXT_SIZE, sizeLevel + delta));
    const chain = editor.chain().focus();
    if (next === 0) chain.unsetMark('textSize').run();
    else chain.setMark('textSize', { level: next }).run();
  };

  // With nothing selected, clears the formatting of the whole text
  const clearFormatting = () => {
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      editor.chain().focus().selectAll().unsetAllMarks().setTextSelection({ from, to }).run();
    } else {
      editor.chain().focus().unsetAllMarks().run();
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-1 p-1 border-bottom bg-body-tertiary rounded-top" role="toolbar" aria-label="Text formatting">
        <ToolbarButton label="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <i className="fa-solid fa-bold"></i>
        </ToolbarButton>
        <ToolbarButton label="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i className="fa-solid fa-italic"></i>
        </ToolbarButton>
        <ToolbarButton label="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <i className="fa-solid fa-underline"></i>
        </ToolbarButton>
        <ToolbarButton label="Strikethrough (Ctrl+Shift+S)" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <i className="fa-solid fa-strikethrough"></i>
        </ToolbarButton>
        <span className="vr mx-1"></span>
        <ToolbarButton label="Bigger text" active={sizeLevel > 0} onClick={() => changeSize(1)}>
          A+
        </ToolbarButton>
        <ToolbarButton label="Smaller text" active={sizeLevel < 0} onClick={() => changeSize(-1)}>
          A−
        </ToolbarButton>
        <span className="vr mx-1"></span>
        <ToolbarButton label="Clear formatting" active={false} onClick={clearFormatting}>
          <i className="fa-solid fa-text-slash"></i>
        </ToolbarButton>
        <span className="vr mx-1"></span>
        <ToolbarButton label="Undo (Ctrl+Z)" active={false} onClick={() => editor.chain().focus().undo().run()}>
          <i className="fa-solid fa-rotate-left"></i>
        </ToolbarButton>
        <ToolbarButton label="Redo (Ctrl+Y)" active={false} onClick={() => editor.chain().focus().redo().run()}>
          <i className="fa-solid fa-rotate-right"></i>
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </>
  );
};

export default RichTextEditor;
