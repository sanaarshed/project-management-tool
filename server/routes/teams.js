const express = require("express");
const { asyncHandler } = require("./utilities/utils");
const { requireAuth } = require("./utilities/auth");
const { check, validationResult } = require("express-validator");

const { Team, UserTeam, Project, UserProject } = require("../db/models");
const jwt = require("jsonwebtoken");
const { Invitations, User } = require("../db/models");
const { sendEmail } = require("./utilities/email");
const response = require("./utilities/response");

const router = express.Router();
//Authenticates user before being able to use API
// router.use(requireAuth);

//Gets all Teams
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const teams = await Team.findAll({});

    res.json(teams);
  })
);

//get all users in a Team
router.get(
  "/:id/users",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.id;

    const users = await Team.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      where: { id: team_id },
    });

    res.json(users);
  })
);

// router.get(
//   "/:id/users",
//   asyncHandler(async (req, res, next) => {
//     // const project_id = req.params.id;
//     const team_id = req.params.id;

//     const users = await User.findAll({
//       include: [{ model: Team, where: { id: team_id } }],
//       attributes: ["id", "name"],
//     });
//     res.json(users);
//   })
// );

//get all teams for a user
router.get(
  "/user/:id",
  asyncHandler(async (req, res, next) => {
    const user_id = req.params.id;

    const teams = await Team.findAll({
      include: [
        {
          model: User,
          where: {
            id: user_id,
          },
          attributes: ["name", "id"],
        },
      ],
    });

    res.json(teams);
  })
);

//get all projects for team
router.get(
  "/:id/projects",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.id;
    const projects = await Project.findAll({
      where: {
        team_id: team_id,
      },
    });
    res.json(projects);
  })
);

//get everything about team
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.id;
    const team = await Team.findOne({
      include: [
        { model: Project },
        { model: User, attributes: ["name", "email", "id"] },
      ],
      where: { id: team_id },
    });
    console.log("team--->", team);
    if (!team) {
      res.status(response.noTeamExists.statusCode).send({ error: response.noTeamExists.message });
    }
    res.json(team);
  })
);

//Create team
router.post(
  "/user/:userId",
  asyncHandler(async (req, res, next) => {
    const user_id = req.params.userId;
    const { description, name } = req.body;
    if (description) {
      const team = await Team.create({
        description: description,
        name: name,
      });
      //Adds user to team
      await UserTeam.create({
        team_id: team.id,
        user_id: user_id,
      });
      res.json(team).status(response.created.statusCode);
    } else if (!description) {
      const team = await Team.create({
        name: name,
      });
      //Adds user to team
      await UserTeam.create({
        team_id: team.id,
        user_id: user_id,
      });
      res.json(team).status(response.created.statusCode);
    }
  })
);

//Add other users to team
router.post(
  "/:teamId/user/:userId",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.teamId;
    const user_id = req.params.userId;
    const userteam = await UserTeam.findOne({
      where: {
        team_id: team_id,
        user_id: user_id,
      },
    });
    if (userteam) {
      res.status(response.userAlreadyExists.statusCode).send({ error: response.userAlreadyExists.message });
    } else if (!userteam) {
      const newUserTeam = await UserTeam.create({
        team_id: team_id,
        user_id: user_id,
      });
      res.json(newUserTeam).status(201);
    }
  })
);

//Edit team description
router.put(
  "/:teamId/description",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.teamId;
    const { description } = req.body;
    await Team.update(
      {
        description: description,
      },
      {
        where: {
          id: team_id,
        },
      }
    );
  })
);

//Create Project for team
router.post(
  "/:id/project",
  asyncHandler(async (req, res, next) => {
    //need to add owner for project
    const team_id = req.params.id;
    const { name, userId } = req.body;
    const project = await Project.create({
      name: name,
      team_id: team_id,
    });

    if (project) {
      const userproject = await UserProject.create({
        user_id: userId,
        project_id: project.id,
      });
      res.json(userproject).status(response.created.statusCode);
    } else {
      res.status(response.notFound.statusCode);
    }
  })
);

//Delete team
router.delete(
  "/:teamId/",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.teamId;
    const project_id = req.params.projectId;
    const team = await Team.destroy({
      where: { id: team_id },
    });
    res.status(response.ok.statusCode);
  })
);

router.post(
  "/invite",
  asyncHandler(async (req, res, next) => {
    try {
      const { email, teamId, invitedBy } = req.body;

      if (!email || !teamId || !invitedBy) {
        return res.status(response.fieldsMissing.statusCode).json({ message: response.fieldsMissing.message });
      }

      const [userExistInvitation, user, team] = await Promise.all([
        Invitations.findOne({ where: { email, is_active: false } }),
        User.findOne({ where: { id: invitedBy } }),
        Team.findOne({ where: { id: teamId }, include: [{ model: Project }] }),
      ]);

      if (userExistInvitation || !user || !team) {
        let errorMessage = "";
        if (userExistInvitation) {
          errorMessage = "This user already received an invitation";
        } else if (!user) {
          errorMessage = "Invited User Not Found in User List";
        } else if (!team) {
          errorMessage = "Team Not Exist";
        }
        return res.status(409).json({ message: errorMessage });
      }

      const invited = await Invitations.create({ email, team_id: teamId, invited_by: invitedBy });
      console.log(team.Projects)
      sendEmail({
        "to": email,
        "subject": "Invite for join WorkPlace",
        "templateName": "inviteUserWorkplace", // Name of the EJS template file without the ".ejs" extension
        "templateData": {
          "workplaceName": team.Projects===[]?team.Projects[0].name:null,
          "inviterName": user.name
        }
      })
    

      res.json(invited);
    } catch (error) {
      console.error(error);
      res.status(response.internalServerError.statusCode).json({ message: response.internalServerError.message });
    }
  })
);

module.exports = router;
