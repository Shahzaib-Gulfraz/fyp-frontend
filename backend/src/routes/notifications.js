const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protectAny } = require('../middleware/auth');

router.use(protectAny); // Allow both User and Shop

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
