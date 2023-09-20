import React, { useContext, useEffect, useState } from "react";

import logo from "../../assets/logo.png";
import "../../css/LoginPage.css";
import LoginForm from "../Forms/LoginForm";
import { MdKeyboardBackspace } from "react-icons/md";
import { useSnackbar } from "../SnackbarContext";
import apiServer from "../../config/apiServer";
import AuthContext from "../../context/AuthContext";
// import AuthContext from "../../context/AuthContext";

const UserVerifyPage = () => {
  // const [token, setToken] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { setAuth, setEmail, setUserId, setUser } = useContext(AuthContext);

  const currentURL = window.location.href;

  useEffect(() => {
    if (currentURL) {
      const t = currentURL.split("/").pop();
      // console.log("t--->", t);
      if (t) {
        verifyUser(t);
      }
    }
  }, [currentURL]);

  const verifyUser = async (token) => {
    setLoading(true);
    try {
      const res = await apiServer.get(`/userVerify/${token}`);

      // localStorage.setItem("onboard", res.data.token);
      // localStorage.setItem("email", res.data.email);
      // localStorage.setItem("userId", res.data.id);
      // setUser(res.data);
      // setAuth(res.data.token);
      // setEmail(res.data.email);
      // setUserId(res.data.id);

      setLoading(false);
      if (res.status === 200) {
        setMessage("User verified");
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("err--->", err);
      setLoading(false);
      if (err.response.status === 422) setMessage(err.response.data.Error);
    }
  };

  return (
    <div className="login-page-container">
      {loading ? "loading..." : message}
    </div>
  );
};

export default UserVerifyPage;
