import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetAllRobotsQuery } from 'src/app/services/robotApiSlice';
import { useGetAllConsumablesQuery } from 'src/app/services/consumableApiSlice';
import { useGetOfferByIdQuery } from 'src/app/services/offerApiSlice';
import Loading from 'src/components/Loading';
import PopularComparisons from 'src/components/PopularComparisons';
import HomePageCompareForm from 'src/features/home-page-feature/HomePageCompareForm';
import { OfferCard } from 'src/features/home-page-feature/OfferCard';
import { DeleteOfferModal, EditOfferModal } from 'src/features/home-page-feature/OfferEditor';
import { splitOfferText, stripFormatting } from 'src/features/home-page-feature/offerTextMarkup';
import useOfferActions from 'src/features/home-page-feature/useOfferActions';
import { useRelativeTimeTick } from 'src/features/home-page-feature/offerUtils';

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
    onDeleted: () => navigate('/'),
  });

  useRelativeTimeTick();

  const cardProps = { lang, robots, consumables };
  const breadcrumbTitle = offer ? stripFormatting(splitOfferText(offer.text).title) || offer.link?.title : '';

  return (
    <section className="mt-4">
      <div className="container d-flex">
        <div className="col-12 col-md-12 col-lg-9">
          <div style={{ marginTop: '20px', marginBottom: '50px' }}>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a onClick={() => navigate('/')} className="text-primary" style={{ cursor: 'pointer' }}>
                  {t('offers')}
                </a>
              </li>
              {breadcrumbTitle && (
                <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '60%' }}>
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
                {...cardProps}
              />
            )}
          </div>

          {isAdmin && (
            <>
              <EditOfferModal formKey={editKey} offer={offerToEdit} onSave={handleUpdate} cardProps={cardProps} />
              <DeleteOfferModal onConfirm={handleDelete} />
            </>
          )}
        </div>
        <div className="col-12 col-md-12 col-lg-3" style={{ marginTop: '48px', padding: '20px' }}>
          <div className="card d-none d-lg-block text-center">
            <div className="card-body" style={{ paddingBottom: '20px' }}>
              <HomePageCompareForm />
            </div>
          </div>
          <div className="d-none d-lg-block">
            <PopularComparisons />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offer;
