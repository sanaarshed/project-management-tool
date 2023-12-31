const express = require("express");
const { asyncHandler } = require("../utilities/utils");
const { requireAuth } = require("../utilities/auth");
const { check, validationResult } = require("express-validator");
const { TaskList, Task } = require("../db/models");
const router = express.Router();
const response = require("../utilities/response");

//Authenticates user before being able to use API
// router.use(requireAuth);

//get all tasklists
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const tasklists = await TaskList.findAll({});
    res.json(tasklists);
  })
);

//get all tasks for tasklist
router.get(
  "/:id/tasks",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;
    const tasks = await Task.findAll({
      where: {
        tasklist_id: tasklist_id
      }
    });
    res.json(tasks);
  })
);

//Create task to tasklist
router.post(
  "/:id/task",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;
    const {
      name,
      projectId,
      assigneeId,
      due_date,
      completed,
      description
    } = req.body;
    const task = await Task.create({
      name: name,
      project_id: projectId,
      assignee_id: assigneeId,
      due_date: due_date,
      completed: completed,
      description: description,
      tasklist_id: tasklist_id
    });
    if (!task) {
      res.status(response.notFound.statusCode);
    } else {
      res.json(task).status(response.created.statusCode);
    }
  })
);

//Delete TaskList
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;

    const tasklist = await TaskList.destroy({
      where: { id: tasklist_id }
    });
    res.json(response.ok.statusCode);
  })
);

//Edit Column index
router.put(
  "/:id/columnindex",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const { newIndex } = req.body;
    const tasklist_id = req.params.id;
    const column_index = req.params.columnIndex;

    try {
      const updateIndex = await TaskList.update(
        {
          column_index: newIndex
        },
        {
          where: {
            id: tasklist_id
          }
        }
      );
      res.json(updateIndex);
    } catch (err) {
      res
        .status(response.internalServerError.statusCode)
        .send({ error: response.internalServerError.message });
    }
  })
);

//update tasklist name

router.put(
  "/:id/title",
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;
    const { columnTitle } = req.body;
    const tasklist = await TaskList.update(
      { name: columnTitle },
      { where: { id: tasklist_id } }
    );
    res.json({ message: "updated" });
  })
);

module.exports = router;
