import { apiSlice } from "./apiSlice";

export const youtubeApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getLatestVideos: builder.query({
            query: () => ({
                url: `v1/youtube`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                keepUnusedDataFor: 60*60*24,
            }),
        })
    })
})
export const {
    useGetLatestVideosQuery
} = youtubeApiSlice;