import { apiSlice } from "./apiSlice";

export const consumableSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createConsumable: builder.mutation({
            query: ({json,accessToken}) => ({
                url: 'v1/moderator/consumable',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: json,
            }),
            invalidatesTags: ['Consumable'],
        }),
        updateConsumable: builder.mutation({
            query: ({json,accessToken}) => ({
                url: 'v1/moderator/consumable',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: json,
            }),
            invalidatesTags: ['Consumable'],
        }),
        deleteConsumable: builder.mutation({
            query: ({id,accessToken}) => ({
                url: `v1/moderator/consumable/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['Consumable'],
        }),
        getAllConsumables: builder.query({
            query: () => ({
                url: `v1/consumable`,
                method: 'GET'
            }),
            providesTags: ['Consumable'],
        }),
        uploadConsumableImages: builder.mutation({
            query: ({id,accessToken,formData}) => ({
                url: `v1/moderator/consumable/${id}/images`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData,
                formData:true
            }),
            invalidatesTags: ['Consumable'],
        }),
        getConsumableById: builder.query({
            query: ({id,queryParams}) => ({
                url: `v1/consumable/${id}`,
                method: 'GET',
                params: {...queryParams}
            }),
            providesTags: ['Consumable'],
        }),
    })
})

export const {
    useCreateConsumableMutation,
    useUpdateConsumableMutation,
    useDeleteConsumableMutation,
    useGetAllConsumablesQuery,
    useGetConsumableByIdQuery,
    useUploadConsumableImagesMutation
} = consumableSlice;