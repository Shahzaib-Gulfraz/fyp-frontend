const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} file - File path or base64 string
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with url and publicId
 */
const uploadImage = async (file, folder = 'wearvirtually') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file paths or base64 strings
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleImages = async (files, folder = 'wearvirtually') => {
    try {
        const uploadPromises = files.map(file => uploadImage(file, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        throw new Error(`Multiple upload failed: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array>} - Array of deletion results
 */
const deleteMultipleImages = async (publicIds) => {
    try {
        const deletePromises = publicIds.map(publicId => deleteImage(publicId));
        return await Promise.all(deletePromises);
    } catch (error) {
        throw new Error(`Multiple deletion failed: ${error.message}`);
    }
};

module.exports = {
    cloudinary,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteMultipleImages
};
