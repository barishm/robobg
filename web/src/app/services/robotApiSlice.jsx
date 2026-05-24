import { apiSlice } from "./apiSlice";

export const robotApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllRobots: builder.query({
            query: () => ({
                url: `v1/robots`,
                method: 'GET'
            }),
            providesTags: ['Robot'],
        }),
        getRobotById: builder.query({
            query: ({id,queryParams}) => ({
                url: `v1/robots/${id}`,
                method: 'GET',
                params: {...queryParams}
            }),
            providesTags: ['Robot'],
        }),
        createRobot: builder.mutation({
            query: ({robotBody, accessToken}) => ({
                url: 'v1/moderator/robots',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: robotBody,
            }),
            invalidatesTags: ['Robot'],
        }),
        deleteRobot: builder.mutation({
            query: ({id,accessToken}) => ({
                url: `v1/moderator/robots/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['Robot'],
        }),
        updateRobot: builder.mutation({
            query: ({robotBody, accessToken}) => ({
                url: 'v1/moderator/robots',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: robotBody,
            }),
            invalidatesTags: ['Robot'],
        }),
        uploadRobotImage: builder.mutation({
            query: ({id,accessToken,formData}) => ({
                url: `v1/moderator/robots/${id}/image`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData,
                formData:true
            }),
            invalidatesTags: ['Robot'],
        }),
    })
})
export const {
    useGetAllRobotsQuery,
    useGetRobotByIdQuery,
    useLazyGetRobotByIdQuery,
    useCreateRobotMutation,
    useDeleteRobotMutation,
    useUpdateRobotMutation,
    useUploadRobotImageMutation
} = robotApiSlice;