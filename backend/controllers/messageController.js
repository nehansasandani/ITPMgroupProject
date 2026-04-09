import Message from "../models/Message.js";
import Session from "../models/Session.js";

// Validate that the caller is a session participant
async function requireParticipant(sessionId, userId) {
  const session = await Session.findById(sessionId).lean();
  if (!session) return { err: 404, msg: "Session not found" };
  const isParticipant =
    String(session.poster) === String(userId) ||
    String(session.helper) === String(userId);
  if (!isParticipant) return { err: 403, msg: "Access denied" };
  return { session };
}

// GET /api/messages/:sessionId
export const getMessages = async (req, res) => {
  try {
    const { err, msg } = await requireParticipant(req.params.sessionId, req.user.id);
    if (err) return res.status(err).json({ message: msg });

    const messages = await Message.find({ session: req.params.sessionId })
      .populate("sender", "fullName studentId")
      .sort({ createdAt: 1 })
      .lean();

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages/:sessionId
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }
    if (content.trim().length > 1000) {
      return res.status(400).json({ message: "Message too long (max 1000 characters)" });
    }

    const { err, msg, session } = await requireParticipant(
      req.params.sessionId,
      req.user.id
    );
    if (err) return res.status(err).json({ message: msg });

    if (session.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Cannot send messages to a completed session" });
    }

    const message = await Message.create({
      session: req.params.sessionId,
      sender: req.user.id,
      content: content.trim(),
    });

    const populated = await message.populate("sender", "fullName studentId");

    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
