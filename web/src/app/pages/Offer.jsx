import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useGetAllConsumablesQuery } from 'src/app/services/consumableApiSlice';
import { useGetOfferByIdQuery } from 'src/app/services/offerApiSlice';
import Loading from 'src/components/Loading';
import { OfferCard } from 'src/features/home-page-feature/OfferCard';
import { DeleteOfferModal, EditOfferModal } from 'src/features/home-page-feature/OfferEditor';
import { offerDisplayTitle } from 'src/features/home-page-feature/offerTextMarkup';
import useOfferActions from 'src/features/home-page-feature/useOfferActions';
import { useRelativeTimeTick } from 'src/features/home-page-feature/offerUtils';

// A single offer on its own page: only the offer, no sidebar.
const Offer = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const lang = useSelector((state) => state.language.lang);
  const { role } = useSelector((state) => state.auth);
  const isAdmin = role === 'ADMIN' || role === 'MODERATOR';

  const { data: robots } = useGetAllRobotsQuery();
  const { data: consumables } = useGetAllConsumablesQuery();
  const { data: offer, isLoading, isError } = useGetOfferByIdQuery({ id });
  const { offerToEdit, editKey, requestEdit, handleUpdate, requestDelete, handleDelete } = useOfferActions({
    onDeleted: () => navigate('/offers'),
  });

  useRelativeTimeTick();

  const cardProps = { lang, robots, consumables };
  const breadcrumbTitle = offerDisplayTitle(offer) || `#${id}`;

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '900px' }}>
          <ol className="breadcrumb flex-nowrap">
            <li className="breadcrumb-item">
              <a onClick={() => navigate('/offers')} className="text-primary" style={{ cursor: 'pointer' }}>
                {t('offers')}
              </a>
            </li>
            {offer && (
              <li className="breadcrumb-item active text-truncate" style={{ minWidth: 0, flex: '1 1 0' }} title={breadcrumbTitle}>
                {breadcrumbTitle}
              </li>
            )}
          </ol>

          {isLoading ? (
            <Loading />
          ) : isError || !offer ? (
            <div className="text-center text-muted mt-4">{t('offerNotFound')}</div>
          ) : (
            <OfferCard
              offer={offer}
              isAdmin={isAdmin}
              onRequestEdit={requestEdit}
              onRequestDelete={requestDelete}
              collapsible={false}
              clickable={false}
              {...cardProps}
            />
          )}

          {isAdmin && (
            <>
              <EditOfferModal formKey={editKey} offer={offerToEdit} onSave={handleUpdate} cardProps={cardProps} />
              <DeleteOfferModal onConfirm={handleDelete} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offer;
