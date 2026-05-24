import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        username: null, 
        accessToken: null,
        role: null,
    },
    reducers: {
        setCredentials: (state,action) => {
            const {user, accessToken,role} = action.payload;
            state.username = user;
            state.accessToken = accessToken;
            state.role = role;
        },
        logOut: (state) => {
            state.username = null
            state.accessToken = null
            state.role = null;
            localStorage.clear();
        }
    }
})

export const { setCredentials, logOut } = authSlice.actions
export default authSlice.reducer