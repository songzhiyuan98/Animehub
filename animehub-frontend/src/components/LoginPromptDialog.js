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

const LoginPromptDialog = ({ open, handleClose }) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login"); // 重定向到登录页面
    handleClose(); // 关闭对话框
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
      <DialogTitle id="login-prompt-dialog-title">需要登录</DialogTitle>
      <DialogContent>
        <DialogContentText>您需要登录才能使用此功能。</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLoginRedirect} color="primary">
          去登录
        </Button>
        <Button onClick={handleClose}>取消</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginPromptDialog;
