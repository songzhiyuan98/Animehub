import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LoginPromptDialog = ({ open, handleClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLoginRedirect = () => {
    navigate("/login");
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="login-prompt-dialog-title"
      PaperProps={{
        sx: {
          width: "500px",
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
          padding: 3,
        },
      }}
    >
      <DialogTitle id="login-prompt-dialog-title">
        {t("loginRequired")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{t("loginRequiredMessage")}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLoginRedirect} color="primary">
          {t("goToLogin")}
        </Button>
        <Button onClick={handleClose}>{t("cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginPromptDialog;
