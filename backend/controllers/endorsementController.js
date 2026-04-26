import Endorsement from '../models/Endorsement.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

/**
 * Submit an endorsement for a user's skill after a session
 * POST /api/endorsements
 */
export const submitEndorsement = async (req, res) => {
  try {
    const { endorseeId, skill, sessionId, message } = req.body;
    const endorserId = req.user.id;

    // Validate input
    if (!endorseeId || !skill || !sessionId) {
      return res.status(400).json({ success: false, error: 'endorseeId, skill, and sessionId are required' });
    }

    // Ensure endorser is not endorsing themselves
    if (endorserId === endorseeId) {
      return res.status(400).json({ success: false, error: 'Cannot endorse yourself' });
    }

    // Verify that the session exists and both users were part of it
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Check if endorser and endorsee were in the same session
    const endorserInSession = [session.helperId.toString(), session.requesterId.toString()].includes(endorserId);
    const endorseeInSession = [session.helperId.toString(), session.requesterId.toString()].includes(endorseeId);

    if (!endorserInSession || !endorseeInSession) {
      return res.status(403).json({ success: false, error: 'Both users must have been in the same session' });
    }

    // Check if endorsement already exists (unique constraint)
    const existingEndorsement = await Endorsement.findOne({
      endorserId,
      endorseeId,
      skill,
      sessionId,
    });

    if (existingEndorsement) {
      return res.status(409).json({ success: false, error: 'You have already endorsed this skill for this user in this session' });
    }

    // Create endorsement
    const endorsement = new Endorsement({
      endorserId,
      endorseeId,
      skill,
      sessionId,
      message: message || '',
    });

    await endorsement.save();
    await endorsement.populate(['endorserId', 'endorseeId', 'sessionId']);

    res.status(201).json({
      success: true,
      data: endorsement,
      message: 'Endorsement submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting endorsement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all endorsements for a user
 * GET /api/endorsements/:userId
 */
export const getEndorsements = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get all endorsements received by this user, grouped by skill
    const endorsements = await Endorsement.find({ endorseeId: userId })
      .populate('endorserId', 'fullName studentId email profilePic')
      .populate('endorseeId', 'fullName studentId')
      .populate('sessionId', '_id')
      .sort({ createdAt: -1 });

    // Group by skill
    const bySkill = {};
    endorsements.forEach(e => {
      if (!bySkill[e.skill]) {
        bySkill[e.skill] = [];
      }
      bySkill[e.skill].push(e);
    });

    res.status(200).json({
      success: true,
      data: {
        total: endorsements.length,
        bySkill,
        all: endorsements,
      },
    });
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get endorsements for a specific skill
 * GET /api/endorsements/:userId/skill/:skill
 */
export const getEndorsementsBySkill = async (req, res) => {
  try {
    const { userId, skill } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get endorsements for this skill
    const endorsements = await Endorsement.find({
      endorseeId: userId,
      skill: skill.toLowerCase(),
    })
      .populate('endorserId', 'fullName studentId email profilePic')
      .populate('endorseeId', 'fullName studentId')
      .populate('sessionId', '_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        skill,
        count: endorsements.length,
        endorsements,
      },
    });
  } catch (error) {
    console.error('Error fetching skill endorsements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get endorsement count summary for a user (skills and counts)
 * GET /api/endorsements/:userId/summary
 */
export const getEndorsementSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Aggregate endorsement counts by skill
    const summary = await Endorsement.aggregate([
      { $match: { endorseeId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalEndorsements = summary.reduce((sum, s) => sum + s.count, 0);

    res.status(200).json({
      success: true,
      data: {
        total: totalEndorsements,
        bySkill: summary,
      },
    });
  } catch (error) {
    console.error('Error fetching endorsement summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
