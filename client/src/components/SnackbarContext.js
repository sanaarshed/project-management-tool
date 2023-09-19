import { Snackbar, SnackbarContent } from "@material-ui/core";
import React, { createContext, useContext, useState } from "react";

const SnackbarContext = createContext();

export const useSnackbar = () => {
  return useContext(SnackbarContext);
};

export const SnackbarProvider = ({ children }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [varient, setVarient] = useState("");

  const showSnackbar = (message, varient) => {
    setVarient(varient);
    setMessage(message);
    setSnackbarOpen(true);
  };

  const hideSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Adjust as needed
        onClose={hideSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <SnackbarContent message={message} />
      </Snackbar>

      {children}
      {/* Render the Snackbar component here */}
    </SnackbarContext.Provider>
  );
};
