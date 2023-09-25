const express = require("express");
const { asyncHandler } = require("./utilities/utils");
const { requireAuth } = require("./utilities/auth");
const { check, validationResult } = require("express-validator");
const { Task, Comment, Project, User, File } = require("../db/models");
const response = require("./utilities/response");


const router = express.Router();
//Authenticates user before being able to use API
// router.use(requireAuth);

//get all tasks
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const tasks = await Task.findAll({include: [{ model: File }]});

    res.json(tasks);
  })
);

//get all tasks for user
router.get(
  "/user/:id",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const user_id = req.params.id;
    const tasks = await Task.findAll({
      where: {
        assignee_id: user_id,
      },
      include: [{ model: Project }],
    });
    res.json(tasks);
  })
);

//create comment for task
router.post(
  "/:id/comment",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { text, user_id } = req.body;
    const comment = await Comment.create({
      text: text,
      task_id: task_id,
      user_id: user_id,
    });

    if (!comment) {
      res.status(404);
    } else {
      res.json(comment).status(response.created.statusCode);
    }
  })
);

//get all comments for task
router.get(
  "/:id/comment",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const comments = await Comment.findAll({
      where: {
        task_id: task_id,
      },
      include: [{ model: User, attributes: ["id", "name", "email", "image"] }],
      order: [["id", "ASC"]],
    });
    res.json(comments);
  })
);

router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { name, due_date, description, completed } = req.body;
    try {
      const updateTask = await Task.update(
        {
          name: name,
          due_date: due_date,
          description: description,
          completed: completed,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      res.json(updateTask);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

router.get(
  `/:id`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const task = await Task.findOne({
      where: {
        id: task_id,
      },
      include: [
        {
          model: Project,
          include: {
            model: User,
            attributes: ["id", "name", "email", "image"],
          },
        },
        { model: User, attributes: ["id", "name", "email", "image"] },
        {
          model: Comment,
          include: {
            model: User,
            attributes: ["id", "name", "email", "image"],
          },
        },
        { model: File }
      ],
    });
    res.json(task);
  })
);

//updates tasklist
router.put(
  `/:id/tasklist`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { destinationTasklistId } = req.body;
    try {
      const updateTasklist = await Task.update(
        {
          tasklist_id: destinationTasklistId,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({ where: { id: task_id } });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//update project
router.put(
  `/:id/project/:projectId`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const project_id = req.params.projectId;
    try {
      const updateTask = await Task.update(
        {
          project_id: project_id,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({ where: { id: task_id } });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//update Assignee
router.put(
  `/:id/assignee/:assigneeId`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const assignee_id = req.params.assigneeId;
    try {
      const updateTask = await Task.update(
        {
          assignee_id: assignee_id,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({
        where: {
          id: task_id,
        },
        include: [
          { model: Project },
          { model: User, attributes: ["id", "name", "email", "image"] },
        ],
      });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//update due date
router.put(
  `/:id/dueDate`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { date } = req.body;
    try {
      const updateTask = await Task.update(
        {
          due_date: date,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({ where: { id: task_id } });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//update description
router.put(
  `/:id/description`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { description } = req.body;
    try {
      const updateTask = await Task.update(
        {
          description: description,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({ where: { id: task_id } });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//update complete
router.put(
  `/:id/complete`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { completed } = req.body;
    try {
      const updateTask = await Task.update(
        {
          completed: completed,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({
        where: {
          id: task_id,
        },
        include: [
          {
            model: Project,
            include: {
              model: User,
              attributes: ["id", "name", "email", "image"],
            },
          },
          { model: User, attributes: ["id", "name", "email", "image"] },
          {
            model: Comment,
            include: {
              model: User,
              attributes: ["id", "name", "email", "image"],
            },
          },
        ],
      });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//updates taskindex
router.put(
  `/:id/taskindex`,
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;
    const { destinationIndex } = req.body;
    try {
      const updateTaskIndex = await Task.update(
        {
          task_index: destinationIndex,
        },
        {
          where: {
            id: task_id,
          },
        }
      );
      const task = await Task.findOne({ where: { id: task_id } });
      res.json(task);
    } catch (err) {
      res.status(response.internalServerError.statusCode).send({ error: response.internalServerError.message });
    }
  })
);

//Delete Task
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const task_id = req.params.id;

    await Task.destroy({
      where: { id: task_id },
    });
    res.json(response.ok.statusCode);
  })
);

module.exports = router;
