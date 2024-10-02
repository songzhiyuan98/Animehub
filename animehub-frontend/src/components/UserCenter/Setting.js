import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Select, MenuItem } from "@mui/material";

const Setting = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        设置
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          语言设置
        </Typography>
        <Select
          value={i18n.language}
          onChange={changeLanguage}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="zh">中文</MenuItem>
          <MenuItem value="ja">日本語</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default Setting;
