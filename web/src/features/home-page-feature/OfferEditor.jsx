import { lazy, Suspense, useState } from 'react';
import { composeOfferText, splitOfferText } from './offerTextMarkup';
import { OfferPreview } from './OfferCard';
import { readLinkImage } from './offerUtils';

// The create/edit UI (composer, modals, toolbar) is English only, whatever the
// site language is.

// The rich text editor (and its library) only loads when an admin opens the
// composer, so visitors don't download it.
const RichTextEditor = lazy(() => import('./RichTextEditor'));

// Offer text field: shows formatting (bold, sizes...) directly instead of
// tags, with a formatting toolbar. value/onChange use the offer markup.
export const OfferTextEditor = ({ value, onChange, rows = 4, placeholder, className = '' }) => (
  <div className={`border rounded ${className}`}>
    <Suspense
      fallback={
        <div className="text-muted small p-2" style={{ minHeight: `${rows * 1.5 + 3}rem` }}>
          Loading editor…
        </div>
      }
    >
      <RichTextEditor value={value} onChange={onChange} rows={rows} placeholder={placeholder} />
    </Suspense>
  </div>
);

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
        <OfferTextEditor className="mb-4" rows={6} placeholder="Write an offer..." value={text} onChange={setText} />
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
