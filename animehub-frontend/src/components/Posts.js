import React from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";

const Posts = () => {
  return (
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false} sx={{ marginTop: 2 }}>
        <Typography>帖子专区</Typography>
      </Container>
    </Box>
  );
};

export default Posts;
