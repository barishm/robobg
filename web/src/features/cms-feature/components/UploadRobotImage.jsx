import { useSelector } from "react-redux";
import { useUploadRobotImageMutation } from "src/app/services/robotApiSlice";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UploadRobotImage = (props) => {
  let id = props.RobotId;
  const { accessToken } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const [uploadImage, { isSuccess, isError, error }] = useUploadRobotImageMutation();

  
  useEffect(() => {
    if (isSuccess) {
      toast.success("Image uploaded successfully!");
    } else if (isError) {
      toast.error(
        `Failed to upload image: ${error?.data?.error || "Unknown error"}`
      );
    }
  }, [isSuccess, isError, error]);

  const handleUploadImage = async () => {
    const formData = new FormData();
    if (file && id) {
      formData.append("file", file);
      await uploadImage({ id, accessToken, formData });
    }
    resetForm();
  };
  const resetForm = () => {
    setFile(null);
    setInputKey(Date.now());
  };

  return (
    <div
      className="modal fade"
      id="uploadImage"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Upload Image
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
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Image
                </label>
                <input
                  key={inputKey}
                  className="form-control form-control-sm"
                  id="fileInput"
                  type="file"
                  name="file"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                  }}
                ></input>
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

export default UploadRobotImage;
