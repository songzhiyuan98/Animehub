import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Avatar,
  Box,
  Link,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; //edit图标
import { useSelector, useDispatch } from "react-redux"; //redux选择器
import { updateUser } from "../../redux/actions/userActions"; // 导入更新用户信息的 action
import axiosInstance from "../../utils/axiosInstance";

const PersonalInfo = () => {
  // Redux dispatch 和用户信息
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); //从redux中获取用户信息，若不在登录状态，此函数默认返回null

  const BASE_URL = "http://localhost:3000"; //定义访问本地资源请求地址头部

  //状态管理
  const [open, setOpen] = useState(false); //状态变量管理弹窗显示状态
  const [nickname, setNickname] = useState(user.nickname); //状态变量储存昵称输入框
  const [gender, setGender] = useState(user.gender); //状态变量储存性别输入框
  const [avatar, setAvatar] = useState(""); // 状态变量储存当前头像
  const [previewAvatar, setPreviewAvatar] = useState(null); //预览头像
  const [avatarFile, setAvatarFile] = useState(null); //状态变量处理头像上传

  // 保存原始数据的状态变量
  const [originalNickname, setOriginalNickname] = useState(user.nickname);
  const [originalGender, setOriginalGender] = useState(user.gender || "未知");
  const [originalAvatar, setOriginalAvatar] = useState(user.avatar);

  useEffect(() => {
    if (user && user.avatar) {
      setAvatar(`${BASE_URL}${user.avatar}`);
    } else {
      setAvatar("/path/to/default/avatar.png"); // 默认头像
    }
  }, [user]); //根据redux变化调用钩子更新状态

  //处理打开编辑弹窗函数
  const handleClickOpen = () => {
    setOpen(true);
    //打开编辑弹窗，更新所有状态变量
    setNickname(user.nickname);
    setGender(user.gender);
    setAvatar(`${BASE_URL}${user.avatar}`);
    setOriginalNickname(user.nickname);
    setOriginalGender(user.gender);
    setOriginalAvatar(`${BASE_URL}${user.avatar}`);
    setAvatarFile(null);
    setPreviewAvatar(null);
  };
  //处理取消编辑弹窗函数
  const handleClose = () => {
    setOpen(false);
    // 还原到原始值
    setNickname(originalNickname);
    setGender(originalGender);
    setAvatar(originalAvatar);
    setAvatarFile(null);
  };
  //处理头像更改以及上传
  const handleAvatarChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setAvatarFile(event.target.files[0]); //设置管理头像上传的状态变量为用户上传的图片文件
      setPreviewAvatar(URL.createObjectURL(event.target.files[0])); //为用户在本地临时创建一个url显示预览图片并储存在当前头像
    }
  };
  //处理确认保存编辑弹窗后函数
  const handleSave = async () => {
    //处理保存逻辑，向后端发送请求保存更改（待写）
    const formData = new FormData(); //新的formdata对象保存上传数据
    formData.append("nickname", nickname); //保存昵称状态变量到formdata
    formData.append("gender", gender); //保存性别状态变量到formdata
    if (avatarFile) {
      formData.append("avatar", avatarFile); //保存头像状态变量到formdata，如果avatarFile已经被上传头像更新了
    }

    //发送请求更新昵称，性别，头像
    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/api/updateUserProfile",
        formData
      ); //使用axiosInstance已经自动在请求头包含jwt令牌
      console.log("成功更新用户信息:", response.data);
      dispatch(updateUser(response.data)); // 更新 Redux 状态
      //处理后端更新成功后的逻辑，例如更新用户信息显示
    } catch (error) {
      console.error("更新用户信息失败:", error);
      //处理后端请求更新失败后的逻辑
    }
    handleClose(); //关闭编辑弹窗
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        个人中心
      </Typography>
      <Box
        sx={{
          border: "1px solid #ddd", //左边卡片，设置卡片的边框颜色和宽度
          backgroundColor: "#fff", //背景颜色白色fff
          borderRadius: "16px", //设置卡片圆角
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", //设置阴影
          height: "50vh", //设置高度为视角高度的一半
          padding: 2, //设置内边距
          mt: 3, //设置外边距
          display: "flex", //设置display为flex
        }}
      >
        {/* 左侧部分 */}
        <Box
          sx={{
            width: "50%", //设置宽度为父组件的50%
            padding: 2, //外边距为2
            display: "flex", //显示方式flex
            flexDirection: "column", //对齐方向垂直
            alignItems: "center", //对齐内部元素居中
            borderRight: "1px solid #ccc", //右边分界线
          }}
        >
          {/*内嵌卡片*/}
          <Box
            sx={{
              position: "relative",
              width: "90%",
              border: "1px solid #ddd",
              backgroundColor: "#F2F2F2",
              borderRadius: "16px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              padding: 3,
              mt: 5, //提高卡片位置，确保头像外露
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "-40px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Avatar
                alt={user.username}
                src={avatar}
                sx={{
                  width: 80,
                  height: 80,
                  border: "2px solid white",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                }}
              />
            </Box>
            <Typography variant="h6" gutterBottom align="center" sx={{ mt: 4 }}>
              基本信息
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              昵称: {user.nickname}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              用户名: {user.username}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              邮箱: {user.email}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              性别: {user.gender}
            </Typography>
            <IconButton
              sx={{ position: "absolute", right: 16, top: 16 }}
              onClick={handleClickOpen}
            >
              <EditIcon />
            </IconButton>
          </Box>
          {/* 其他个人信息 */}
        </Box>

        {/* 右侧部分 */}
        <Box sx={{ width: "50%", padding: 2 }}>
          <Box
            sx={{
              height: "50%", //右上角卡片，高度设为右边父组件的一半
              borderBottom: "1px solid #ccc", //底部分界线
              padding: 2, //外边距2
            }}
          >
            <Typography variant="h6" gutterBottom>
              兴趣爱好
            </Typography>
            {/* 兴趣爱好和自定义编辑内容 */}
            <Box>爱好: 阅读, 旅行, 运动</Box>
          </Box>
          <Box sx={{ height: "50%", padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              统计数据
            </Typography>
            {/* 统计数据展示 */}
            <Box>文章数量: 10</Box>
            <Box>评论数量: 50</Box>
            <Box>收藏数量: 20</Box>
          </Box>
        </Box>
      </Box>

      {/* 编辑弹窗 */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "500px",
            borderRadius: "16px",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
            padding: 3,
          },
        }}
      >
        <DialogTitle>编辑个人信息</DialogTitle>
        <DialogContent>
          {/* 头像预览和上传 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar
                alt="预览头像"
                src={previewAvatar || avatar} // 优先显示预览头像
                sx={{
                  width: 100,
                  height: 100,
                  border: "2px solid white",
                  cursor: "pointer",
                }}
                onClick={() =>
                  document.getElementById("avatar-upload-dialog").click()
                }
              />
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload-dialog"
                type="file"
                onChange={handleAvatarChange}
              />
              <IconButton
                component="span"
                sx={{
                  position: "absolute",
                  right: -10,
                  bottom: -10,
                  backgroundColor: "white",
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
          <TextField
            margin="dense"
            label="昵称"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="gender-label">性别</InputLabel>
            <Select
              id="gender-select"
              value={gender}
              label="性别"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="男">男</MenuItem>
              <MenuItem value="女">女</MenuItem>
              <MenuItem value="未知">未知</MenuItem>
            </Select>
          </FormControl>
          {/* 你可以在这里添加头像上传功能 */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonalInfo;
