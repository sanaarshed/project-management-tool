import React from "react";
import { useSnackbar } from "./SnackbarContext";
import { Snackbar as MuiSnackbar, SnackbarContent } from "@material-ui/core";

const Snackbar = () => {
  const { snackbarOpen, message, hideSnackbar } = useSnackbar();

  return (
    <MuiSnackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={snackbarOpen}
      autoHideDuration={3000} // Adjust as needed
      onClose={hideSnackbar}
    >
      <SnackbarContent message={message} />
    </MuiSnackbar>
  );
};

export default Snackbar;
