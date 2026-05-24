import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "src/app/redux/authSlice";
import { jwtDecode } from "jwt-decode";
import { useLoginMutation } from "src/app/services/authApiSlice";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { REMOVE_BORDER_AT } from "src/constants";

const Login = () => {
  const {t} = useTranslation()
  const lang = useSelector((state) => state.language.lang);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");

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

    try {
      const userData = await login({ username, password }).unwrap();
      const decoded = jwtDecode(userData.access_token);
      const user = decoded.sub;
      const role = decoded.role;
      const accessToken = userData.access_token;

      dispatch(setCredentials({ user, role, accessToken }));
      localStorage.setItem(
        "refreshToken",
        JSON.stringify(userData.refresh_token)
      );
      setUsername("");
      setPassword("");
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      const errorMsg = "Incorrect username or password";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setTimeout(() => {
        setErrorMessage("");
      }, 2000);
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
            <h2 className="fw-bold mb-3">
              {lang === "en" ? "Sign in" : "Впиши се"}
            </h2>
            <p className="mb-3">
              {lang === "en"
                ? "Please enter your username and password!"
                : "Моля, въведете вашето потребителско име и парола!"}
            </p>
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="form-outline form-white mb-4">
              <input
                type="username"
                name="username"
                value={username}
                required
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className="form-control form-control-md"
              />
              <label className="form-label">
                {lang === "en" ? "Username" : "Потребителско име"}
              </label>
            </div>

            <div className="form-outline form-white mb-3">
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                name="password"
                className="form-control form-control-md"
              />
              <label className="form-label">
                {lang === "en" ? "Password" : "Парола"}
              </label>
            </div>

            <button
              className="btn btn-primary btn-md mt-1"
              type="submit"
              style={{ width: "100px" }}
            >
              {t("Login")}
            </button>
          </form>

          <div className="mt-3">
            <p className="mb-1">
              <a
                href="#"
                onClick={() => navigate("/register")}
                className="fw-bold"
              >
                {lang === "en" ? "Sign Up" : "Регистрация"}
              </a>
            </p>
            <p className="mb-0">
              <a
                href="#"
                onClick={() => navigate("/forgot-password")}
                className="fw-bold"
              >
                {lang === "en" ? "Forgot your password" : "Забравена парола"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
