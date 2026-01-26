const Replicate = require('replicate');
const TryOn = require('../models/TryOn');
const { validationResult } = require('express-validator');

// Initialize Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * @desc    Generate Virtual Try-On
 * @route   POST /api/try-on/generate
 * @access  Private
 */
const generateTryOn = async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { garment_img, human_img, garmentId } = req.body;

        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({ message: 'Replicate API token not configured' });
        }

        const mongoose = require('mongoose');

        // ...

        // Create initial record
        let validGarmentId = null;
        if (garmentId && mongoose.isValidObjectId(garmentId)) {
            validGarmentId = garmentId;
        }

        const tryOnRecord = await TryOn.create({
            userId: req.user._id,
            garmentImage: garment_img,
            userImage: human_img,
            garmentId: validGarmentId,
            status: 'processing'
        });


        // Prepare input for Replicate
        // Note: The model expects specific parameter names
        const input = {
            garm_img: garment_img,
            human_img: human_img,
            garment_des: "clothing" // Add garment description as required by model
        };

        // Validate URLs before calling Replicate
        if (!garment_img || !garment_img.startsWith('http')) {
            throw new Error('Invalid garment image URL');
        }
        if (!human_img || !human_img.startsWith('http')) {
            throw new Error('Invalid human image URL');
        }

        console.log('Replicate Input:', JSON.stringify(input, null, 2));

        // Call Replicate API
        console.log('Starting Replicate generation...');
        const output = await replicate.run(
            "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
            { input }
        );

        console.log('Replicate output type:', typeof output);

        // Handle streaming response
        let resultUrl;
        if (output && typeof output[Symbol.asyncIterator] === 'function') {
            // It's an async iterable (stream of binary chunks)
            const chunks = [];
            for await (const chunk of output) {
                chunks.push(chunk);
            }

            console.log(`Received ${chunks.length} chunks`);

            // Concatenate all Uint8Array chunks into a single buffer
            const imageBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));

            console.log(`Total image size: ${imageBuffer.length} bytes`);

            // Convert to base64 data URI
            const base64Image = imageBuffer.toString('base64');
            const dataURI = `data:image/jpeg;base64,${base64Image}`;

            // Upload to Cloudinary
            const { uploadImage } = require('../config/cloudinary');
            const cloudinaryResult = await uploadImage(dataURI, 'products/try-on-results');
            resultUrl = cloudinaryResult.url;

            console.log('Uploaded to Cloudinary:', resultUrl);
        } else if (typeof output === 'string') {
            // Direct URL
            resultUrl = output;
        } else if (Array.isArray(output)) {
            // Array of URLs
            resultUrl = output[output.length - 1];
        } else {
            console.log('Unexpected output format:', output);
            resultUrl = output;
        }

        console.log('Final result URL:', resultUrl);

        // Update record with success
        tryOnRecord.status = 'completed';
        tryOnRecord.resultImage = resultUrl;
        await tryOnRecord.save();

        res.json({
            success: true,
            data: tryOnRecord,
            resultUrl: resultUrl
        });

    } catch (error) {
        console.error('Try-On Generation Error:', error);

        // Return 500 but try not to crash
        res.status(500).json({
            message: 'Failed to generate try-on',
            error: error.message
        });
    }
};

/**
 * @desc    Get User's Try-On History
 * @route   GET /api/try-on/history
 * @access  Private
 */
const getHistory = async (req, res) => {
    try {
        const history = await TryOn.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('garmentId', 'name price thumbnail');

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    generateTryOn,
    getHistory
};
