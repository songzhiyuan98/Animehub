import React, { useEffect, useState } from "react"; // 引入 useState 和 useEffect
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  Badge,
  MenuItem,
} from "@mui/material"; //materui组件
import MenuIcon from "@mui/icons-material/Menu"; //menu图标
import { Link } from "react-router-dom"; //react链接功能
import { useSelector, useDispatch } from "react-redux"; //redux选择器，派发
import { logout } from "../redux/actions/userActions"; //登出redux reducer
import { useTranslation } from "react-i18next";
import {
  clearNotifications,
  fetchUnreadCount,
} from "../redux/actions/notificationActions";

//定义用户菜单设置项
//const setting = ['用户中心', '登出'];

const Navbar = () => {
  const dispatch = useDispatch(); //获取redux dispatch函数
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); //从redux中用选择器函数获取登录状态
  const user = useSelector((state) => state.user.user); //从redux中获取用户信息，若不在登录状态，此函数默认返回null
  const unreadCount = useSelector((state) => state.notifications.unreadCount); // 获取未读消息数量
  const BASE_URL = "http://localhost:3000";

  const [anchorElNav, setAnchorElNar] = React.useState(null); //定义导航菜单锚点状态
  const [anchorElUser, setAnchorElUser] = React.useState(null); //定义用户菜单锚点状态
  const [avatarSrc, setAvatarSrc] = useState(""); // 状态管理头像
  const { t } = useTranslation(); // 使用useTranslation钩子获取翻译函数
  useEffect(() => {
    if (user && user.avatar) {
      setAvatarSrc(`${BASE_URL}${user.avatar}`);
    } else {
      setAvatarSrc("/path/to/default/avatar.png"); // 默认头像
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUnreadCount()); // 获取未读消息数量
    }
  }, [dispatch, isLoggedIn]);

  //定义导航栏页面
  const pages = [
    { name: t("home"), path: "/" },
    { name: t("anime"), path: "/index" },
    { name: t("community"), path: "/posts" },
  ];

  //打开导航菜单函数,接收一个event作为参数，是点击按钮的名称,pages的属性
  const handleOpenNavMenu = (event) => {
    setAnchorElNar(event.currentTarget);
  };

  //打开用户菜单函数
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  //关闭导航才喊函数
  const handleCloseNavMenu = () => {
    setAnchorElNar(null);
  };

  //关闭用户菜单函数
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  //登出函数
  const handleLogout = () => {
    dispatch(logout()); //执行登出操作
    dispatch(clearNotifications()); //清除通知缓存
    handleCloseUserMenu(); //关闭用户菜单栏
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#F2F2F2", boxShadow: "none" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/*桌面端导航栏左边logo显示*/}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "'Lobster', cursive",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "#333333",
              textDecoration: "none",
            }}
          >
            Animehub
          </Typography>
          {/*移动端导航菜单栏*/}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="#333333"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "buttom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Typography
                    textAlign="center"
                    component={Link}
                    to={page.path}
                  >
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/*移动端导航栏文字中间显示*/}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "#333333",
              textDecoration: "none",
            }}
          >
            Animehub
          </Typography>
          {/*桌面端导航栏中间部分链接按钮*/}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{
                  my: 2,
                  color: "black",
                  display: "block",
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          {/*导航栏最右边头像登录部分*/}
          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn && user ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Badge
                      badgeContent={unreadCount} // 显示未读消息数量
                      color="error"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                    >
                      <Avatar alt={user?.username} src={avatarSrc} />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    component={Link}
                    to="/user-center"
                    onClick={handleCloseUserMenu}
                  >
                    <Typography textAlign="center">
                      {t("userCenter")}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">{t("logout")}</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                sx={{ my: 2, color: "#333333", display: "block" }}
              >
                {t("login")}
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
