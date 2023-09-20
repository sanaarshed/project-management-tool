const express = require("express");
const { asyncHandler } = require("./utilities/utils");
const { requireAuth } = require("./utilities/auth");
const { check, validationResult } = require("express-validator");
const { UserTeam, Team, User } = require("../db/models");
const responses = require("./utilities/response");


const router = express.Router();

//Leave Team

router.delete(
  "/:teamId/user/:userId",
  asyncHandler(async (req, res, next) => {
    const team_id = req.params.teamId;
    const user_id = req.params.userId;
    const userteam = await UserTeam.destroy({
      where: {
        user_id: user_id,
        team_id: team_id,
      },
    });

    const team = await Team.findOne({
      where: {
        id: team_id,
      },
      include: [{ model: User }],
    });

    if (team.Users.length === 0) {
      await Team.destroy({
        where: {
          id: team_id,
        },
      });
    }
    res.status(responses.userRemovedFromTeam.statusCode).send({ error: responses.userRemovedFromTeam.message });
  })
);

//get all userteams
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const userteams = await UserTeam.findAll({});
    res.json(userteams);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const userteams = await UserTeam.findAll({
      where: {
        team_id: req.params.id,
      },
    });
    res.json(userteams);
  })
);

module.exports = router;
