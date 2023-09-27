import React, { useEffect, useState, useContext } from "react";
import { Redirect, useParams } from "react-router-dom";
import TopNavBar from "../NavigationBar/TopNavBar";
import apiServer from "../../config/apiServer";
import Loader from "../Loader";
import "../../css/TeamPage.css";
import { Menu, MenuItem } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { Context as TeamContext } from "../../context/store/TeamStore";

import TeamMemberIcon from "../teams/TeamMemberIcon";
import ProjectTile from "../projects/ProjectTile";
import NewProjectTile from "../projects/NewProjectTile";
import NewTeamMemberIcon from "../teams/NewTeamMemberIcon";
import AddProjectPopOut from "../PopOutMenu/AddProjectPopOut";
import { BiBorderNone } from "react-icons/bi";
import { AiOutlineEllipsis } from "react-icons/ai";

const TeamPage = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState();
  const [teamProjects, setTeamProjects] = useState();
  const [teamUsers, setTeamUsers] = useState(null);
  const [teamDescription, setTeamDescription] = useState();
  const [loading, setLoading] = useState(true);
  const [anchorMenuMain, setAnchorMenuMain] = useState(null);
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [sideProjectForm, setSideProjectForm] = useState(false);
  const [teamName, setName] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [teamState, teamdispatch] = useContext(TeamContext);
  const userId = localStorage.getItem("userId");
  let history = useHistory();

  const showSideProjectForm = () => {
    setSideProjectForm(!sideProjectForm);
  };
  // console.log("teamState->", teamState);
  // console.log("iddd->", teamId);
  // console.log("nameeeeee->", teamNamee);

  useEffect(() => {
    if (teamState.teams.length > 0) {
      const item = teamState?.teams?.find((i) => teamId == i.id);

      // change name in route `/team/${team.id}/${team.name}`
      if (item) setName(item.name);
    }
  }, [teamState, teamId]);

  const getTeam = async () => {
    try {
      const res = await apiServer.get(`/team/${teamId}`);
      setTeam(res.data);
      setTeamProjects(res.data.Projects);
      setTeamUsers(res.data.Users);
      setTeamDescription(res.data.description);
      setLoading(false);
    } catch (err) {
      console.log("err in get team->", err);
    }
  };

  const handleRemoveMenuClick = (event) => {
    setAnchorMenu(event.currentTarget);
  };
  const handleRemoveMenuClose = () => {
    setAnchorMenu(null);
  };

  const handleMenuClick = (event) => {
    setAnchorMenuMain(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorMenuMain(null);
  };

  const leaveTeam = async () => {
    handleMenuClose();
    await apiServer.delete(`/userteam/${teamId}/user/${userId}`);
    const res = await apiServer.get(`/team/user/${userId}`);
    await teamdispatch({ type: "get_user_teams", payload: res.data });
    history.push("/");
  };
  const removeMember = async () => {
    handleRemoveMenuClose();
    if (selectedUser)
      await apiServer.delete(`/userteam/${teamId}/user/${selectedUser.id}`);

    getTeam();
  };

  const handleUpdate = (e) => {
    setTeamDescription(e.target.value);
  };

  const updateDescription = async (e) => {
    const description = e.target.value;
    await apiServer.put(`/team/${teamId}/description`, { description });
    console.log(e.target.value);
  };

  useEffect(() => {
    getTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, setTeam, setTeamProjects, setTeamUsers]);

  if (loading) {
    return <Loader />;
  }

  // const membersList = teamUsers.map((user, i) => {
  //   return <TeamMemberIcon user={user} key={i} />;
  // });

  // const projectsList = teamProjects.map((project, i) => {
  //   return (
  //     <ProjectTile teamId={teamId} project={project} key={i} id={project.id} />
  //   );
  // });

  return (
    <>
      <TopNavBar
        teamId={teamId}
        userId={userId}
        name={teamName}
        setTeamProjects={setTeamProjects}
        getTeam={getTeam}
      />
      <div className="team-page-container">
        <div className="team-page-content-container">
          <div className="team-page-content-left">
            <div className="team-content-left-description-container">
              <div className="team-content-left-description-header">
                <div className="team-content-title">Description</div>
              </div>
              <form className="team-content-left-description-form">
                <textarea
                  className="edit-description"
                  placeholder="Click to add team description..."
                  value={teamDescription}
                  onChange={handleUpdate}
                  onBlur={updateDescription}
                ></textarea>
              </form>
            </div>
            <div className="team-content-left-members-container">
              <div className="team-content-left-members-header">
                <div className="team-content-title">Members</div>
                <div>
                  <AiOutlineEllipsis
                    onClick={handleMenuClick}
                    style={{ cursor: "pointer" }}
                  />
                  <Menu
                    style={{ marginTop: "40px" }}
                    anchorEl={anchorMenuMain}
                    keepMounted
                    open={Boolean(anchorMenuMain)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={leaveTeam}>Leave Team</MenuItem>
                  </Menu>
                </div>
              </div>
              <div className="team-content-left-members--list">
                {teamUsers === undefined ? (
                  <Redirect to="/" />
                ) : (
                  teamUsers.map((user, i) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          // gap: "20px",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <TeamMemberIcon user={user} key={i} />
                        <div style={{ width: "20px" }} />
                        <div>
                          {userId == user.id ? null : (
                            <AiOutlineEllipsis
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                setSelectedUser(user);
                                handleRemoveMenuClick(e);
                              }}
                            />
                          )}

                          <Menu
                            style={{ marginTop: "40px" }}
                            anchorEl={anchorMenu}
                            keepMounted
                            open={Boolean(anchorMenu)}
                            onClose={handleRemoveMenuClose}
                          >
                            <MenuItem onClick={removeMember}>
                              Remove Member
                            </MenuItem>
                          </Menu>
                        </div>
                      </div>
                    );
                  })
                )}

                <NewTeamMemberIcon
                  setTeamUsers={setTeamUsers}
                  teamId={teamId}
                />
              </div>
            </div>
          </div>
          <div className="team-page-content-right">
            <div className="team-content-right-header">
              <div className="team-content-title">Projects</div>
            </div>
            <div className="team-content-right-projects--list">
              {teamProjects === undefined ? (
                <Redirect to="/" />
              ) : (
                teamProjects.map((project, i) => {
                  return (
                    <ProjectTile
                      teamId={teamId}
                      project={project}
                      index={i}
                      id={project.id}
                    />
                  );
                })
              )}
              {/* {projectsList} */}
              <NewProjectTile showSideProjectForm={showSideProjectForm} />
            </div>
          </div>
        </div>
        {sideProjectForm ? (
          <AddProjectPopOut
            showSideProjectForm={showSideProjectForm}
            setTeamProjects={setTeamProjects}
            title={"Add Project"}
            getTeam={getTeam}
          />
        ) : null}
      </div>
    </>
  );
};

export default TeamPage;
