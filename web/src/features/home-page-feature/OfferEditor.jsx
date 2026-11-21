import { useLayoutEffect, useRef, useState } from 'react';
import { composeOfferText, splitOfferText, stripFormatting } from './offerTextMarkup';
import { OfferPreview } from './OfferCard';
import { readLinkImage } from './offerUtils';

// The create/edit UI (composer, modals, toolbar) is English only, whatever the
// site language is.

const SIZE_OPPOSITE = { big: 'small', small: 'big' };

const TOOLBAR_BUTTONS = [
  { tag: 'b', label: 'Bold (Ctrl+B)', icon: 'fa-bold' },
  { tag: 'i', label: 'Italic (Ctrl+I)', icon: 'fa-italic' },
  { tag: 'u', label: 'Underline (Ctrl+U)', icon: 'fa-underline' },
  { tag: 's', label: 'Strikethrough', icon: 'fa-strikethrough' },
  { tag: 'big', label: 'Bigger text', text: 'A+' },
  { tag: 'small', label: 'Smaller text', text: 'A−' },
];

const SHORTCUTS = { b: 'b', i: 'i', u: 'u' };

// Adds the markup tag around the selected text. Clicking Bold/Italic/... again
// on already wrapped text removes the tag. Bigger/Smaller nest, so each click
// grows/shrinks the text one more step, and Smaller on [big] text undoes
// one Bigger step (and the other way round).
const toggleTag = (value, start, end, tag) => {
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);

  const unwrapAround = (t) => {
    const open = `[${t}]`;
    const close = `[/${t}]`;
    if (before.endsWith(open) && after.startsWith(close)) {
      return {
        value: before.slice(0, -open.length) + selected + after.slice(close.length),
        start: start - open.length,
        end: end - open.length,
      };
    }
    if (selected.length >= open.length + close.length && selected.startsWith(open) && selected.endsWith(close)) {
      const inner = selected.slice(open.length, selected.length - close.length);
      return { value: before + inner + after, start, end: start + inner.length };
    }
    return null;
  };

  const opposite = SIZE_OPPOSITE[tag];
  const unwrapped = opposite ? unwrapAround(opposite) : unwrapAround(tag);
  if (unwrapped) return unwrapped;

  const open = `[${tag}]`;
  return {
    value: `${before}${open}${selected}[/${tag}]${after}`,
    start: start + open.length,
    end: start + open.length + selected.length,
  };
};

// Textarea with a toolbar whose buttons add formatting markup to the selected
// text (or insert an empty pair of tags at the cursor when nothing is selected).
export const FormattedTextarea = ({ value, onChange, rows, placeholder, className = '' }) => {
  const ref = useRef(null);
  const pendingSelection = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !pendingSelection.current) return;
    const [start, end] = pendingSelection.current;
    pendingSelection.current = null;
    el.focus();
    el.setSelectionRange(start, end);
  }, [value]);

  const update = (result) => {
    pendingSelection.current = [result.start, result.end];
    onChange(result.value);
  };

  const applyTag = (tag) => {
    const el = ref.current;
    if (!el) return;
    update(toggleTag(value, el.selectionStart, el.selectionEnd, tag));
  };

  const clearFormatting = () => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    // No selection: clear the whole text
    const [from, to] = start === end ? [0, value.length] : [start, end];
    const cleaned = stripFormatting(value.slice(from, to));
    update({
      value: value.slice(0, from) + cleaned + value.slice(to),
      start: from,
      end: from + cleaned.length,
    });
  };

  const handleKeyDown = (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    const tag = SHORTCUTS[e.key.toLowerCase()];
    if (!tag) return;
    e.preventDefault();
    applyTag(tag);
  };

  // onMouseDown + preventDefault keeps the focus (and selection) in the textarea
  const keepSelection = (e) => e.preventDefault();

  return (
    <div className={`border rounded ${className}`}>
      <div className="d-flex flex-wrap gap-1 p-1 border-bottom bg-body-tertiary rounded-top" role="toolbar" aria-label="Text formatting">
        {TOOLBAR_BUTTONS.map(({ tag, label, icon, text }) => (
          <button
            key={tag}
            type="button"
            className="btn btn-light btn-sm fw-semibold"
            style={{ minWidth: '32px' }}
            title={label}
            aria-label={label}
            onMouseDown={keepSelection}
            onClick={() => applyTag(tag)}
          >
            {icon ? <i className={`fa-solid ${icon}`}></i> : text}
          </button>
        ))}
        <span className="vr mx-1"></span>
        <button
          type="button"
          className="btn btn-light btn-sm"
          style={{ minWidth: '32px' }}
          title="Clear formatting"
          aria-label="Clear formatting"
          onMouseDown={keepSelection}
          onClick={clearFormatting}
        >
          <i className="fa-solid fa-text-slash"></i>
        </button>
      </div>
      <textarea
        ref={ref}
        className="form-control border-0 rounded-top-0 shadow-none"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

// URL, title and image inputs, shared by the link modal and
// the edit offer modal. idPrefix keeps input ids unique between the two.
export const LinkFields = ({ draft, setDraft, idPrefix }) => {
  const [imageError, setImageError] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const update = (field) => (e) => setDraft({ ...draft, [field]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageError(false);
      setDraft({ ...draft, image: await readLinkImage(file) });
    } catch {
      setImageError(true);
    }
  };

  const removeImage = () => {
    setDraft({ ...draft, image: '' });
    setFileInputKey((key) => key + 1);
  };

  return (
    <>
      <div className="mb-3">
        <label className="form-label" htmlFor={`${idPrefix}Url`}>
          URL
        </label>
        <input
          id={`${idPrefix}Url`}
          type="url"
          className="form-control"
          placeholder="https://www.example.com/..."
          value={draft.url}
          onChange={update('url')}
        />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={`${idPrefix}Title`}>
          Title
        </label>
        <input
          id={`${idPrefix}Title`}
          type="text"
          className="form-control"
          value={draft.title}
          onChange={update('title')}
        />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={`${idPrefix}Image`}>
          Image
        </label>
        <div className="d-flex align-items-center gap-2">
          <input
            id={`${idPrefix}Image`}
            key={fileInputKey}
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImageChange}
          />
          {draft.image && (
            <button type="button" className="btn btn-outline-danger" onClick={removeImage}>
              Remove
            </button>
          )}
        </div>
        {imageError && (
          <div className="text-danger small mt-1">Could not use this image. Please choose another picture.</div>
        )}
      </div>
    </>
  );
};

