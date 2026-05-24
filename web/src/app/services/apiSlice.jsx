import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const apiSlice = createApi({
    // baseQuery: fetchBaseQuery({baseUrl:"http://localhost:8080/"}),
    // baseQuery: fetchBaseQuery({baseUrl:"https://api.robobg.com/"}),
    // baseQuery: fetchBaseQuery({baseUrl:"https://api.barishm.com/"}),
    baseQuery: fetchBaseQuery({baseUrl:"http://api.localhost/"}),
    endpoints: () => ({})
})