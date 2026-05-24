import { apiSlice } from "./apiSlice";

export const qnaApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getQna: builder.query({
            query: (id) => ({
                url: `v1/robots/${id}/questions`,
                method: 'GET',
            }),
            providesTags: ['QnA'],
        }),
        answerQuestion: builder.mutation({
            query: ({answerBody, accessToken}) => ({
                url: 'v1/user/answers',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: answerBody,
            }),
            invalidatesTags: ['QnA'],
        }),
        askQuestion: builder.mutation({
            query: ({questionBody, accessToken}) => ({
                url: 'v1/user/questions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: questionBody,
            }),
            invalidatesTags: ['QnA'],
        }),
        deleteQuestion: builder.mutation({
            query: ({id,accessToken}) => ({
                url: `v1/user/questions/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['QnA'],
        }),
        deleteAnswer: builder.mutation({
            query: ({id,accessToken}) => ({
                url: `v1/user/answers/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            invalidatesTags: ['QnA'],
        }),
        latestQuestions: builder.query({
            query: (accessToken) => ({
                url: `v1/moderator/questions`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }),
            providesTags: ['QnA'],
        })
    })
})

export const {    useGetQnaQuery,
    useAnswerQuestionMutation,
    useAskQuestionMutation,
    useDeleteQuestionMutation,
    useDeleteAnswerMutation,
    useLatestQuestionsQuery,} = qnaApiSlice;