import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useUpdateOfferMutation, useDeleteOfferMutation } from 'src/app/services/offerApiSlice';
import { dataUrlToBlob, normalizeUrl } from './offerUtils';

// Edit/delete state and handlers, shared by the offers list and the offer page.
const useOfferActions = ({ onDeleted } = {}) => {
  const { t } = useTranslation();
  const { accessToken } = useSelector((state) => state.auth);
  const [updateOffer] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  const [offerToEdit, setOfferToEdit] = useState(null);
  const [editKey, setEditKey] = useState(0);
  const [offerIdToDelete, setOfferIdToDelete] = useState(null);

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

  const handleDelete = async () => {
    if (offerIdToDelete == null) return;
    try {
      await deleteOffer({ id: offerIdToDelete, accessToken }).unwrap();
      onDeleted?.(offerIdToDelete);
    } catch {
      toast.error(t('somethingWentWrong'));
    }
  };

  return {
    offerToEdit,
    editKey,
    requestEdit,
    handleUpdate,
    requestDelete: setOfferIdToDelete,
    handleDelete,
  };
};

export default useOfferActions;
