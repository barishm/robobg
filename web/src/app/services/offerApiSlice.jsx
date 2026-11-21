import { apiSlice } from "./apiSlice";

export const offerApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getOffers: builder.query({
            // categories: offers with any of these hashtags (without "#")
            query: ({page = 0, size = 10, categories = []} = {}) => ({
                url: `v1/offers`,
                method: 'GET',
                params: {page, size, category: categories.length ? categories : undefined}
            }),
            providesTags: ['Offer'],
        }),
        getOfferCategories: builder.query({
            query: () => ({
                url: `v1/offers/categories`,
                method: 'GET'
            }),
            providesTags: ['Offer'],
        }),
        getOfferById: builder.query({
            query: ({id}) => ({
                url: `v1/offers/${id}`,
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
    useGetOffersQuery,
    useGetOfferByIdQuery,
    useGetOfferCategoriesQuery,
    useCreateOfferMutation,
    useUpdateOfferMutation,
    useDeleteOfferMutation
} = offerApiSlice;
