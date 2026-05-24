import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useReauthMutation } from "src/app/services/authApiSlice";
import { jwtDecode } from "jwt-decode";
import { setCredentials, logOut } from "src/app/redux/authSlice";

const useAuth = () => {
  const [reauth] = useReauthMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    const refreshToken = localStorage
      .getItem("refreshToken")
      ?.replace(/^"(.*)"$/, "$1");

    if (!refreshToken) {
      console.log("No refresh token found in localStorage");
      dispatch(logOut());
      return;
    }

    const refreshAccessToken = async () => {
      try {
        const result = await reauth(refreshToken).unwrap();
        if (!result?.access_token)
          throw new Error("No access_token in response");

        const decoded = jwtDecode(result.access_token);
        dispatch(
          setCredentials({
            user: decoded.sub,
            role: decoded.role,
            accessToken: result.access_token,
          })
        );
      } catch (error) {
        console.error("Token refresh failed:", error);
        dispatch(logOut());
        localStorage.clear();
      }
    };

    refreshAccessToken(); // Run on first load

    const interval = setInterval(refreshAccessToken, 25200000); // Refresh every 7 Hours (access token expiration is 8 hours)
    return () => clearInterval(interval);
  }, [dispatch, reauth]);
};

export default useAuth;
