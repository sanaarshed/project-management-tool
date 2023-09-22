import React, { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import "../../css/Navbar.css";
import { GrAddCircle } from "react-icons/gr";
import UserAvatar from "./UserAvatar";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
} from "@material-ui/core";
import ProjectForm from "../Forms/ProjectForm";
import TaskForm from "../Forms/AddTaskForm";
import Search from "../../assets/search";
import messageIcon from "../../assets/message.png";
import Alert from "../../assets/alert";
import { Context as UserContext } from "../../context/store/UserStore";
import { Context as TeamContext } from "../../context/store/TeamStore";
import apiServer from "../../config/apiServer";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "../SnackbarContext";
const TopNavBar = ({
  name,
  teamId,
  userId,
  projectId,
  setTeamProjects,
  setTasklists,
  sidebar,
}) => {
  const { logout } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEle, setAnchorEle] = useState(null);
  const [anchorTeam, setAnchorTeam] = useState(null);
  const [openProject, setOpenProject] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [confirmDialogOpen, setConfirmDialog] = useState(false);
  const [userState, userdispatch] = useContext(UserContext);
  const [teamState, teamdispatch] = useContext(TeamContext);

  const [edit, setEdit] = useState(false);
  const { showSnackbar } = useSnackbar(false);
  const history = useHistory();
  const getUpdatedData = async () => {
    const res = await apiServer.get(`/team/user/${userId}`);
    await teamdispatch({
      type: "update_user_teams",
      payload: res.data,
    });
  };
  const clickOpenTask = () => {
    setOpenTask(true);
    handleNewClose();
  };

  const clickCloseTask = () => {
    setOpenTask(false);
  };

  const clickOpenProject = () => {
    setOpenProject(true);
    handleNewClose();
  };
  const clickCloseProject = () => {
    setOpenProject(false);
  };

  const handleNewClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleNewClose = () => {
    setAnchorEl(null);
  };

  const handleProfClick = (event) => {
    setAnchorEle(event.currentTarget);
  };

  const handleProfClose = () => {
    setAnchorEle(null);
  };
  const handleClose = () => {
    setAnchorTeam(null);
  };

  const handleTeamClick = (event) => {
    if (anchorTeam) setAnchorTeam(null);
    else setAnchorTeam(event.currentTarget);
  };
  const deleteTeam = async (event) => {
    //delete team
    setConfirmDialog(true);
  };

  const handleEdit = async (event) => {
    setEdit(false);
    await apiServer
      .put(`/team/${teamId}/name`, {
        name: editTeamName,
      })
      .then(() => getUpdatedData());
  };
  const handleDelete = async (event) => {
    //delete team
    handleConfirmDialogClose();
    console.log("userId--->", userId);

    if (projectId) {
      await apiServer.delete(`/project/${projectId}`);
      history.goBack();
    } else if (teamId) {
      try {
        if (userId && teamId) {
          const res = await apiServer.delete(
            `/team/${teamId}/userTeam/${userId}`
          );
          if (res.status === 204) {
            getUpdatedData();

            showSnackbar(name + " deleted successfully!");
            history.goBack();
          }
        }
      } catch (e) {
        if (e.response.status === 400)
          if (e.response.data) {
            showSnackbar(e.response.data.message);
            console.log("e.message--->", e.response.status);
          }
      }
    }
  };
  const editTeam = (event) => {
    setEdit(true);
    handleClose();
    setEditTeamName(name);
    //editTeam
  };
  const handleConfirmDialogClose = (event) => {
    setConfirmDialog(false);
  };
  const ConfirmDialoge = () => (
    <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the {projectId ? "project" : "team"}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirmDialogClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="secondary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
  return (
    // <div
    //   className={
    //     sidebar ? "top-nav-bar-container__short" : "top-nav-bar-container"
    //   }
    // >
    <div className="top-nav-bar-container">
      <ConfirmDialoge />
      <div className="top-nav-bar-left">
        {!edit ? (
          <h2>{name}</h2>
        ) : (
          <input
            type="text"
            value={editTeamName}
            onBlur={handleEdit}
            onKeyDown={(e) => {
              console.log("e.key--->", e.key);
              if (e.key === "Enter") {
                // Handle the Enter key press here
                // For example, you can call a function or submit a form
                handleEdit();
              }
            }}
            onChange={(e) => {
              setEditTeamName(e.target.value);
            }}
          />
        )}
        <div style={{ cursor: "pointer" }} onClick={handleTeamClick}>
          <i className="arrow"></i>
        </div>
        <Menu
          style={{ marginTop: "40px" }}
          anchorEl={anchorTeam}
          // keepMounted
          open={Boolean(anchorTeam)}
          onClose={handleClose}
        >
          <MenuItem onClick={deleteTeam}>Delete</MenuItem>
          <MenuItem onClick={editTeam}>Edit</MenuItem>
        </Menu>
      </div>
      <div className="top-nav-bar-middle"></div>
      <div className="top-nav-bar-right" style={{}}>
        {/* <div style={{ display: "flex" }}>
          <input className="searchbar" placeholder={"Search"}></input>
        </div> */}
        {/* <div>
          <GrAddCircle onClick={handleNewClick} className="top-nav-bar--icon" />
          <Menu
            style={{ marginTop: "40px" }}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleNewClose}
          >
            <MenuItem onClick={clickOpenTask}>Add Task</MenuItem>
            <TaskForm
              handleNewClose={handleNewClose}
              clickClose={clickCloseTask}
              open={openTask}
              setTasklists={setTasklists}
            ></TaskForm>
            <MenuItem onClick={clickOpenProject}>Add Project</MenuItem>
            <ProjectForm
              handleNewClose={handleNewClose}
              clickClose={clickCloseProject}
              open={openProject}
              setTeamProjects={setTeamProjects}
            />
          </Menu>
        </div> */}
        <div
          className="top-nav-icons"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div>
            <Alert />
          </div>
          <div>
            <Search />
          </div>

          <div>
            <img className="logo" style={{}} src={messageIcon} alt="logo" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ padding: "0" }}>
            <UserAvatar id={localStorage.getItem("userId")} />
          </div>
          <div>{userState.user.name}</div>
          <div
            onClick={handleProfClick}
            style={{ padding: "0", cursor: "pointer" }}
          >
            <i className="arrow"></i>
          </div>
        </div>

        <Menu
          style={{ marginTop: "40px" }}
          anchorEl={anchorEle}
          keepMounted
          open={Boolean(anchorEle)}
          onClose={handleProfClose}
        >
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default TopNavBar;
