import React, { useContext, useState } from "react";

import { useForm } from "react-hook-form";
import AuthContext from "../../context/AuthContext";
import "../../css/LoginPage.css";
import apiServer from "../../config/apiServer";
import { useSnackbar } from "../SnackbarContext";
const ResetPasswordForm = () => {
  const { register, handleSubmit, errors } = useForm();

  const [errorMessage, setErrorMessage] = useState("");
  const { setAuth, setEmail, setUserId, setUser } = useContext(AuthContext);
  const [newpass, setNewpass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      // const res = await apiServer.post("/forgetPassword", {
      //   userEmail: email,
      // });
      // if (res.status === 200) {
      //   res.data.userToken;
      //   setLoading(false);
      // }
    } catch (err) {
      // setLoading(false);
      // if (err.response.status === 404) showSnackbar("User not registered!");
      // setErrorMessage("The provided credentials were invalid");
    }
  };

  return (
    <form className="login-page--form" onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="password">New Password</label>
        <input
          name="newPassword"
          type="password"
          value={newpass}
          onChange={setNewpass(e.target.value)}
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
