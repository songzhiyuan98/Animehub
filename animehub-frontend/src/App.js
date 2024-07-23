import React, { useEffect } from 'react'; //用于创建react组件
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; //创建路由容器，定义路由和导航行为
import Navbar from './components/Navbar';
import Home from './components/Home';
import Index from './components/Index';
import Posts from './components/Posts';
import Login from './components/Login';
import Register from './components/Register'; 
import UserCenter from './components/UserCenter';
import PrivateRoute from './components/PrivateRoute';
import { useDispatch } from 'react-redux';
import { login } from './redux/actions/userActions'; // 导入 login action



const App = () => {
  const dispatch = useDispatch(); 

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');

    if (accessToken && username){
      dispatch(login({ username }));
    }
  }, [dispatch]);

  return(
    <Router>
      <Navbar />
      <Routes>
        <Route exact path = "/" element = {<Home />} />
        <Route path="/index" element={<Index />} />
        <Route path = "/posts" element = {<Posts />} />
        <Route path = "/login" element = {<Login />} />
        <Route path = "/register" element = {<Register />} />
        <Route 
          path = "/user-center"
          element = {
            <PrivateRoute component = {UserCenter} />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;