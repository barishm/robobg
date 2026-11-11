import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useGetAllConsumablesQuery } from 'src/app/services/consumableApiSlice';
import { composeOfferText, renderOfferText } from './offerTextMarkup';
import { getProfilePicture } from 'src/utils/profilePicture';

const RELATIVE_TIME_REFRESH_MS = 30000;
const OFFERS_STORAGE_KEY = 'robobg_offers';

// Offers have no backend yet, so they're kept in the browser's sessionStorage
// (not cookies: an offer's link can carry a base64 image, which would blow past
// cookies' ~4KB limit and get sent to the server on every request for no
// reason) so they survive a page reload instead of only living in memory.
// Not localStorage: logging out (including the automatic logout any
// signed-out visit triggers) calls localStorage.clear(), which would wipe
// the offers along with the auth token.
const loadStoredOffers = () => {
  try {
    const raw = sessionStorage.getItem(OFFERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

// Shrinks big photos before they're stored as base64, so a single link image
// doesn't eat most of sessionStorage's ~5MB quota.
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
// (e.g. "AMAZON.DE") and the title, the whole card opening the URL.
const LinkPreview = ({ link }) => {
  if (!link?.url) return null;
  const domain = hostnameOf(link.url);
  return (
    <a
      href={normalizeUrl(link.url)}
      target="_blank"
      rel="noreferrer"
      className="d-block text-reset text-decoration-none border-top"
    >
      {link.image && (
        <img
          src={link.image}
          alt=""
          className="w-100"
          style={{ display: 'block', maxHeight: '360px', objectFit: 'cover' }}
        />
      )}
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
    </a>
  );
};

const OfferCard = ({ offer, lang, robots, consumables, isAdmin, onRequestDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="card mb-3 position-relative overflow-hidden">
      {isAdmin && onRequestDelete && (
        <button
          type="button"
          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
          style={{ zIndex: 1 }}
          data-bs-toggle="modal"
          data-bs-target="#deleteOfferModal"
          onClick={() => onRequestDelete(offer.id)}
        >
          {t('Delete')}
        </button>
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

const LinkModal = ({ draft, setDraft, onSave }) => {
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
            <div className="mb-3">
              <label className="form-label" htmlFor="offerLinkUrl">
                URL
              </label>
              <input
                id="offerLinkUrl"
                type="url"
                className="form-control"
                placeholder="https://www.example.com/..."
                value={draft.url}
                onChange={update('url')}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="offerLinkTitle">
                {t('title')}
              </label>
              <input
                id="offerLinkTitle"
                type="text"
                className="form-control"
                value={draft.title}
                onChange={update('title')}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="offerLinkImage">
                {t('image')}
              </label>
              <div className="d-flex align-items-center gap-2">
                <input
                  id="offerLinkImage"
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

            {draft.url.trim() && (
              <>
                <div className="text-muted small text-uppercase mb-2">{t('offerPreview')}</div>
                <div className="card overflow-hidden">
                  <LinkPreview link={draft} />
                </div>
              </>
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
              disabled={!draft.url.trim()}
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

const Offers = () => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.language.lang);
  const { username, role } = useSelector((state) => state.auth);
  const isAdmin = role === 'ADMIN' || role === 'MODERATOR';
  const { data: robots } = useGetAllRobotsQuery();
  const { data: consumables } = useGetAllConsumablesQuery();

  const [offers, setOffers] = useState(loadStoredOffers);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState(null);
  const [linkDraft, setLinkDraft] = useState(EMPTY_LINK);
  const [offerIdToDelete, setOfferIdToDelete] = useState(null);
  const [, setRelativeTimeTick] = useState(0);

  // Re-render periodically to keep "X minutes ago" timestamps fresh without
  // needing a refresh.
  useEffect(() => {
    const intervalId = setInterval(() => setRelativeTimeTick((tick) => tick + 1), RELATIVE_TIME_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);

  // Images are base64, so a few offers with big link images or author
  // pictures can blow past sessionStorage's quota (~5MB). If the full list
  // doesn't fit, drop link images (oldest offers first, keeping everything
  // else) until what's left does, so an image never costs us the whole
  // offers list after a reload.
  useEffect(() => {
    const tryPersist = (list) => {
      try {
        sessionStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(list));
        return true;
      } catch {
        return false;
      }
    };

    if (tryPersist(offers)) return;

    const trimmed = [...offers];
    for (let i = trimmed.length - 1; i >= 0; i--) {
      if (!trimmed[i].link?.image) continue;
      trimmed[i] = { ...trimmed[i], link: { ...trimmed[i].link, image: null } };
      if (tryPersist(trimmed)) return;
    }
  }, [offers]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canPost) return;

    const newOffer = {
      id: Date.now(),
      text: composedText,
      link,
      author: { username, image: getProfilePicture(username) },
      createdAt: new Date().toISOString(),
    };

    setOffers([newOffer, ...offers]);
    resetForm();
  };

  const handleDelete = (id) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  const previewOffer = {
    text: composedText,
    link,
    author: { username, image: getProfilePicture(username) },
    createdAt: new Date().toISOString(),
  };

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
                    {link.title || link.url}
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

          <button type="submit" className="btn btn-primary text-center" disabled={!canPost}>
            {t('postOffer')}
          </button>

          {canPost && (
            <div className="mt-4">
              <div className="text-muted small text-uppercase mb-2">{t('offerPreview')}</div>
              <OfferCard offer={previewOffer} lang={lang} robots={robots} consumables={consumables} isAdmin={false} />
            </div>
          )}
        </form>
      )}

      {isAdmin && <LinkModal draft={linkDraft} setDraft={setLinkDraft} onSave={saveLink} />}

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
