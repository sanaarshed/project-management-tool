import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RiCloseLine } from "react-icons/ri";
import { Context as TaskContext } from "../../context/store/TaskStore";
import { Context as ProjectContext } from "../../context/store/ProjectStore";
import moment from "moment";
import UserAvatar from "../NavigationBar/UserAvatar";
import apiServer from "../../config/apiServer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { BiCheck } from "react-icons/bi";
import AttachFileIcon from "../../assets/Attach";
import PdfFileIcon from "../../assets/pdf-file.svg";
import PsdFileIcon from "../../assets/psd-file.svg";
import DocFileIcon from "../../assets/doc-file.svg";
import DownloadICon from "../../assets/download-icon.svg";

const PopOutTaskDetails = ({ showSideTaskDetails, sideTaskDetails }) => {
  const [taskState, taskdispatch] = useContext(TaskContext);
  const { selectedTask: task } = taskState;
  const [projectState, projectdispatch] = useContext(ProjectContext);
  const [teamDescription, setTeamDescription] = useState(task.description);
  const [projectUsers, setProjectUsers] = useState(task.Project.Users);
  const [assigneeUser, setAssigneeUser] = useState(task.User);
  const [taskComments, setTaskComments] = useState(task.Comments);
  const [dueDate, setDueDate] = useState(new Date(task.due_date));
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // const [completed, setCompleted] = useState(task.completed);
  const [commentBox, setCommentBox] = useState(false);
  const [allFiles, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  var completed = task.completed;
  const date = moment(
    task.due_date.substring(0, 10).replace("-", ""),
    "YYYYMMDD"
  );

  console.log("ffffffffff", task.Files);
  // console.log(task.due_date, "task.due_date DB");
  // console.log(date, "moment date convert from db");
  // console.log(dueDate, "dueDate state new Date convert ");

  const { register, handleSubmit, clearErrors } = useForm();

  //This doesn't do anything for initial
  const getProjectUsers = async (event) => {
    var projectSelect = document.getElementById("project-select");
    // var assigneeSelect = document.getElementById("assignee-select");
    clearErrors(projectSelect.name);
    // clearErrors(assigneeSelect.name);
    const res = await apiServer.get(`/project/${projectSelect.value}/team`);
    const userList = res.data.Users.filter((user) => {
      return user.id !== task.User.id;
    });
    console.log(userList, "userList");
    setProjectUsers(userList);
    updateProject();
  };
  useEffect(() => {
    if (task.Files) setFiles(task.Files);
  }, [task]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const downloadFile = async (id) => {
    console.log("downlaod File--->");
    await apiServer.get(`/file/${id}`);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("taskId", task.id); // Add taskId to the form data
      formData.append("file", selectedFile);

      try {
        setUploading(true);
        // Send a POST request to your server to upload the file
        await apiServer.post("/file/upload", formData);
        // Handle success, e.g., show a success message
        console.log("File uploaded successfully");
        //get all the task data again
        const res = await apiServer.get(`/task/${task.id}`);
        setFiles(res.data.Files);
        // Clear the selected file
        setSelectedFile(null);
      } catch (error) {
        // Handle errors, e.g., show an error message
        console.error("File upload failed:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const updateProject = async (e) => {
    var projectId = document.getElementById("project-select").value;
    const userId = localStorage.getItem("userId");
    console.log("projectId-->", projectId);
    await apiServer.put(`/task/${task.id}/project/${projectId}`);
    const res = await apiServer.get(`/task/user/${userId}`);
    await taskdispatch({ type: "get_user_tasks", payload: res.data });
  };

  const updateAssignee = async (e) => {
    var assigneeId = document.getElementById("assignee-select").value;

    await apiServer.put(`/task/${task.id}/assignee/${assigneeId}`);
    const assignee = await apiServer.get(`/task/${task.id}`);
    setAssigneeUser(assignee.data.User);
    //updates tasks
    const userId = localStorage.getItem("userId");
    const res = await apiServer.get(`/task/user/${userId}`);
    console.log("ddd", res);
    await taskdispatch({ type: "get_user_tasks", payload: res.data });
  };

  const updateDueDate = async (date) => {
    setDueDate(date);
    await apiServer.put(`/task/${task.id}/dueDate`, { date });
    console.log(date);
  };
  const updateDescription = async (e) => {
    const description = e.target.value;
    await apiServer.put(`/task/${task.id}/description`, { description });

    console.log(e.target.value);
  };

  const handleDescriptionUpdate = (e) => {
    setTeamDescription(e.target.value);
  };

  const handleCommentSubmit = async ({ text }) => {
    const user_id = localStorage.getItem("userId");
    await apiServer.post(`/task/${task.id}/comment`, {
      text,
      user_id,
    });

    const comments = await apiServer.get(`/task/${task.id}/comment`);
    setTaskComments(comments.data);
    updateScroll();
  };

  const handleMarkComplete = async () => {
    await updateComplete();
  };

  const updateComplete = async () => {
    // console.log(completed, "before");
    completed = !completed;
    const userId = localStorage.getItem("userId");
    // console.log(completed, "after");

    const updatedTask = await apiServer.put(`/task/${task.id}/complete`, {
      completed,
    });
    await taskdispatch({
      type: "get_selected_task",
      payload: updatedTask.data,
    });

    // console.log(task, "after update");

    const res = await apiServer.get(`/task/user/${userId}`);
    await taskdispatch({ type: "get_user_tasks", payload: res.data });
  };
  const expandCommentBox = () => {
    setCommentBox(!commentBox);
  };

  function updateScroll() {
    var element = document.getElementById("scrollable");
    element.scrollTop = element.scrollHeight;
  }
  const renderedProjects = projectState.projects
    .filter((project) => {
      return project.id !== task.Project.id;
    })
    .map((project, i) => {
      return (
        <option key={i} id={project.id} value={project.id}>
          {project.name}
        </option>
      );
    });

  const renderedUsers = projectUsers
    .filter((user) => {
      return user.id !== task.User.id;
    })
    .map((user, i) => {
      return (
        <option key={i} value={user.id}>
          {user.name}
        </option>
      );
    });

  const renderedComments = taskComments.map((comment, i) => {
    const commentDate = moment(
      comment.createdAt.substring(0, 10).replace("-", ""),
      "YYYYMMDD"
    ).format("MMM D");

    return (
      <div className="comment-container">
        <div className="comment-header">
          <div
            className="user-avatar"
            style={{
              width: "25px",
              height: "25px",
              marginRight: "10px",
            }}
          >
            {(comment.User.name[0] + comment.User.name[1]).toUpperCase()}
          </div>

          <div>
            <p
              style={{ fontWeight: 500, marginRight: "10px", fontSize: "15px" }}
            >
              {comment.User.name}
            </p>
          </div>
          <div>
            <p style={{ color: "gray", fontSize: "12px" }}>{commentDate}</p>
          </div>
        </div>
        <div className="comment-text">
          <p style={{ fontSize: "15px", margin: "0px" }}>{comment.text}</p>
        </div>
      </div>
    );
  });

  return (
    <>
      <div className={"task-detail-menu active"}>
        <div
          style={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            minHeight: "1px",
            overflow: "hidden",
          }}
        >
          {selectedImage && (
            <div
              className="image-preview-overlay"
              onClick={() => setSelectedImage(null)}
            >
              <div className="image-preview">
                <img src={selectedImage} alt="Selected Image" />
              </div>
            </div>
          )}
          <div className="task-detail-menu-container">
            <div className="task-detail-menu-top">
              <div
                className={
                  completed
                    ? "mark-complete-container__completed"
                    : "mark-complete-container__incompleted"
                }
                onClick={handleMarkComplete}
              >
                <div
                  className={
                    completed
                      ? "complete-button__completed"
                      : "complete-button__incompleted"
                  }
                >
                  <div
                    className="check-mark-container"
                    style={{ margin: "0px 5px" }}
                  >
                    <BiCheck
                      className={
                        completed
                          ? "check-mark-icon__completed"
                          : "check-mark-icon__incompleted"
                      }
                    />
                  </div>
                  <div
                    className={
                      completed
                        ? "mark-complete__completed"
                        : "mark-complete__incompleted"
                    }
                  >
                    Mark Complete
                  </div>
                </div>
              </div>
              <div className="task-detail-close-icon">
                <RiCloseLine
                  style={{
                    color: "black",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                  onClick={showSideTaskDetails}
                />
              </div>
            </div>

            {/* <div style={{ height: "80%" }}> */}
            <div
              id="scrollable"
              style={{
                display: "flex",
                flex: "1 1 auto",
                flexDirection: "column",
                minHeight: "1px",
                zIndex: "100",
                padding: "0 24px",
                overflowY: "auto",
                borderBottom: "1px solid lightgrey",
                marginBottom: "5px",
              }}
            >
              <div>
                <form className="task-detail-menu-main-content">
                  <div className="task-detail-title">
                    <h2>{task.name}</h2>
                  </div>
                  <div className="task-details-container">
                    <div className="task-details-subtitles">
                      <p>Assignee</p>
                      <p>Due Date</p>
                      <p>Project</p>
                      <p>Description</p>
                      <p style={{ marginTop: "120px" }}>Attach File</p>
                    </div>
                    <div className="task-details-data">
                      <div
                        className="assignee-select-container"
                        style={{ display: "flex" }}
                      >
                        <div
                          className="user-avatar"
                          style={{
                            width: "25px",
                            height: "25px",
                            marginRight: "10px",
                          }}
                        >
                          {(
                            assigneeUser.name[0] + assigneeUser.name[1]
                          ).toUpperCase()}
                        </div>
                        <select
                          id="assignee-select"
                          name="assigneeId"
                          className="form-input"
                          ref={register({ required: true })}
                          onChange={updateAssignee}
                          style={{ width: "150px" }}
                        >
                          <option
                            value={task.User.id}
                            id={task.User.id}
                            selected
                          >
                            {/* changes need to be done here as we can have access to all the team members */}
                            {task.User.name}
                          </option>
                          {renderedUsers}
                        </select>
                      </div>
                      <div
                        className="dueDate-container"
                        style={{ marginTop: "20px" }}
                      >
                        <DatePicker
                          selected={dueDate}
                          onChange={(date) => updateDueDate(date)}
                          // customInput={<DateButton />}
                        />
                        {/* <p style={{ marginTop: "20px" }}> {date.format("MMM D")}</p> */}
                      </div>

                      <div
                        className="project-select-container"
                        style={{
                          height: "25px",
                          borderRadius: "20px",

                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "15px",
                        }}
                      >
                        <select
                          id="project-select"
                          name="projectId"
                          className={`form-input `}
                          onChange={getProjectUsers}
                          defaultValue={task.Project.name}
                          ref={register({ required: true })}
                          onBlur={updateProject}
                          style={{
                            height: "25px",
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            background: "transparent",
                            justifyContent: "center",
                          }}
                        >
                          <option
                            value={task.Project.id}
                            id={task.Project.id}
                            selected
                          >
                            {task.Project.name}
                          </option>
                          {renderedProjects}
                        </select>
                        {/* <p style={{ margin: 0 }}> {task.Project.name}</p> */}
                      </div>

                      <div className="task-detail-description-container">
                        <textarea
                          className="task-detail-edit-description"
                          placeholder="Click to add team description..."
                          value={teamDescription}
                          onChange={handleDescriptionUpdate}
                          onBlur={updateDescription}
                        ></textarea>
                      </div>

                      <div className="file-upload-container">
                        <div>
                          <input
                            type="file"
                            id="file-input"
                            accept=".pdf, .doc, .docx, .jpg, .jpeg, .png" // Define the accepted file types
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor="file-input"
                            className="file-upload-icon"
                          >
                            <AttachFileIcon />
                          </label>
                          {selectedFile && (
                            <div>
                              <button
                                className="file-upload-button"
                                onClick={handleFileUpload}
                                disabled={uploading}
                              >
                                {uploading ? "Uploading..." : "Upload"}
                              </button>
                              <p>{selectedFile.name}</p>
                            </div>
                          )}
                        </div>
                        <div className="image-gallery">
                          {allFiles?.map((image, index) => {
                            console.log("image--->", image);
                            // extract from file name
                            const fileName = image.name;
                            const fileExtension = fileName.split(".").pop();

                            return (
                              <div>
                                <div className="files-container">
                                  <div
                                    className="download-overlay"
                                    onClick={() => downloadFile(image.id)}
                                  >
                                    <img
                                      className="download-icon"
                                      src={DownloadICon}
                                    />
                                  </div>
                                  {fileExtension === "pdf" ? (
                                    <img
                                      className="file-icon"
                                      src={PdfFileIcon}
                                    />
                                  ) : null}
                                  {fileExtension === "psd" ? (
                                    <img
                                      className="file-icon"
                                      src={PsdFileIcon}
                                    />
                                  ) : null}
                                  {fileExtension === "doc" ||
                                  fileExtension === "docx" ? (
                                    <img
                                      className="file-icon"
                                      src={DocFileIcon}
                                    />
                                  ) : null}
                                </div>

                                {fileExtension === "jpeg" ||
                                fileExtension === "jpg" ||
                                fileExtension === "png" ? (
                                  <div key={index} className="image-item">
                                    <img
                                      className="images-preview"
                                      src={image.path} // Adjust the URL to match your server's image path
                                      alt={image.name}
                                      onClick={() =>
                                        setSelectedImage(image.path)
                                      }
                                    />
                                  </div>
                                ) : null}

                                <p className="image-name">{image.name}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="task-detail-user-comments-container">
                  {taskComments.length !== 0 ? (
                    renderedComments
                  ) : (
                    <div>No comments yet.. </div>
                  )}
                </div>
              </div>
            </div>
            <div
              // className={
              //   commentBox
              //     ? "task-detail-comment-container active"
              //     : "task-detail-comment-container"
              // }
              className="task-detail-comment-container"
            >
              <div
                // className={
                //   commentBox
                //     ? "task-detail-user-comment active"
                //     : "task-detail-user-comment"
                // }
                className="task-detail-user-comment"
              >
                <div
                  className="task-detail-comment-avatar"
                  style={{ width: "25px", height: "25px", fontSize: "10px" }}
                >
                  <UserAvatar id={localStorage.getItem("userId")} />
                </div>
                <div className="task-detail-comment-box">
                  <form
                    className="task-detail-comment-form"
                    onSubmit={handleSubmit(handleCommentSubmit)}
                    onFocus={expandCommentBox}
                    onBlur={expandCommentBox}
                  >
                    <div style={{ width: "100%", height: "100%" }}>
                      <textarea
                        name="text"
                        className="comment-textarea"
                        placeholder="Ask a question or post an update..."
                        ref={register({ required: true })}
                      ></textarea>
                    </div>

                    {/* {commentBox ? ( */}
                    <div style={{ alignSelf: "flex-end", marginTop: "10px" }}>
                      <button
                        className="comment-button"
                        style={{ height: "30px", width: "80px" }}
                        type="submit"
                      >
                        Comment
                      </button>
                    </div>
                    {/* ) : null} */}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopOutTaskDetails;
