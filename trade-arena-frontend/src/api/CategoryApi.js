import client from './client'

export const categoryApi = {

    getAllCategories: async () => {
        const res = await client.get('/admin/category')
        return res.data
    },

    getSubCategories: async (parentCategoryId) => {
        const res = await client.get(`/admin/subcategories/${parentCategoryId}`)
        return res.data
    },

    getQuestionsBySubCategory: async (subCategoryId) => {
        const res = await client.get(`/admin/subcategoryquestions/${subCategoryId}`)
        return res.data
    },

    saveCategoryConfig: async (payload) => {
        const res = await client.post('/admin/savecategoryconfig', payload)
        return res.data
    },
}