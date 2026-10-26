import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';

const RELATIVE_TIME_REFRESH_MS = 30000;
const NO_IMAGE = 'images/no-image.jpg';

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

const OfferMedia = ({ image, title, promoCode }) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex bg-body-tertiary">
      {image && (
        <img
          src={image}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{ width: '120px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
        />
      )}
      {(title || promoCode) && (
        <div className="p-2 d-flex flex-column justify-content-center">
          {title && <div className="fw-bold">{title}</div>}
          {promoCode && (
            <div className="small">
              <span className="text-muted me-1">{t('promoCode')}:</span>
              <span className="fw-bold font-monospace">{promoCode}</span>
            </div>
          )}
        </div>
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

  const [offers, setOffers] = useState([]);
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [titleSource, setTitleSource] = useState('manual');
  const [selectedRobotId, setSelectedRobotId] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualImage, setManualImage] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [offerIdToDelete, setOfferIdToDelete] = useState(null);
  const [, setRelativeTimeTick] = useState(0);

  // Offers only live in memory for this page load, so re-render periodically
  // to keep "X minutes ago" timestamps fresh without needing a refresh.
  useEffect(() => {
    const intervalId = setInterval(() => setRelativeTimeTick((tick) => tick + 1), RELATIVE_TIME_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);

  const sortedRobots = robots ? [...robots].sort((a, b) => a.model.localeCompare(b.model)) : [];
  const selectedRobot = sortedRobots.find((robot) => String(robot.id) === String(selectedRobotId));

  const resetForm = () => {
    setText('');
    setLink('');
    setPromoCode('');
    setTitleSource('manual');
    setSelectedRobotId('');
    setManualTitle('');
    setManualImage('');
    setFileInputKey((key) => key + 1);
  };

  const handleManualImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setManualImage('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setManualImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const title = titleSource === 'robot' ? selectedRobot?.model || null : manualTitle.trim() || null;
    const image = titleSource === 'robot' ? selectedRobot?.image || NO_IMAGE : manualImage || null;

    const newOffer = {
      id: Date.now(),
      text: text.trim(),
      link: link.trim() || null,
      promoCode: promoCode.trim() || null,
      title,
      image,
      createdAt: new Date().toISOString(),
    };

    setOffers([newOffer, ...offers]);
    resetForm();
  };

  const handleDelete = (id) => {
    setOffers(offers.filter((offer) => offer.id !== id));
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

            <input
              type="text"
              className="form-control mb-2"
              placeholder={t('offerLinkPlaceholder')}
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder={t('promoCodePlaceholder')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />

            <div className="d-flex gap-3 mb-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offerTitleSource"
                  id="offerTitleSourceManual"
                  checked={titleSource === 'manual'}
                  onChange={() => setTitleSource('manual')}
                />
                <label className="form-check-label" htmlFor="offerTitleSourceManual">
                  {t('addManually')}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offerTitleSource"
                  id="offerTitleSourceRobot"
                  checked={titleSource === 'robot'}
                  onChange={() => setTitleSource('robot')}
                />
                <label className="form-check-label" htmlFor="offerTitleSourceRobot">
                  {t('selectRobotFromDatabase')}
                </label>
              </div>
            </div>

            {titleSource === 'robot' ? (
              <>
                <select
                  className="form-select mb-2"
                  value={selectedRobotId}
                  onChange={(e) => setSelectedRobotId(e.target.value)}
                >
                  <option value="">{t('chooseRobotPlaceholder')}</option>
                  {sortedRobots.map((robot) => (
                    <option key={robot.id} value={robot.id}>
                      {robot.model}
                    </option>
                  ))}
                </select>
                {selectedRobot && (
                  <div className="border rounded overflow-hidden">
                    <OfferMedia
                      image={selectedRobot.image || NO_IMAGE}
                      title={selectedRobot.model}
                      promoCode={promoCode}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder={t('manualTitlePlaceholder')}
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                />
                <label className="form-label small text-muted mb-1">{t('manualImagePlaceholder')}</label>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleManualImageFileChange}
                />
                {manualImage && (
                  <div className="border rounded overflow-hidden mt-2">
                    <OfferMedia image={manualImage} title={manualTitle} promoCode={promoCode} />
                  </div>
                )}
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary text-center" disabled={!text.trim()}>
            {t('postOffer')}
          </button>
        </form>
      )}

      {offers.length === 0 ? (
        <div className="text-center text-muted mt-4">{t('noOffersYet')}</div>
      ) : (
        offers.map((offer) => (
          <div className="card mb-3 position-relative" key={offer.id}>
            {isAdmin && (
              <button
                type="button"
                className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '28px', height: '28px', padding: 0 }}
                aria-label={t('Delete')}
                data-bs-toggle="modal"
                data-bs-target="#deleteOfferModal"
                onClick={() => setOfferIdToDelete(offer.id)}
              >
                <i className="fa-solid fa-trash fa-xs text-danger"></i>
              </button>
            )}
            <div className="card-body">
              <div className="text-muted small mb-2">{formatRelativeTime(offer.createdAt, lang)}</div>
              <p className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                {offer.text}
              </p>

              {offer.image || offer.title ? (
                offer.link ? (
                  <a
                    href={offer.link}
                    target="_blank"
                    rel="noreferrer"
                    className="d-block border rounded overflow-hidden text-decoration-none text-dark mb-2"
                  >
                    <OfferMedia image={offer.image} title={offer.title} promoCode={offer.promoCode} />
                  </a>
                ) : (
                  <div className="border rounded overflow-hidden mb-2">
                    <OfferMedia image={offer.image} title={offer.title} promoCode={offer.promoCode} />
                  </div>
                )
              ) : (
                <>
                  {offer.link && (
                    <a href={offer.link} target="_blank" rel="noreferrer" className="d-block mb-2">
                      {offer.link}
                    </a>
                  )}
                  {offer.promoCode && (
                    <div>
                      <span className="text-muted small me-2">{t('promoCode')}:</span>
                      <span className="fw-bold font-monospace">{offer.promoCode}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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
