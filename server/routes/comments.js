const express = require("express");
const { asyncHandler } = require("../utilities/utils");
const { requireAuth } = require("../utilities/auth");
const { check, validationResult } = require("express-validator");
const { Comment } = require("../db/models");
const response = require("../utilities/response");

const router = express.Router();

//Authenticates user before being able to use API
// router.use(requireAuth);


router.get("/", requireAuth, async (req, res, next) => {
  try {
    res.json(await Comment.findAll({}));
  }catch (error) {
    next(error);
  }
});


//updates comment
router.put(
  `/:id`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const comment_id = req.params.id;
    const data = req.body;
    try {
      await Comment.update(
        {
          ...data,updatedAt: new Date()
        },
        {
          where: {
            id: comment_id,
          },
        }
      );
      const comment = await Comment.findOne({ where: { id: comment_id } });
      res.json(comment);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//Delete Comment
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const comment_id = req.params.id;

    await Comment.delete({
      where: { id: comment_id },
    });
    res.json(response.ok.statusCode);
  })
);

module.exports = router;
