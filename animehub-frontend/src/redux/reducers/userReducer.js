//src/redux/reducers/userReducer.js

const initialState = {
  user: null,
  isLoggedIn: false,
  tokenExpired: false,
};

const userReducer = (state = initialState, action) => {
  console.log("Reducer received action:", action.type);
  switch (action.type) {
    case "LOGIN":
      console.log("Processing LOGIN action");
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
        tokenExpired: false, // Reset token expired state on login
      };
    case "LOGOUT":
      console.log("Processing LOGOUT action");
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        tokenExpired: false, // Reset token expired state on logout
      };
    case "UPDATE_USER":
      console.log("Processing UPDATE_USER action", action.payload);
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "SET_TOKEN_EXPIRED":
      console.log("Processing SET_TOKEN_EXPIRED action", action.payload);
      return {
        ...state,
        tokenExpired: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
