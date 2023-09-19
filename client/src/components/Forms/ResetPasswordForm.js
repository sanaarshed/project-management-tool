import React, { useContext, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import AuthContext from "../../context/AuthContext";
import "../../css/LoginPage.css";
import apiServer from "../../config/apiServer";
import { useSnackbar } from "../SnackbarContext";
import { useHistory } from "react-router-dom";

const ResetPasswordForm = (props) => {
  const { register, handleSubmit, errors } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const { setAuth, setEmail, setUserId, setUser } = useContext(AuthContext);
  const [newpass, setNewpass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(false);
  const { showSnackbar } = useSnackbar();
  const currentURL = window.location.href;
  const history = useHistory();

  useEffect(() => {
    if (currentURL) {
      const t = currentURL.split("/").pop();
      setToken(t);
    }
  }, [currentURL]);

  const onSubmit = async ({ new_pass, confirmPassword }) => {
    if (new_pass === confirmPassword) {
      setLoading(true);
      try {
        const res = await apiServer.post(`/resetPassword/${token}`, {
          newPassword: new_pass,
        });
        if (res.status === 204) {
          setLoading(false);
          showSnackbar("Password Reset");
          history.push("/login");
        }
      } catch (err) {
        setLoading(false);
        // if (err.response.status === 404) showSnackbar("User not registered!");
        // setErrorMessage("The provided credentials were invalid");
      }
    } else showSnackbar("Make sure both password match.");
  };

  return (
    <form className="login-page--form" onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="password">New Password</label>
        <input
          name="new_pass"
          type="password"
          value={newpass}
          onChange={(e) => setNewpass(e.target.value)}
          ref={register({ required: true })}
        ></input>
        {errors.email?.type === "required" && (
          <p style={{ color: "red", margin: "1px" }}>
            Please enter an email address
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="password">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          ref={register({ required: true })}
        ></input>
        {errors.email?.type === "required" && (
          <p style={{ color: "red", margin: "1px" }}>
            Please enter an email address
          </p>
        )}
      </div>

      <button type="submit">{loading ? "loading..." : "Continue"}</button>
      {errorMessage ? (
        <p style={{ color: "red", margin: "1px" }}>{errorMessage}</p>
      ) : null}
    </form>
  );
};

export default ResetPasswordForm;
