//src/redux/actions/userActions.js

//login action用于用户登录，payload包含用户信息
export const login = (user) => {
    localStorage.setItem('username', user.username);
    return {
        type: 'LOGIN',
        payload: 'user',
    };
};

//logout action用于用户登出
export const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');    
    return {
        type: 'LOGOUT',
    };
};