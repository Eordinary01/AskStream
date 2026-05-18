// routes/discussions.js
const express = require('express');
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');

const router = express.Router();

// ─── Get discussions ──────────────────────────────────────────────────────────
router.get('/:orgId/discussions', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId)
      .populate('discussions.author', '_id username')
      .populate('discussions.replies.author', '_id username');
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    // Members only see discussions started by the owner (creator starts, users join)
    const isOwner = org.owner.toString() === req.user.id;
    const filtered = isOwner
      ? org.discussions
      : org.discussions.filter(d => {
          const authorId = d.author?._id?.toString() ?? d.author?.toString();
          return authorId === org.owner.toString();
        });

    res.json(filtered);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Create discussion ────────────────────────────────────────────────────────
// Only the org owner can start a discussion (members reply, not start)
router.post('/:orgId/discussions', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    // Only owner can create new discussions
    if (org.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the organization owner can start discussions' });
    }

    const { title, content, tags, allowReplies } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    org.discussions.push({
      title: title.trim(),
      content: content.trim(),
      tags: (tags || []).filter(Boolean),
      author: req.user.id,
      allowReplies: allowReplies !== false,
      likes: [],
      replies: [],
    });

    await org.save();

    const populated = await Organization.populate(org, [
      { path: 'discussions.author', select: '_id username' },
    ]);

    res.json(populated.discussions[populated.discussions.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Add reply ────────────────────────────────────────────────────────────────
router.post('/:orgId/discussions/:discussionId/replies', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    // Must be a member or owner
    const isMember = org.members.map(m => m.toString()).includes(req.user.id);
    const isOwner  = org.owner.toString() === req.user.id;
    if (!isMember && !isOwner) return res.status(403).json({ msg: 'You must be a member to reply' });

    const discussion = org.discussions.id(req.params.discussionId);
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' });

    if (!discussion.allowReplies) {
      return res.status(403).json({ msg: 'Replies are disabled for this discussion' });
    }

    // ── cooldown enforcement ──────────────────────────────────────────────────
    if (!isOwner && org.cooldownTime > 0) {
      const userReplies = discussion.replies
        .filter(r => r.author.toString() === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (userReplies.length > 0) {
        const lastReplyAt = new Date(userReplies[0].createdAt);
        const msSinceLast = Date.now() - lastReplyAt.getTime();
        if (msSinceLast < org.cooldownTime) {
          const waitSecs = Math.ceil((org.cooldownTime - msSinceLast) / 1000);
          return res.status(429).json({ msg: `Please wait ${waitSecs}s before replying again`, waitSecs });
        }
      }
    }

    // ── oneQuestionPerUser: maps to "one reply per discussion per user" ───────
    if (!isOwner && org.oneQuestionPerUser) {
      const alreadyReplied = discussion.replies.some(r => r.author.toString() === req.user.id);
      if (alreadyReplied) {
        return res.status(400).json({ msg: 'You can only reply once per discussion' });
      }
    }

    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ msg: 'Reply cannot be empty' });

    discussion.replies.push({ content: content.trim(), author: req.user.id, createdAt: new Date() });
    await org.save();

    const populated = await Organization.populate(org, { path: 'discussions.replies.author', select: '_id username' });
    const updatedDisc = populated.discussions.id(req.params.discussionId);
    res.json(updatedDisc.replies[updatedDisc.replies.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Like / unlike discussion ─────────────────────────────────────────────────
router.post('/:orgId/discussions/:discussionId/like', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const discussion = org.discussions.id(req.params.discussionId);
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' });

    const idx = discussion.likes.map(l => l.toString()).indexOf(req.user.id);
    if (idx === -1) discussion.likes.push(req.user.id);
    else discussion.likes.splice(idx, 1);

    await org.save();
    res.json({ likes: discussion.likes.length, liked: idx === -1 });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;