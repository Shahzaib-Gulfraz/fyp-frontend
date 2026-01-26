const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth'); // Assuming auth middleware exists

// All routes are protected
router.use(protect);

router.post('/', postController.createPost);
router.get('/feed', postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);
router.get('/:postId', postController.getPost);
router.delete('/:postId', postController.deletePost);

router.post('/:postId/like', postController.likePost);
router.post('/:postId/comment', postController.commentPost);
// router.delete('/:postId/comment/:commentId', postController.deleteComment); // To be implemented if needed

module.exports = router;
