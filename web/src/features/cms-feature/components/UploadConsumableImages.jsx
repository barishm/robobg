import { useSelector } from "react-redux";
import { useUploadConsumableImagesMutation } from "src/app/services/consumableApiSlice";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UploadConsumableImages = ({ consumable: id }) => {
  const { accessToken } = useSelector((state) => state.auth);
  const [files, setFiles] = useState([]);
  const [inputKey, setInputKey] = useState(Date.now());
  const [uploadImage, { isSuccess, isError, error }] =
    useUploadConsumableImagesMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Images uploaded successfully!");
    } else if (isError) {
      toast.error(
        `Failed to upload images: ${error?.data?.error || "Unknown error"}`
      );
    }
  }, [isSuccess, isError, error]);

  const handleUploadImage = async () => {
    if (!files.length || !id) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    await uploadImage({ id, accessToken, formData });
    resetForm();
  };

  const resetForm = () => {
    setFiles([]);
    setInputKey(Date.now());
  };

  return (
    <div
      className="modal fade"
      id="uploadConsumableImage"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Upload Images
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={resetForm}
            ></button>
          </div>
          <div className="modal-body">
            <div className="form-inputs">
              <div className="mb-3">
                <label className="form-label" htmlFor="fileInput">
                  Select Images
                </label>
                <input
                  key={inputKey}
                  className="form-control form-control-sm"
                  id="fileInput"
                  type="file"
                  name="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={resetForm}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              data-bs-dismiss="modal"
              onClick={handleUploadImage}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadConsumableImages;
