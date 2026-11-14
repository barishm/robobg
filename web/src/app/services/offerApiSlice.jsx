import { apiSlice } from "./apiSlice";

export const offerApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllOffers: builder.query({
            query: () => ({
                url: `v1/offers`,
                method: 'GET'
            }),
            providesTags: ['Offer'],
        }),
        createOffer: builder.mutation({
            query: ({accessToken, formData}) => ({
                url: `v1/moderator/offers`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData,
                formData:true
            }),
            invalidatesTags: ['Offer'],
        }),
        updateOffer: builder.mutation({
            query: ({id, accessToken, formData}) => ({
                url: `v1/moderator/offers/${id}`,
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData,
                formData:true
            }),
            invalidatesTags: ['Offer'],
        }),
        deleteOffer: builder.mutation({
            query: ({id, accessToken}) => ({
                url: `v1/moderator/offers/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['Offer'],
        }),
    })
})

export const {
    useGetAllOffersQuery,
    useCreateOfferMutation,
    useUpdateOfferMutation,
    useDeleteOfferMutation
} = offerApiSlice;
