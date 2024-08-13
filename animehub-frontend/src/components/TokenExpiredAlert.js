import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTokenExpired } from "../redux/actions/userActions";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const TokenExpiredAlert = () => {
  const tokenExpired = useSelector((state) => state.user.tokenExpired);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    console.log("TokenExpiredAlert: tokenExpired state changed", tokenExpired);
    if (tokenExpired) {
      console.log("Token expired, showing alert");
      setShowAlert(true);
    }
  }, [tokenExpired]);

  const handleClose = () => {
    console.log("Closing alert");
    setShowAlert(false);
    dispatch(setTokenExpired(false));
    navigate("/login"); // 重定向到登录页面
  };

  return (
    <Dialog
      open={showAlert}
      onClose={handleClose}
      aria-labelledby="token-expired-dialog-title"
      PaperProps={{
        sx: {
          width: "500px",
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
          padding: 3,
        },
      }}
    >
      <DialogTitle id="token-expired-dialog-title">会话已过期</DialogTitle>
      <DialogContent>
        <DialogContentText>
          您的会话已过期。请重新登录以继续使用。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenExpiredAlert;
