import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import LoginPage from "./LoginPage";
import LandingPage from "./LandingPage";
import RegisterPage from "./RegisterPage";
import Onboard from "./Onboard";
import ForgotPasswordPage from "./ForgotPassword";
import ResetPasswordPage from "./ResetPassword";
import UserVerifyPage from "./UserVerifyPage";
const LandingRoutes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password/:token" component={ResetPasswordPage} />
        <Route path="/user-verify/:token" component={UserVerifyPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/register/onboard" component={Onboard} />
        <Route exact path="/" component={LandingPage} />
        <Route
          path="/*"
          render={() => {
            return <Redirect to="/" />;
          }}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default LandingRoutes;
