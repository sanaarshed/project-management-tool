const express = require("express");
const { asyncHandler } = require("./utilities/utils");
const { requireAuth, getUserToken } = require("./utilities/auth");
const { check, validationResult } = require("express-validator");
const { File, Task } = require("../models");
const fileUpload = require("express-fileupload"); // Import express-fileupload middleware
const path = require("path");
const fs = require("fs");


const router = express.Router();

// Enable file uploads with express-fileupload middleware
router.use(fileUpload());

// ...

router.post(
  "/upload",
  asyncHandler(async (req, res, next) => {
    const { taskId } = req.body; // Get the taskId from the request body

    // Check if the task with the given ID exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files were uploaded." });
    }

    const uploadedFile = req.files.file; // "uploadedFile" should match the field name in your form

    // Define the upload path (e.g., "uploads" folder + filename)
    console.log(uploadedFile.name);
    const uploadPath = `uploads/${uploadedFile.name}`;
    console.log(uploadPath);

    // Save the uploaded file to the server
    uploadedFile.mv(uploadPath, async (err) => {
      if (err) {
        console.error("File upload error:", err); // Log the error for debugging
        return res.status(500).json({ message: "File upload failed." });
      }

      // Create a new File record in the database
      const file = await File.create({
        name: uploadedFile.name,
        task_id: taskId,
        path: uploadPath,
      });
      if (!file) {
        return res.status(400).json({ message: "Failed to create a file record." });
      }

      res.json({ message: "File uploaded successfully.", file });
    });
  })
);


router.get("/:id", asyncHandler(async (req, res, next) => {
  const file_id = req.params.id;
  const file = await File.findOne({
    where: {
      id: file_id,
    },
  });

  if (!file) {
    return res.status(404).json({ message: "File not found." });
  }

  // Get the file path
  const filePath = file.path;

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found on the server." });
  }

  // Set appropriate headers for the response
  res.setHeader("Content-Disposition", `attachment; filename=${file.name}`);
  res.setHeader("Content-Type", "application/octet-stream");

  // Create a readable stream from the file and pipe it to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}));


module.exports = router;
