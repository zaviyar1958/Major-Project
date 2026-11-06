import { createSlice } from "@reduxjs/toolkit";

let savedUser = null;
try {
  const item = localStorage.getItem("user");
  if (item) savedUser = JSON.parse(item);
} catch (e) {
  console.error("Error parsing user from storage:", e);
}

const initialState = {
  user: savedUser,
  isAuthenticated: !!localStorage.getItem("access_token"),
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;