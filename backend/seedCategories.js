require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const connectDB = require('./src/config/database');

const categories = [
    {
        name: 'T-Shirts',
        icon: '👕',
        description: 'Casual tops and t-shirts for everyday wear',
        type: 'clothing',
        isTryOnEnabled: true,
        attributes: [
            { key: 'size', label: 'Size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            { key: 'material', label: 'Material', type: 'text', required: true },
            { key: 'fit', label: 'Fit', type: 'select', required: false, options: ['Slim', 'Regular', 'Oversized'] },
            { key: 'neckline', label: 'Neckline', type: 'select', required: false, options: ['Round', 'V-Neck', 'Polo'] }
        ]
    },
    {
        name: 'Dresses',
        icon: '👗',
        description: 'Dresses for all occasions',
        type: 'clothing',
        isTryOnEnabled: true,
        attributes: [
            { key: 'size', label: 'Size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL'] },
            { key: 'length', label: 'Length', type: 'select', required: true, options: ['Mini', 'Midi', 'Maxi'] },
            { key: 'occasion', label: 'Occasion', type: 'select', required: false, options: ['Casual', 'Party', 'Formal', 'Work'] },
            { key: 'sleeve_length', label: 'Sleeve Length', type: 'select', required: false, options: ['Sleeveless', 'Short', 'Long'] }
        ]
    },
    {
        name: 'Jackets & Coats',
        icon: '🧥',
        description: 'Outerwear, jackets, and coats',
        type: 'clothing',
        isTryOnEnabled: true,
        attributes: [
            { key: 'size', label: 'Size', type: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
            { key: 'style', label: 'Style', type: 'select', required: true, options: ['Bomber', 'Denim', 'Leather', 'Blazer', 'Puffer', 'Trench'] },
            { key: 'material', label: 'Material', type: 'text', required: true },
            { key: 'waterproof', label: 'Waterproof', type: 'boolean', required: false }
        ]
    }
];

async function seedCategories() {
    try {
        await connectDB();
        console.log('📦 Connected to MongoDB');

        console.log('🌱 Seeding Categories...');

        for (const catData of categories) {
            // Generate slug manually
            catData.slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            // Upsert (Update if exists, Insert if not) based on name
            const category = await Category.findOneAndUpdate(
                { name: catData.name },
                catData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`✅ Processed: ${category.name} (Try-On: ${category.isTryOnEnabled})`);
        }

        console.log('\n✨ Categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
