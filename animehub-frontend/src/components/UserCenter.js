import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import PersonalInfo from "./UserCenter/PersonalInfo";
import Messages from "./UserCenter/Messages";
import MyPosts from "./UserCenter/MyPosts";
import AnimeLiked from "./UserCenter/AnimeLiked";
import PostLiked from "./UserCenter/PostLiked";
import MyComment from "./UserCenter/MyComment";
import Setting from "./UserCenter/Setting";

const UserCenter = () => {
  const [selectedTab, setSelectedTab] = useState(0); //状态变量表示被选中tab的索引

  //处理tab点击事件
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue); //更新状态变量索引
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="Personal Center Tabs"
        sx={{
          borderRight: 1,
          borderColor: "divider",
          width: "100px",
          height: "100vh",
          backgroundColor: "#F2F2F2",
        }}
      >
        <Tab label="个人资料" />
        <Tab label="动漫收藏" />
        <Tab label="我的帖子" />
        <Tab label="收藏帖子" />
        <Tab label="我的评论" />
        <Tab label="消息" />
        <Tab label="设置" />
      </Tabs>
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#F2F2F2" }}>
        {selectedTab === 0 && <PersonalInfo />}
        {selectedTab === 1 && <AnimeLiked />}
        {selectedTab === 2 && <MyPosts />}
        {selectedTab === 3 && <PostLiked />}
        {selectedTab === 4 && <MyComment />}
        {selectedTab === 5 && <Messages />}
        {selectedTab === 6 && <Setting />}
      </Box>
    </Box>
  );
};

export default UserCenter;
