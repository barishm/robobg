import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useGetAllConsumablesQuery } from 'src/app/services/consumableApiSlice';
import { renderOfferText } from './offerTextMarkup';

const RELATIVE_TIME_REFRESH_MS = 30000;
const OFFERS_STORAGE_KEY = 'robobg_offers';

// Offers have no backend yet, so they're kept in the browser's sessionStorage
// (not cookies: an offer can carry a base64 image, which would blow past
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
        <div className="text-muted small mb-2">{formatRelativeTime(offer.createdAt, lang)}</div>
        <div className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
          {renderOfferText(offer.text, robots, consumables)}
        </div>
      </div>
      {offer.image && (
        <img
          src={offer.image}
          alt=""
          className="w-100"
          style={{ display: 'block', maxHeight: '320px', objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

const Offers = () => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.language.lang);
  const { role } = useSelector((state) => state.auth);
  const isAdmin = role === 'ADMIN' || role === 'MODERATOR';
  const { data: robots } = useGetAllRobotsQuery();
  const { data: consumables } = useGetAllConsumablesQuery();

  const fileInputRef = useRef(null);
  const [offers, setOffers] = useState(loadStoredOffers);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [offerIdToDelete, setOfferIdToDelete] = useState(null);
  const [, setRelativeTimeTick] = useState(0);

  // Re-render periodically to keep "X minutes ago" timestamps fresh without
  // needing a refresh.
  useEffect(() => {
    const intervalId = setInterval(() => setRelativeTimeTick((tick) => tick + 1), RELATIVE_TIME_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);

  // A photo straight from a phone camera can easily be several MB once
  // base64-encoded, which blows past sessionStorage's quota (~5MB) on its
  // own. If the full list doesn't fit, drop images (oldest offers first,
  // keeping their text) until what's left does, so a big image never costs
  // us the whole offers list after a reload.
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

    const trimmed = offers.map((offer) => ({ ...offer }));
    for (let i = trimmed.length - 1; i >= 0; i--) {
      if (!trimmed[i].image) continue;
      trimmed[i] = { ...trimmed[i], image: null };
      if (tryPersist(trimmed)) return;
    }
  }, [offers]);

  const resetForm = () => {
    setText('');
    setImage('');
    setFileInputKey((key) => key + 1);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newOffer = {
      id: Date.now(),
      text: text.trim(),
      image: image || null,
      createdAt: new Date().toISOString(),
    };

    setOffers([newOffer, ...offers]);
    resetForm();
  };

  const handleDelete = (id) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  const previewOffer = {
    text: text.trim(),
    image: image || null,
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
            <textarea
              className="form-control mb-3"
              rows="4"
              placeholder={t('writeOfferPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm"
                aria-label={t('offerImagePlaceholder')}
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src="/images/image.png"
                  className="img-fluid"
                  style={{ maxHeight: '1.3rem' }}
                  alt={t('offerImagePlaceholder')}
                />
              </button>

              {image && (
                <div className="position-relative">
                  <img
                    src={image}
                    alt=""
                    className="rounded border"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', display: 'block' }}
                  />
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-circle position-absolute top-0 start-100 translate-middle d-flex align-items-center justify-content-center p-0 shadow-sm"
                    style={{ width: '18px', height: '18px' }}
                    aria-label={t('Delete')}
                    onClick={() => {
                      setImage('');
                      setFileInputKey((key) => key + 1);
                    }}
                  >
                    <i className="fa-solid fa-xmark fa-2xs"></i>
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              key={fileInputKey}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleImageFileChange}
            />
          </div>

          <button type="submit" className="btn btn-primary text-center" disabled={!text.trim()}>
            {t('postOffer')}
          </button>

          {previewOffer.text && (
            <div className="mt-4">
              <div className="text-muted small text-uppercase mb-2">{t('offerPreview')}</div>
              <OfferCard offer={previewOffer} lang={lang} robots={robots} consumables={consumables} isAdmin={false} />
            </div>
          )}
        </form>
      )}

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
