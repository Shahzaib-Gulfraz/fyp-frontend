import api from './config';

const categoryService = {
    getAllCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCategory: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const formData = new FormData();
            formData.append('name', categoryData.name);
            if (categoryData.description) formData.append('description', categoryData.description);
            if (categoryData.image) {
                formData.append('image', {
                    uri: categoryData.image,
                    type: 'image/jpeg',
                    name: 'category.jpg',
                });
            }
            const response = await api.post('/categories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const formData = new FormData();
            if (categoryData.name) formData.append('name', categoryData.name);
            if (categoryData.description) formData.append('description', categoryData.description);
            if (categoryData.image) {
                formData.append('image', {
                    uri: categoryData.image,
                    type: 'image/jpeg',
                    name: 'category.jpg',
                });
            }
            const response = await api.put(`/categories/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default categoryService;
