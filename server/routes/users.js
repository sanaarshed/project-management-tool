const express = require("express");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utilities/utils");
const { check, validationResult } = require("express-validator");
const { User, Team, UserTeam, Invitations } = require("../db/models");
const { getUserToken, requireAuth, tokenVerify } = require("../utilities/auth");
const { sendEmail } = require("../utilities/email");
const responses = require("../utilities/response");

const router = express.Router();

validateUserFields = [
  check("email")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a valid email"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a valid password"),
];

const validateTeamName = [
  check("teamName")
    .exists({ checkFalsy: true })
    .withMessage("You'll need to enter a name"),
];

const validateEmailPassword = [
  check("email")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a valid email"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a valid password"),
];

//Get user Information
router.get(
  "/user/:id",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const user_id = req.params.id;
    const user = await User.findOne({
      where: {
        id: user_id,
      },
      attributes: ["name", "email"],
    });

    res.json(user);
  })
);

router.get(
  "/users",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
    });
    res.json(users);
  })
);
router.get(
  "/userVerify/:token",
  asyncHandler(async (req, res, next) => {
    const userToken = req.params.token;
    if (!userToken)
      return res
        .status(responses.notFound.statusCode)
        .send({ Error: responses.notFound.message });
    const token = await tokenVerify(userToken);
    if (!token.email) {
      res
        .status(responses.tokenInvalid.statusCode)
        .send({ Error: responses.tokenInvalid.message });
      return;
    }

    const verified = await User.update(
      {
        is_verify: true,
        token: null,
      },
      {
        where: {
          token: userToken,
        },
      }
    );

    if (verified) {
      sendEmail({
        to: token.email,
        subject: "Registration Successfully",
        templateName: "register", // Name of the EJS template file without the ".ejs" extension
        templateData: null,
      });
      return res
        .status(responses.ok.statusCode)
        .send({ Error: responses.ok.message });
    }
    return res
      .status(responses.badRequest.statusCode)
      .send({ Error: responses.badRequest.message });
  })
);
//Register
router.post(
  "/register",
  validateUserFields,
  asyncHandler(async (req, res) => {
    const validatorErr = validationResult(req);

    if (!validatorErr.isEmpty()) {
      const errors = validatorErr.array().map((error) => error.msg);
      res
        .status(responses.validationError.statusCode)
        .json(["Errors", ...errors]);
      return;
    }

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // try {
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      res
        .status(responses.userAlreadyExists.statusCode)
        .send({ Error: responses.userAlreadyExists.message });
      return;
    }

    const user = await User.create({
      name: name,
      email: email,
      hashed_password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const token = getUserToken(user);

    const existingInvitationUser = await Invitations.findOne({
      where: {
        email: user.email,
        is_active: false,
      },
    });
    if (existingInvitationUser) {
      const userteam = await UserTeam.create({
        team_id: existingInvitationUser.team_id,
        user_id: user.id,
      });
      if (userteam) {
        await Invitations.update(
          {
            is_active: true,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
        await User.update(
          {
            is_verify: true,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
        sendEmail({
          to: user.email,
          subject: "Registration Successfully",
          templateName: "register", // Name of the EJS template file without the ".ejs" extension
          templateData: null,
        });
      }
    }else{
      if (user) {
        if (token) {
          await User.update(
            {
              token: token,
            },
            {
              where: {
                email: user.email,
              },
            }
          );
        }}
      await sendEmail({
        to: user.email,
        subject: "User Verification",
        templateName: "userVerify", // Name of the EJS template file without the ".ejs" extension
        templateData: {
          token: token,
        },
      });
    } 

    res.status(responses.ok.statusCode).json({
      id: user.id,
      email: user.email,
    });
  })
);

//Onboard information
router.put(
  "/register/onboard",
  validateTeamName,
  asyncHandler(async (req, res, next) => {
    const validatorErr = validationResult(req);

    if (!validatorErr.isEmpty()) {
      const errors = validatorErr.array().map((error) => error.msg);
      res.json(["ERRORS", ...errors]);
      return;
    }

    const { email, teamName } = req.body;
    try {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user.is_verify === false) {
        res
          .status(responses.validationError.statusCode)
          .send({ message: "User not verified" });
      }
      const token = getUserToken(user);
      res.status(responses.ok.statusCode).json({
        token,
      });

      //Create initial Team
      const team = await Team.create({
        name: teamName,
      });
      //Tie user to team
      await UserTeam.create({
        user_id: user.id,
        team_id: team.id,
      });
    } catch (err) {
      res.status(responses.validationError.statusCode).send(err.message);
    }
  })
);

//Log in
router.post(
  "/login",
  validateEmailPassword,
  asyncHandler(async (req, res, next) => {
    const validatorErr = validationResult(req);
    if (!validatorErr.isEmpty()) {
      const errors = validatorErr.array().map((error) => error.msg);
      res.json(["ERRORS", ...errors]);
      return;
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(responses.missingEmailAndPassword.statusCode)
        .send({ error: responses.missingEmailAndPassword.message });
    }
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (user.is_verify === false) {
      res
        .status(responses.validationError.statusCode)
        .send({ message: "User not verified" });
    }
    if (!user || !user.validatePassword(password)) {
      const err = new Error("Login Failed");
      err.status = 401;
      err.title = "Login Failed";
      err.errors = ["The provided credentials were invalid"];
      res.status(401).json(err);
      return;
    } else {
      const token = getUserToken(user);
      const existingInvitationUser = await Invitations.findOne({
        where: {
          email: user.email,
          is_active: false,
        },
      });
      if (existingInvitationUser) {
        const userteam = await UserTeam.create({
          team_id: existingInvitationUser.team_id,
          user_id: user.id,
        });
        if (userteam) {
          await Invitations.update(
            {
              is_active: true,
            },
            {
              where: {
                id: existingInvitationUser.id,
              },
            }
          );
        }
      }

      res.json({
        id: user.id,
        token,
        email: user.email,
      });
    }
  })
);

router.post(
  "/forgetPassword",
  asyncHandler(async (req, res, next) => {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const existingUser = await User.findOne({
      where: {
        email: userEmail,
      },
    });
    if (!existingUser) {
      res
        .status(responses.notFound.statusCode)
        .send({ Error: responses.notFound.message });
      return;
    }
    const userToken = getUserToken(existingUser);
    if (userToken) {
      await User.update(
        {
          token: userToken,
        },
        {
          where: {
            email: userEmail,
          },
        }
      );
      sendEmail({
        to: userEmail,
        subject: "ForgetPassword",
        templateName: "forgetPassword", // Name of the EJS template file without the ".ejs" extension
        templateData: {
          token: userToken,
        },
      });
    }

    res.status(responses.ok.statusCode).json({
      userToken,
    });
  })
);

router.post(
  "/resetPassword/:userToken",
  asyncHandler(async (req, res) => {
    try {
      const { newPassword } = req.body;
      const { userToken } = req.params;
      const existingUser = await User.findOne({
        where: {
          token: userToken,
        },
      });
      if (!existingUser) {
        res.status(404).send({ Error: "User not Found!" });
        return;
      }
      const token = await tokenVerify(existingUser.token);
      if (!token) {
        res.status(404).send({ Error: "Token not valid!" });
        return;
      }
      await User.update(
        {
          hashed_password: await bcrypt.hash(newPassword, 10),
          token: null,
        },
        {
          where: {
            token: userToken,
          },
        }
      );
      sendEmail({
        to: existingUser.email,
        subject: "Password Changed Successfully",
        templateName: "passwordChanged", // Name of the EJS template file without the ".ejs" extension
        templateData: null,
      });

      res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      res.status(422).send({ error: err });
    }
  })
);
module.exports = router;
