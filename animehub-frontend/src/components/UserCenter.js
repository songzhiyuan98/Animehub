import React, { useState } from "react";
import { Tabs, Tab, Box, Badge } from "@mui/material";
import PersonalInfo from "./UserCenter/PersonalInfo";
import Messages from "./UserCenter/Messages";
import MyPosts from "./UserCenter/MyPosts";
import { useSelector } from "react-redux"; // 引入 useSelector 钩子
import AnimeLiked from "./UserCenter/AnimeLiked";
import PostLiked from "./UserCenter/PostLiked";
import MyComment from "./UserCenter/MyComment";
import Setting from "./UserCenter/Setting";

const UserCenter = () => {
  const [selectedTab, setSelectedTab] = useState(0); //状态变量表示被选中tab的索引
  const unreadCount = useSelector((state) => state.notifications.unreadCount); // 获取未读消息数量

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
          width: "8%", // 使用百分比宽度，让侧边栏自适应布局
          minWidth: "8%", // 设置一个最小宽度，以避免在非常小的屏幕上侧边栏过窄
          height: "100vh",
          backgroundColor: "#F2F2F2",
        }}
      >
        <Tab label="个人资料" />
        <Tab
          label={
            <Badge
              variant="dot"
              color="error"
              invisible={unreadCount === 0} // 如果没有未读消息，小红点不可见
              sx={{
                "& .MuiBadge-dot": {
                  width: 8,
                  height: 8,
                  transform: "translate(120%, -80%)", // 将小红点稍微移动到右上角
                },
              }}
            >
              消息中心
            </Badge>
          }
        />
        <Tab label="动漫收藏" />
        <Tab label="我的帖子" />
        <Tab label="收藏帖子" />
        <Tab label="我的评论" />
        <Tab label="设置" />
      </Tabs>
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#F2F2F2",
        }}
      >
        {selectedTab === 0 && <PersonalInfo />}
        {selectedTab === 1 && <Messages />}
        {selectedTab === 2 && <AnimeLiked />}
        {selectedTab === 3 && <MyPosts />}
        {selectedTab === 4 && <PostLiked />}
        {selectedTab === 5 && <MyComment />}
        {selectedTab === 6 && <Setting />}
      </Box>
    </Box>
  );
};

export default UserCenter;
