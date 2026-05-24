import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/authenticate',
                method: 'POST',
                body: { ...credentials },
            }),
        }),
        reauth: builder.mutation({
            query: (refreshToken) => ({
                url: '/auth/refresh-token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + refreshToken,
                  },
            }), 
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: {...credentials},
            }),
        }),
        forgotPassword: builder.mutation({
            query: (credentials) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: {...credentials},
            }),
        }),
        resetPassword: builder.mutation({
            query: (credentials) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: {...credentials},
            }),
        }),
    })
})

export const {useLoginMutation,useReauthMutation,useRegisterMutation,useForgotPasswordMutation,useResetPasswordMutation} = authApiSlice;