export const LinkModal = ({ draft, setDraft, onSave, previewOffer, cardProps }) => (
  <div className="modal fade" id="offerLinkModal" tabIndex="-1" aria-labelledby="offerLinkModalLabel" aria-hidden="true">
    <div className="modal-dialog modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="offerLinkModalLabel">
            Link
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
          <LinkFields draft={draft} setDraft={setDraft} idPrefix="offerLink" />
          <OfferPreview offer={{ ...previewOffer, link: draft }} {...cardProps} />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-bs-dismiss="modal"
            disabled={!draft.url.trim() && !draft.image}
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
);

// The form inside the edit modal. It gets a fresh key for every Edit click, so
// its state starts from the offer being edited instead of leftovers from a
// cancelled edit. Only the content remounts: the modal element itself stays,
// so Bootstrap keeps working with the same element.
const EditOfferForm = ({ offer, onSave, cardProps }) => {
  const initial = splitOfferText(offer?.text);
  const [title, setTitle] = useState(initial.title);
  const [text, setText] = useState(initial.body);
  const [linkDraft, setLinkDraft] = useState({
    url: offer?.link?.url ?? '',
    title: offer?.link?.title ?? '',
    image: offer?.link?.image ?? '',
  });

  const composedText = composeOfferText(title, text);
  const canSave = Boolean(composedText || linkDraft.url.trim() || linkDraft.image);

  return (
    <>
      <div className="modal-body">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormattedTextarea className="mb-4" rows="6" placeholder="Write an offer..." value={text} onChange={setText} />
        <h6 className="mb-3">Link</h6>
        <LinkFields draft={linkDraft} setDraft={setLinkDraft} idPrefix="editOfferLink" />
        {offer && (
          <OfferPreview
            offer={{ text: composedText, link: linkDraft, author: offer.author, createdAt: offer.createdAt }}
            {...cardProps}
          />
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          data-bs-dismiss="modal"
          disabled={!offer || !canSave}
          onClick={() => onSave(offer, composedText, linkDraft)}
        >
          Save
        </button>
      </div>
    </>
  );
};

export const EditOfferModal = ({ offer, formKey, onSave, cardProps }) => (
  <div className="modal fade" id="editOfferModal" tabIndex="-1" aria-labelledby="editOfferModalLabel" aria-hidden="true">
    <div className="modal-dialog modal-dialog-scrollable modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="editOfferModalLabel">
            Edit offer
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <EditOfferForm key={formKey} offer={offer} onSave={onSave} cardProps={cardProps} />
      </div>
    </div>
  </div>
);

export const DeleteOfferModal = ({ onConfirm }) => (
  <div className="modal fade" id="deleteOfferModal" tabIndex="-1" aria-hidden="true">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-body">Are you sure you want to delete this offer?</div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);
