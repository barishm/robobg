// components/DeletePopup.js
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";

const DeletePopup = ({ id, deleteMutationHook, message, modalId }) => {
  const [deleteItem, { isSuccess, isError, error }] = deleteMutationHook();
  const { accessToken } = useSelector((state) => state.auth);

  // Toast notifications for delete operation
  useEffect(() => {
    if (isSuccess) {
      toast.success("Item deleted successfully!");
    } else if (isError) {
      toast.error(`Failed to delete item: ${error?.data?.message || "Unknown error"}`);
    }
  }, [isSuccess, isError, error]);

  const handleDelete = () => {
    deleteItem({ id, accessToken });
  };

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              data-bs-dismiss="modal"
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
