import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useGetAllConsumablesQuery } from 'src/app/services/consumableApiSlice';
import { useGetOffersQuery, useCreateOfferMutation } from 'src/app/services/offerApiSlice';
import { useGetCurrentUserQuery } from 'src/app/services/userApiSlice';
import Pagination from 'src/components/Pagination';
import Loading from 'src/components/Loading';
import { composeOfferText } from './offerTextMarkup';
import { OfferCard, OfferPreview } from './OfferCard';
import { DeleteOfferModal, EditOfferModal, OfferTextEditor, LinkModal } from './OfferEditor';
import useOfferActions from './useOfferActions';
import { EMPTY_LINK, OFFERS_PER_PAGE, dataUrlToBlob, normalizeUrl, useRelativeTimeTick } from './offerUtils';

// The offers feed with the admin composer and pagination. Used on the Home
// page and, with categories and headerExtra (the Filters button), on the
// Offers page.
const Offers = ({ categories = [], headerExtra = null }) => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.language.lang);
  const { username, role, accessToken } = useSelector((state) => state.auth);
  const isAdmin = role === 'ADMIN' || role === 'MODERATOR';

  // The page lives in the URL (?page=2), so coming back from an offer's own
  // page lands on the same page of the list.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, (parseInt(searchParams.get('page'), 10) || 1) - 1);
  const setPage = (nextPage) => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (nextPage > 0) next.set('page', String(nextPage + 1));
        else next.delete('page');
        return next;
      },
      { replace: false }
    );
  };

  const { data: robots } = useGetAllRobotsQuery();
  const { data: consumables } = useGetAllConsumablesQuery();
  const { data: offersPage, isLoading, isFetching } = useGetOffersQuery({
    page,
    size: OFFERS_PER_PAGE,
    categories,
  });
  const offers = offersPage?.content ?? [];
  const { data: currentUser } = useGetCurrentUserQuery(accessToken, { skip: !accessToken || !isAdmin });
  const [createOffer, { isLoading: isPosting }] = useCreateOfferMutation();
  const { offerToEdit, editKey, requestEdit, handleUpdate, requestDelete, handleDelete } = useOfferActions();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState(null);
  const [linkDraft, setLinkDraft] = useState(EMPTY_LINK);

  useRelativeTimeTick();

  // A page that no longer exists (e.g. its last offer was deleted, or an old
  // ?page= link) goes to the last page that does.
  useEffect(() => {
    if (!offersPage || isFetching) return;
    if (offersPage.content.length === 0 && page > 0) {
      setPage(Math.max(0, offersPage.totalPages - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offersPage, isFetching, page]);

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
      // The new offer is the newest, so it's on the first page
      setPage(0);
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
      {headerExtra}

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-4 mt-4">
          <div className="border rounded p-3 mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <OfferTextEditor
              className="mb-3"
              rows={4}
              placeholder="Write an offer..."
              value={text}
              onChange={setText}
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
                {link ? 'Edit link' : 'Add link'}
              </button>

              {link && (
                <span className="d-inline-flex align-items-center gap-1 small text-muted" style={{ minWidth: 0 }}>
                  <span className="text-truncate" style={{ maxWidth: '240px' }}>
                    {link.title || link.url || 'Image'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: '20px', height: '20px' }}
                    aria-label="Remove"
                    onClick={() => setLink(null)}
                  >
                    <i className="fa-solid fa-xmark fa-2xs"></i>
                  </button>
                </span>
              )}
            </div>
          </div>

          {canPost && (
            <div className="mb-3">
              <OfferPreview offer={previewOffer} label={t('preview')} {...cardProps} />
            </div>
          )}

          <button type="submit" className="btn btn-primary text-center" disabled={!canPost || isPosting}>
            Post
          </button>
        </form>
      )}

      {isAdmin && (
        <>
          <LinkModal
            draft={linkDraft}
            setDraft={setLinkDraft}
            onSave={saveLink}
            previewOffer={previewOffer}
            cardProps={cardProps}
          />
          <EditOfferModal formKey={editKey} offer={offerToEdit} onSave={handleUpdate} cardProps={cardProps} />
          <DeleteOfferModal onConfirm={handleDelete} />
        </>
      )}

      {isLoading ? (
        <Loading />
      ) : offers.length === 0 ? (
        <div className="text-center text-muted mt-4">{t('noOffersYet')}</div>
      ) : (
        <div style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.15s' }}>
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isAdmin={isAdmin}
              onRequestEdit={requestEdit}
              onRequestDelete={requestDelete}
              {...cardProps}
            />
          ))}
        </div>
      )}

      <Pagination Page={page} setPage={setPage} totalPages={offersPage?.totalPages ?? 0} />
    </div>
  );
};

export default Offers;
