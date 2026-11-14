import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useGetAllConsumablesQuery } from 'src/app/services/consumableApiSlice';
import {
  useGetAllOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from 'src/app/services/offerApiSlice';
import { useGetCurrentUserQuery } from 'src/app/services/userApiSlice';
import { composeOfferText, splitOfferText, renderOfferText } from './offerTextMarkup';

const RELATIVE_TIME_REFRESH_MS = 30000;

const LINK_IMAGE_MAX_WIDTH = 1000;
const EMPTY_LINK = { title: '', url: '', image: '' };

const normalizeUrl = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const hostnameOf = (url) => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// Shrinks big photos before upload (the backend resizes too, but this keeps
// the request small) and gives a data URL for the preview.
const readLinkImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, LINK_IMAGE_MAX_WIDTH / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

const bgUnit = (count, singular, plural) => `преди ${count} ${count === 1 ? singular : plural}`;
const enUnit = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

const formatRelativeTime = (iso, lang) => {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));

  if (diffSec < 5) {
    return lang === 'en' ? 'just now' : 'току-що';
  }
  if (diffSec < 60) {
    return lang === 'en' ? enUnit(diffSec, 'second') : bgUnit(diffSec, 'секунда', 'секунди');
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return lang === 'en' ? enUnit(diffMin, 'minute') : bgUnit(diffMin, 'минута', 'минути');
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return lang === 'en' ? enUnit(diffHour, 'hour') : bgUnit(diffHour, 'час', 'часа');
  }
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return lang === 'en' ? enUnit(diffDay, 'day') : bgUnit(diffDay, 'ден', 'дни');
  }

  return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const AuthorAvatar = ({ author }) => {
  const size = 40;
  return author?.image ? (
    <img
      src={author.image}
      alt={author.username}
      className="flex-shrink-0"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
    />
  ) : (
    <span
      className="d-flex align-items-center justify-content-center flex-shrink-0 bg-secondary-subtle text-secondary"
      style={{ width: size, height: size, borderRadius: '50%' }}
    >
      <i className="fa-solid fa-user"></i>
    </span>
  );
};

// Link preview card: image on top, then a grey footer with the URL's domain
// (e.g. "AMAZON.DE") and the title, the whole card opening the URL. An offer
// can also have just an image (no URL): then it's shown without the footer
// and isn't clickable.
const LinkPreview = ({ link }) => {
  if (!link?.url && !link?.title && !link?.image) return null;
  const domain = link.url ? hostnameOf(link.url) : '';
  const Wrapper = link.url ? 'a' : 'div';
  const linkProps = link.url ? { href: normalizeUrl(link.url), target: '_blank', rel: 'noreferrer' } : {};
  return (
    <Wrapper {...linkProps} className="d-block text-reset text-decoration-none border-top">
      {link.image && (
        <img
          src={link.image}
          alt=""
          className="w-100"
          style={{ display: 'block', maxHeight: '360px', objectFit: 'cover' }}
        />
      )}
      {(domain || link.title) && (
        <div className="px-3 py-2 bg-body-tertiary">
          {domain && (
            <div className="text-muted text-uppercase text-truncate" style={{ fontSize: '0.8rem' }}>
              {domain}
            </div>
          )}
          {link.title && (
            <div
              className="fw-semibold"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {link.title}
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
};

const OfferCard = ({ offer, lang, robots, consumables, isAdmin, onRequestEdit, onRequestDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="card mb-3 position-relative overflow-hidden">
      {isAdmin && onRequestDelete && (
        <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 1 }}>
          <button
            type="button"
            className="btn btn-sm btn-primary me-1"
            data-bs-toggle="modal"
            data-bs-target="#editOfferModal"
            onClick={() => onRequestEdit(offer)}
          >
            {t('Edit')}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            data-bs-toggle="modal"
            data-bs-target="#deleteOfferModal"
            onClick={() => onRequestDelete(offer.id)}
          >
            {t('Delete')}
          </button>
        </div>
      )}
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-2">
          {offer.author && <AuthorAvatar author={offer.author} />}
          <div className="d-flex flex-column" style={{ minWidth: 0 }}>
            {offer.author && <span className="fw-semibold text-truncate">{offer.author.username}</span>}
            <span className="text-muted small">{formatRelativeTime(offer.createdAt, lang)}</span>
          </div>
        </div>
        <div className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
          {renderOfferText(offer.text, robots, consumables)}
        </div>
      </div>
      <LinkPreview link={offer.link} />
    </div>
  );
};

// The whole offer as it will look once posted: author, title, text and link.
const OfferPreview = ({ offer, lang, robots, consumables }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="text-muted small text-uppercase mb-2">{t('offerPreview')}</div>
      <OfferCard offer={offer} lang={lang} robots={robots} consumables={consumables} isAdmin={false} />
    </>
  );
};

// URL, title and image inputs, shared by the link modal and
// the edit offer modal. idPrefix keeps input ids unique between the two.
const LinkFields = ({ draft, setDraft, idPrefix }) => {
  const { t } = useTranslation();
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
          {t('title')}
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
          {t('image')}
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
              {t('remove')}
            </button>
          )}
        </div>
        {imageError && <div className="text-danger small mt-1">{t('profilePictureError')}</div>}
      </div>
    </>
  );
};

