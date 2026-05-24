import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "src/app/services/authApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { REMOVE_BORDER_AT } from "src/constants";

const ForgotPassword = () => {
  const lang = useSelector((state) => state.language.lang);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [forgotPassword , { isSuccess, isError, error, isLoading }] = useForgotPasswordMutation();
  const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
    if (isSuccess) {
      toast.success(lang === "en" ? "Password recovery email send successfully" : "Имейлът за възстановяване на паролата е изпратен успешно");
    } else if (isError) {
      toast.error(lang === "en" ? "Error" : "Грешка");
    }
  }, [isSuccess, isError, error]);

  const [screenSize, setScreenSize] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Failed to send reset email");
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setEmail("");
    } catch (error) {
      console.error("Contact form submission failed:", error);
    }

    setTimeout(() => {
      navigate("/");
      setSuccessMessage("");
      setErrorMessage("");
    }, 5000);
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
            <h5 className="mb-3">
              {lang === "en"
                ? "Please enter your email!"
                : "Моля, въведете вашият имейл!"}
            </h5>
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="form-outline form-white mb-3">
              <input
                type="email"
                name="email"
                value={email}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="form-control form-control-md"
                style={
                  screenSize > REMOVE_BORDER_AT
                    ? {}
                    : { backgroundColor: "rgb(245,245,245)" }
                }
              />
              <label className="form-label">
                {lang === "en" ? "Email" : "Имейл"}
              </label>
            </div>

            <button className="btn btn-primary btn-md mt-1" type="submit" disabled={isLoading || isSuccess}>
              {lang === "en"
                ? "Recover your password"
                : "Възстановете паролата си"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
