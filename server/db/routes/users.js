const express = require("express");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("./utilities/utils");
const { check, validationResult } = require("express-validator");
const { User, Team, UserTeam, Invitations } = require("../../db/models");
const { getUserToken, requireAuth, tokenVerify } = require("./utilities/auth");

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
  // requireAuth,
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
  // requireAuth,
  asyncHandler(async (req, res, next) => {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
    });
    res.json(users);
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
      res.status(422).json(["Errors", ...errors]);
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
      res.status(422).send({ Error: "User already exists" });
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
        is_active: false
      }
    });
    if(existingInvitationUser){
      const userteam = await UserTeam.create({
        team_id: existingInvitationUser.team_id,
        user_id: user.id,
      });
      if(userteam){
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

    res.status(200).json({
      id: user.id,
      token,
      email: user.email,
    });
    // } catch (err) {
    //   res.status(422).send({ error: err.errors[0].message });
    // }
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
    // try {

    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    const token = getUserToken(user);
    res.status(200).json({
      token,
    });

    //Create initial Team
    const team = await Team.create({
      name: teamName,
    });
    //Tie user to team
    const userTeam = await UserTeam.create({
      user_id: user.id,
      team_id: team.id,
    });

    // } catch (err) {
    //   res.status(422).send(err.message);
    // }
  })
);

//Log in
router.post(
  "/login",
  validateEmailPassword,
  asyncHandler(async (req, res, next) => {
    const validatorErr = validationResult(req);

    console.log("req.body--->", req.body);

    if (!validatorErr.isEmpty()) {
      const errors = validatorErr.array().map((error) => error.msg);
      res.json(["ERRORS", ...errors]);
      return;
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).send({ error: "Must provide email and password" });
    }
    const user = await User.findOne({
      where: {
        email,
      },
    });
    console.log("find user.email--->", user.email);

    if (!user || !user.validatePassword(password)) {
      const err = new Error("Login Failed");
      err.status = 401;
      err.title = "Login Failed";
      err.errors = ["The provided credentials were invalid"];
      res.status(401).json(err);
      return;
    } else {
      const token = getUserToken(user);

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
    console.log(req)
    const { userEmail } = req.body;
    if(!userEmail){return res.status(400).json({ message: "Required fields are missing" });}
    const existingUser = await User.findOne({
      where: {
        email: userEmail,
      },
    });
    if (!existingUser) {
      res.status(404).send({ Error: "User not Found!" });
      return;
    }
    const userToken = getUserToken(existingUser);
    if(userToken){
      await User.update(
        {
          token:userToken
        },
        {
          where: {
            email: userEmail
          }
        }
      );
    }

    res.status(200).json({
      userToken
    });
  }));


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

    const token =await tokenVerify(existingUser.token);
    console.log("tokrn",token)
    if(!token){res.status(404).send({ Error: "Token not valid!" });
    return;}
    await User.update(
      {
        
        hashed_password:await bcrypt.hash(newPassword, 10),
        token:null
      },
      {
        where: {
          token: userToken,
        },
      }
    );


    res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      res.status(422).send({ error: err });
    }
  })
);
module.exports = router;
