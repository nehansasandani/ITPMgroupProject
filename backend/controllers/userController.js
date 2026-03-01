const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get any user profile by ID (for other modules)
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update profile (name, skills, availability, etc.)
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'skills', 'availability'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/me/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters with uppercase, lowercase, number, and special character.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add a skill
// @route   POST /api/users/me/skills
// @access  Private
exports.addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ success: false, message: 'Skill is required.' });

    const user = await User.findById(req.user._id);
    if (user.skills.includes(skill)) {
      return res.status(409).json({ success: false, message: 'Skill already exists.' });
    }

    user.skills.push(skill);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Skill added.', skills: user.skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove a skill
// @route   DELETE /api/users/me/skills/:skill
// @access  Private
exports.removeSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skills = user.skills.filter((s) => s !== req.params.skill);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Skill removed.', skills: user.skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Integration endpoints for other modules ──────────────────────────────────

// @desc    Update reputation/points/badges (Module 3 - Gamification)
// @route   PUT /api/users/:id/reputation
// @access  Private (internal / admin)
exports.updateReputation = async (req, res) => {
  try {
    const { points, badge, achievement, completedTask } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (points) user.reputation.points += points;
    if (badge) user.reputation.badges.push(badge);
    if (achievement) user.reputation.achievements.push(achievement);
    if (completedTask) user.reputation.completedTasks += 1;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Reputation updated.', reputation: user.reputation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Suspend / restore user (Module 4 - Dispute & Admin)
// @route   PUT /api/users/:id/status
// @access  Private (admin/mentor)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const allowed = ['active', 'suspended', 'banned'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, suspensionReason: reason || null },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: `User status set to ${status}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};