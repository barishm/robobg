import { apiSlice } from "./apiSlice";

export const linkApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createLink: builder.mutation({
            query: ({json,accessToken}) => ({
                url: 'v1/moderator/links',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: json,
            }),
            invalidatesTags: ['Robot'],
        }),
        deleteLink: builder.mutation({
            query: ({id,accessToken}) => ({
                url: `v1/moderator/links/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['Robot'],
        }),
    })
})

export const {
    useCreateLinkMutation,
    useDeleteLinkMutation,
} = linkApiSlice;