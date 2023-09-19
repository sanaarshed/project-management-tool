import React, { useState } from "react";

import { useForm } from "react-hook-form";
import "../../css/LoginPage.css";
import apiServer from "../../config/apiServer";
import { useSnackbar } from "../SnackbarContext";
const ForgotPasswordForm = () => {
  const { register, handleSubmit, errors } = useForm();

  const [formEmail, setFormEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const res = await apiServer.post("/forgetPassword", {
        userEmail: email,
      });
      if (res.status === 200) {
        setLoading(false);
        showSnackbar("Please check your email to set new password!");
        setFormEmail("");
      }
    } catch (err) {
      setLoading(false);
      if (err.response.status === 404) showSnackbar("User not registered!");
    }
  };

  const handleEmailChange = (e) => {
    setFormEmail(e.target.value);
  };

  return (
    <form className="login-page--form" onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="email">Email Address</label>
        <input
          name="email"
          type="email"
          value={formEmail}
          onChange={handleEmailChange}
          ref={register({ required: true })}
        ></input>
        {errors.email?.type === "required" && (
          <p style={{ color: "red", margin: "1px" }}>
            Please enter an email address
          </p>
        )}
      </div>

      <button type="submit">{loading ? "loading..." : "Continue"}</button>
    </form>
  );
};

export default ForgotPasswordForm;
