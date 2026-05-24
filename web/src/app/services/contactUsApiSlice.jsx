import { apiSlice } from "./apiSlice";

export const contactUsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    contactUsForm: builder.mutation({
      query: (formData) => ({
        url: 'v1/contact-us',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formData,
      }),
      invalidatesTags: [''],
    }),
  }),
});

export const {
  useContactUsFormMutation,
} = contactUsApiSlice;