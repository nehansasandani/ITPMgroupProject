const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ─── Auth routes ──────────────────────────────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', protect, authController.logout);

// ─── Profile routes ───────────────────────────────────────────────────────────
router.get('/users/me', protect, userController.getMe);
router.put('/users/me', protect, userController.updateProfile);
router.put('/users/me/password', protect, userController.changePassword);

// Skills management
router.post('/users/me/skills', protect, userController.addSkill);
router.delete('/users/me/skills/:skill', protect, userController.removeSkill);

// Get any user (used by other modules)
router.get('/users/:id', protect, userController.getUserById);

// ─── Integration routes (used by other modules) ───────────────────────────────
// Module 3 - Gamification: update reputation
router.put('/users/:id/reputation', protect, userController.updateReputation);

// Module 4 - Admin/Dispute: suspend or restore user
router.put('/users/:id/status', protect, restrictTo('mentor'), userController.updateUserStatus);

module.exports = router;