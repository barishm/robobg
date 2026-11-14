import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllUsers: builder.query({
            query: (accessToken) => ({
                url: `v1/moderator/users`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            providesTags: ['User'],
        }),
        updateUser: builder.mutation({
            query: ({Userbody, accessToken}) => ({
                url:`v1/admin/users`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: Userbody,
            }),
            invalidatesTags: ['User'],
        }),
        getAllModerators: builder.query({
            query: (accessToken) => ({
                url: "v1/admin/moderators",
                method:"GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            providesTags: ['User'],
        }),
        getCurrentUser: builder.query({
            query: (accessToken) => ({
                url: "v1/user/me",
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            providesTags: ['CurrentUser'],
        }),
        uploadProfilePicture: builder.mutation({
            query: ({accessToken, formData}) => ({
                url: "v1/user/profile-picture",
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData,
                formData:true
            }),
            // Offers show their author's current picture
            invalidatesTags: ['CurrentUser', 'Offer'],
        }),
        deleteProfilePicture: builder.mutation({
            query: (accessToken) => ({
                url: "v1/user/profile-picture",
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['CurrentUser', 'Offer'],
        })
    })
})
export const {
    useGetAllUsersQuery,
    useUpdateUserMutation,
    useGetAllModeratorsQuery,
    useGetCurrentUserQuery,
    useUploadProfilePictureMutation,
    useDeleteProfilePictureMutation
} = userApiSlice;