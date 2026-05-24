import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResetPasswordMutation } from "src/app/services/authApiSlice";
import { useSelector } from "react-redux";
import { validatePassword } from "src/utils/utils";
import { toast } from "react-toastify";
import { REMOVE_BORDER_AT } from "src/constants";

const PasswordReset = () => {
  const lang = useSelector((state) => state.language.lang);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });
  const navigate = useNavigate();
  const location = useLocation();
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [errorMessage, setErrorMessage] = useState("");

  const [resetPassword, { isSuccess, isError, error, isLoading }] =
    useResetPasswordMutation();

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        lang === "en"
          ? "Password changed successfully"
          : "Паролата е променена успешно"
      );
    } else if (isError) {
      toast.error(lang === "en" ? "Error" : "Грешка");
    }
  }, [isSuccess, isError, error]);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validatePassword(newPassword)) {
    setMessage({
      text:
        lang === "en"
          ? "Password must be between 6 and 20 characters."
          : "Паролата трябва да е между 6 и 20 символа.",
      isError: true,
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage({
      text:
        lang === "en"
          ? "Passwords do not match."
          : "Паролите не съвпадат.",
      isError: true,
    });
    return;
  }

  try {
    const response = await resetPassword({
      token,
      newPassword,
      confirmPassword,
    }).unwrap();

    setMessage({
      text:
        lang === "en"
          ? "Password changed successfully!"
          : "Паролата е сменена успешно!",
      isError: false,
    });

    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => navigate("/login"), 5000);
  } catch (err) {
    setMessage({
      text:
        lang === "en"
          ? "Failed to reset password. Please try again."
          : "Неуспешна смяна на парола. Моля, опитайте отново.",
      isError: true,
    });
  }
};

  return (
    <div
      className={screenSize > REMOVE_BORDER_AT ? "container mt-5 mb-5 " : "container mt-2"}
    >
      <div
        className={screenSize > REMOVE_BORDER_AT ? "card" : ""}
        style={{
          borderRadius: "1rem",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div className="card-body p-5 text-center">
          <form onSubmit={handleSubmit}>
            <h4 className="fw-bold mb-3">
              {lang === "en" ? "Enter new password" : "Въведете нова парола"}
            </h4>
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="form-outline form-white mb-4">
              <input
                type="password"
                autoComplete="new-password"
                name="newPassword"
                value={newPassword}
                required
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
                className="form-control form-control-md"
                style={
                  screenSize > REMOVE_BORDER_AT
                    ? {}
                    : { backgroundColor: "rgb(245,245,245)" }
                }
              />
              <label className="form-label">
                {lang === "en" ? "New password" : "Нова парола"}
              </label>
            </div>

            <div className="form-outline form-white mb-3">
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                required
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                name="password"
                className="form-control form-control-md"
                style={
                  screenSize > REMOVE_BORDER_AT
                    ? {}
                    : { backgroundColor: "rgb(245,245,245)" }
                }
              />
              <label className="form-label">
                {lang === "en"
                  ? "Confirm new password"
                  : "Потвърди нова парола"}
              </label>
            </div>

            <button className="btn btn-primary btn-md mt-1" type="submit" disabled={isLoading || isSuccess}>
              {lang === "en" ? "Change password" : "Промяна на паролата"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default PasswordReset;
