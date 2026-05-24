import { apiSlice } from "./apiSlice";

export const mostComparesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllMostCompares: builder.query({
            query: () => ({
                url: `v1/most-compared`,
                method: 'GET',
            }),
            providesTags: ['MostCompares'],
        }),
        updateMostCompares: builder.mutation({
            query: ({jsonBody, accessToken}) => ({
                url:`v1/moderator/most-compared`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: jsonBody,
            }),
            invalidatesTags: ['MostCompares'],
        }),
        createMostCompares: builder.mutation({
            query: ({jsonBody, accessToken}) => ({
                url:`v1/moderator/most-compared`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: jsonBody,
            }),
            invalidatesTags: ['MostCompares'],
        }),
        deleteMostCompares: builder.mutation({
            query: ({id, accessToken}) => ({
                url:`v1/moderator/most-compared/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }),
            invalidatesTags: ['MostCompares'],
        }),
        
    })

})
export const {
   useGetAllMostComparesQuery,
   useUpdateMostComparesMutation,
   useCreateMostComparesMutation,
   useDeleteMostComparesMutation,
} = mostComparesApiSlice;