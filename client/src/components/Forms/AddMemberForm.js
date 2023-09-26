import React, { useEffect, useState } from "react";
import "../../css/Task.css";
import Button from "@material-ui/core/Button";
import { Modal, TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";
import apiServer from "../../config/apiServer";
import Loader from "../Loader";
import { useSnackbar } from "../SnackbarContext";
import { RiCloseLine } from "react-icons/ri";

const AddMemberForm = ({ teamId, clickClose, open, setTeamUsers }) => {
  const { register, handleSubmit, errors } = useForm();
  const [users, setUsers] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setinviteEmail] = useState("");
  const { showSnackbar } = useSnackbar();

  const onSubmit = async ({ userId }) => {
    try {
      await apiServer.post(`/team/${teamId}/user/${userId}`);
      const res = await apiServer.get(`/team/${teamId}`);
      setTeamUsers(res.data.Users);

      clickClose();
    } catch (err) {
      setError("User already on team");
    }

    // const res = await apiServer.get(`/project/${projectId}/tasklists`);
  };

  const handleSendEmailInvite = async () => {
    try {
      console.log("handleSendEmailInvite--->");
      const id = localStorage.getItem("userId");
      const payload = {
        email: inviteEmail,
        teamId: teamId,
        invitedBy: id,
      };
      await apiServer.post(`team/invite`, payload).then((res) => {
        if (res.status === 200) {
          showSnackbar("Invitation Sent", "success");
          clickClose();
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Handle the 409 conflict error here
        showSnackbar(error.response.data.message);
      } else {
        // Handle other errors
        console.error("Error:", error.message);
      }
    }
  };

  const getAllUsers = async () => {
    const res = await apiServer.get("/users");
    setUsers(res.data);
    setLoading(false);
  };
  useEffect(() => {
    getAllUsers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const renderedUsers = users.map((user, i) => {
    return (
      <option key={i} id={user.id} value={user.id}>
        {user.name} - {user.email}
      </option>
    );
  });
  return (
    <div>
      <Modal open={open} onClose={clickClose}>
        <div className="tasklist-modal-container">
          <div className="m-3 flex justify-end">
            <RiCloseLine
              style={{
                color: "black",
                fontSize: "24px",
                cursor: "pointer",
              }}
              onClick={clickClose}
            />
          </div>
          <form className="task-form" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="mb-2 font-semibold">Add a member to the team!</h2>

            {/* <div className="form-top-container"> */}
            <div style={{ display: "flex" }} className="form-content">
              <div className="flex justify-center items-start">
                <label className="form-label">
                  <select
                    id="user-select"
                    name="userId"
                    className="form-input"
                    onChange={() => setError("")}
                    ref={register({ required: true })}
                    placeholder="<---Choose user--->"
                  >
                    {/* <option value={0}>{"<---Choose user--->"}</option> */}
                    {renderedUsers}
                  </select>

                  <div className="error-message">{error}</div>
                  {errors.projectId?.type === "required" && (
                    <p className="error-message">Please choose a user to add</p>
                  )}
                </label>
                <Button
                  style={{ color: "#0093ff" }}
                  type="submit"
                  variant="contained"
                >
                  Add
                </Button>
              </div>
              <div className="flex justify-between gap-2 mt-2">
                <TextField
                  size="small"
                  variant="outlined"
                  value={inviteEmail}
                  onChange={(e) => setinviteEmail(e.target.value)}
                  placeholder="Invite email"
                />
                <Button
                  style={{ color: "#0093ff" }}
                  onClick={handleSendEmailInvite}
                  variant="contained"
                >
                  Invite
                </Button>
              </div>
            </div>
            {/* </div> */}

            {/* <div style={{ display: "flex", marginLeft: "160px" }}>
              <Button
                style={{ color: "#0093ff" }}
                onClick={clickClose}
                color="primary"
              >
                Cancel
              </Button>
            </div> */}
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AddMemberForm;
