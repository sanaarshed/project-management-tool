import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import AuthContext from "../../context/AuthContext";
import "../../css/LoginPage.css";
import apiServer from "../../config/apiServer";
import { Link } from "@material-ui/core";
import { useSnackbar } from "../SnackbarContext";
const ForgotPasswordForm = () => {
  const { register, handleSubmit, errors } = useForm();

  const [errorMessage, setErrorMessage] = useState("");
  const { setAuth, setEmail, setUserId, setUser } = useContext(AuthContext);
  const [formEmail, setFormEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const res = await apiServer.post("/forgetPassword", {
        userEmail: email,
      });
      console.log("res--->", res);
      setErrorMessage("");
    } catch (err) {
      setLoading(false);
      if (err.response.status === 404) showSnackbar("User not registered!");
      // setErrorMessage("The provided credentials were invalid");
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
      {errorMessage ? (
        <p style={{ color: "red", margin: "1px" }}>{errorMessage}</p>
      ) : null}
    </form>
  );
};

export default ForgotPasswordForm;