const LinkModal = ({ draft, setDraft, onSave, previewOffer, cardProps }) => {
  const { t } = useTranslation();

  return (
    <div className="modal fade" id="offerLinkModal" tabIndex="-1" aria-labelledby="offerLinkModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="offerLinkModalLabel">
              {t('offerLink')}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label={t('close')}></button>
          </div>
          <div className="modal-body">
            <LinkFields draft={draft} setDraft={setDraft} idPrefix="offerLink" />
            <OfferPreview offer={{ ...previewOffer, link: draft }} {...cardProps} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              {t('close')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              disabled={!draft.url.trim() && !draft.image}
              onClick={onSave}
            >
              {t('saveLink')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// The form inside the edit modal. It gets a fresh key for every Edit click, so
// its state starts from the offer being edited instead of leftovers from a
// cancelled edit. Only the content remounts: the modal element itself stays,
// so Bootstrap keeps working with the same element.
const EditOfferForm = ({ offer, onSave, cardProps }) => {
  const { t } = useTranslation();
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
          placeholder={t('offerTitlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-4"
          rows="6"
          placeholder={t('writeOfferPlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <h6 className="mb-3">{t('offerLink')}</h6>
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
          {t('close')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          data-bs-dismiss="modal"
          disabled={!offer || !canSave}
          onClick={() => onSave(offer, composedText, linkDraft)}
        >
          {t('saveLink')}
        </button>
      </div>
    </>
  );
};

const EditOfferModal = ({ offer, formKey, onSave, cardProps }) => {
  const { t } = useTranslation();

  return (
    <div className="modal fade" id="editOfferModal" tabIndex="-1" aria-labelledby="editOfferModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editOfferModalLabel">
              {t('editOffer')}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label={t('close')}></button>
          </div>
          <EditOfferForm key={formKey} offer={offer} onSave={onSave} cardProps={cardProps} />
        </div>
      </div>
    </div>
  );
};

const Offers = () => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.language.lang);
  const { username, role, accessToken } = useSelector((state) => state.auth);
  const isAdmin = role === 'ADMIN' || role === 'MODERATOR';
  const { data: robots } = useGetAllRobotsQuery();
  const { data: consumables } = useGetAllConsumablesQuery();
  const { data: offers = [] } = useGetAllOffersQuery();
  const { data: currentUser } = useGetCurrentUserQuery(accessToken, { skip: !accessToken || !isAdmin });
  const [createOffer, { isLoading: isPosting }] = useCreateOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState(null);
  const [linkDraft, setLinkDraft] = useState(EMPTY_LINK);
  const [offerIdToDelete, setOfferIdToDelete] = useState(null);
  const [offerToEdit, setOfferToEdit] = useState(null);
  const [editKey, setEditKey] = useState(0);
  const [, setRelativeTimeTick] = useState(0);

  // Re-render periodically to keep "X minutes ago" timestamps fresh without
  // needing a refresh.
  useEffect(() => {
    const intervalId = setInterval(() => setRelativeTimeTick((tick) => tick + 1), RELATIVE_TIME_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);

  const composedText = composeOfferText(title, text);
  const canPost = Boolean(composedText || link);

  const resetForm = () => {
    setTitle('');
    setText('');
    setLink(null);
  };

  const openLinkModal = () => setLinkDraft(link || EMPTY_LINK);

  const saveLink = () => {
    setLink({
      title: linkDraft.title.trim(),
      url: normalizeUrl(linkDraft.url),
      image: linkDraft.image || null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canPost || isPosting) return;

    const formData = new FormData();
    if (composedText) formData.append('text', composedText);
    if (link) {
      formData.append('linkUrl', link.url);
      if (link.title) formData.append('linkTitle', link.title);
      if (link.image) formData.append('linkImage', await dataUrlToBlob(link.image), 'link.jpg');
    }

    try {
      await createOffer({ accessToken, formData }).unwrap();
      resetForm();
    } catch {
      toast.error(t('somethingWentWrong'));
    }
  };

  const requestEdit = (offer) => {
    setOfferToEdit(offer);
    setEditKey((key) => key + 1);
  };

  const handleUpdate = async (offer, composedText, linkDraft) => {
    const url = linkDraft.url.trim();
    const formData = new FormData();
    if (composedText) formData.append('text', composedText);
    if (url) formData.append('linkUrl', normalizeUrl(url));
    if (linkDraft.title.trim()) formData.append('linkTitle', linkDraft.title.trim());
    // A data URL is a newly picked image; an empty one means the old image was removed
    if (linkDraft.image.startsWith('data:')) {
      formData.append('linkImage', await dataUrlToBlob(linkDraft.image), 'link.jpg');
    } else if (!linkDraft.image) {
      formData.append('removeLinkImage', 'true');
    }

    try {
      await updateOffer({ id: offer.id, accessToken, formData }).unwrap();
    } catch {
      toast.error(t('somethingWentWrong'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOffer({ id, accessToken }).unwrap();
    } catch {
      toast.error(t('somethingWentWrong'));
    }
  };

  const previewOffer = {
    text: composedText,
    link,
    author: { username, image: currentUser?.profilePicture ?? null },
    createdAt: new Date().toISOString(),
  };
  const cardProps = { lang, robots, consumables };

  return (
    <div style={{ marginTop: '20px', marginBottom: '50px' }}>
      <h3 className="fw-bolder" style={{ textAlign: 'center' }}>
        {t('offers')}
      </h3>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-4 mt-4">
          <div className="border rounded p-3 mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder={t('offerTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="form-control mb-3"
              rows="4"
              placeholder={t('writeOfferPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-light btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#offerLinkModal"
                onClick={openLinkModal}
              >
                <i className="fa-solid fa-link me-1"></i>
                {link ? t('editLink') : t('addLink')}
              </button>

              {link && (
                <span className="d-inline-flex align-items-center gap-1 small text-muted" style={{ minWidth: 0 }}>
                  <span className="text-truncate" style={{ maxWidth: '240px' }}>
                    {link.title || link.url || t('image')}
                  </span>
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: '20px', height: '20px' }}
                    aria-label={t('remove')}
                    onClick={() => setLink(null)}
                  >
                    <i className="fa-solid fa-xmark fa-2xs"></i>
                  </button>
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary text-center" disabled={!canPost || isPosting}>
            {t('postOffer')}
          </button>

          {canPost && (
            <div className="mt-4">
              <OfferPreview offer={previewOffer} {...cardProps} />
            </div>
          )}
        </form>
      )}

      {isAdmin && (
        <LinkModal
          draft={linkDraft}
          setDraft={setLinkDraft}
          onSave={saveLink}
          previewOffer={previewOffer}
          cardProps={cardProps}
        />
      )}
      {isAdmin && <EditOfferModal formKey={editKey} offer={offerToEdit} onSave={handleUpdate} cardProps={cardProps} />}

      {offers.length === 0 ? (
        <div className="text-center text-muted mt-4">{t('noOffersYet')}</div>
      ) : (
        offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            lang={lang}
            robots={robots}
            consumables={consumables}
            isAdmin={isAdmin}
            onRequestEdit={requestEdit}
            onRequestDelete={setOfferIdToDelete}
          />
        ))
      )}

      {isAdmin && (
        <div className="modal fade" id="deleteOfferModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">{t('confirmDeleteOffer')}</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  {t('close')}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  onClick={() => handleDelete(offerIdToDelete)}
                >
                  {t('Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
