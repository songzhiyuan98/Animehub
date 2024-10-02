import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const FullSynopsisDialog = ({ open, handleClose, synopsis }) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="full-synopsis-dialog-title"
      PaperProps={{
        sx: {
          width: "500px",
          maxWidth: "90vw",
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
          padding: 3,
        },
      }}
    >
      <DialogTitle id="full-synopsis-dialog-title">
        {t("completeSynopsis")}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">{synopsis}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullSynopsisDialog;
