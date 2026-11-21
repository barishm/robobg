import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ActionsMenu from 'src/components/ActionsMenu';
import { renderOfferText } from './offerTextMarkup';
import { formatRelativeTime, hostnameOf, normalizeUrl } from './offerUtils';

const COLLAPSED_LINES = 7;

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
    <Wrapper {...linkProps} className="d-block text-reset text-decoration-none border-top rounded-bottom overflow-hidden">
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

// Shows the first 7 lines of the offer; when there is more, an arrow button
// expands it to the full text (and collapses it again).
const CollapsibleText = ({ text, children }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return undefined;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  const clampStyle = expanded
    ? {}
    : {
        display: '-webkit-box',
        WebkitLineClamp: COLLAPSED_LINES,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      };

  return (
    <>
      <div ref={ref} className="mb-0" style={{ whiteSpace: 'pre-wrap', ...clampStyle }}>
        {children}
      </div>
      {(overflowing || expanded) && (
        <button
          type="button"
          className="btn btn-link btn-sm px-0 mt-1 text-decoration-none text-body"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t('showLess') : t('showMore')}
          <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} ms-1`}></i>
        </button>
      )}
    </>
  );
};

export const OfferCard = ({
  offer,
  lang,
  robots,
  consumables,
  isAdmin,
  onRequestEdit,
  onRequestDelete,
  collapsible = true,
  clickable = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const time = offer.createdAt ? formatRelativeTime(offer.createdAt, lang) : '';
  const renderedText = renderOfferText(offer.text, robots, consumables);
  const offerUrl = offer.id ? `/offers/${offer.id}` : null;
  const isClickable = clickable && Boolean(offerUrl);

  // Clicking anywhere on the card opens the offer's page, except on things
  // that do something themselves (links, hashtags, buttons, Show more, the
  // link preview) or when the click ends a text selection. Ctrl/Cmd/middle
  // click opens it in a new tab, like a normal link.
  const handleCardClick = (e) => {
    if (!isClickable) return;
    if (e.target.closest('a, button, input, textarea, select, label, [role="button"], .dropdown-menu')) return;
    if (window.getSelection()?.toString()) return;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(offerUrl, '_blank', 'noopener');
    } else {
      navigate(offerUrl);
    }
  };

  return (
    <div
      className={`card mb-3 position-relative${isClickable ? ' offer-card-clickable' : ''}`}
      onClick={handleCardClick}
      onAuxClick={(e) => e.button === 1 && handleCardClick(e)}
    >
      {isAdmin && onRequestDelete && (
        <ActionsMenu
          className="position-absolute top-0 end-0 m-2"
          style={{ zIndex: 2 }}
          items={[
            { label: t('Edit'), icon: 'fa-pen', modalTarget: '#editOfferModal', onClick: () => onRequestEdit(offer) },
            {
              label: t('Delete'),
              icon: 'fa-trash',
              modalTarget: '#deleteOfferModal',
              danger: true,
              onClick: () => onRequestDelete(offer.id),
            },
          ]}
        />
      )}
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-2">
          {offer.author && <AuthorAvatar author={offer.author} />}
          <div className="d-flex flex-column" style={{ minWidth: 0 }}>
            {offer.author && <span className="fw-semibold text-truncate">{offer.author.username}</span>}
            {offer.id ? (
              <Link to={`/offers/${offer.id}`} className="small link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">
                {time}
              </Link>
            ) : (
              <span className="text-muted small">{time}</span>
            )}
          </div>
        </div>
        {offer.text &&
          (collapsible ? (
            <CollapsibleText text={offer.text}>{renderedText}</CollapsibleText>
          ) : (
            <div className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {renderedText}
            </div>
          ))}
      </div>
      <LinkPreview link={offer.link} />
    </div>
  );
};

// The whole offer as it will look once posted: author, title, text and link.
// The label defaults to English, like the rest of the create/edit modals.
export const OfferPreview = ({ offer, lang, robots, consumables, label = 'Preview' }) => (
  <>
    <div className="text-muted small text-uppercase mb-2">{label}</div>
    <OfferCard
      offer={offer}
      lang={lang}
      robots={robots}
      consumables={consumables}
      isAdmin={false}
      clickable={false}
    />
  </>
);
