const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { validate, commentSchema } = require('../utils/validate');
const { getComments, addComment, resolveComment, deleteComment } = require('../controllers/comments');

router.get('/', auth, getComments);
router.post('/', auth, validate(commentSchema), addComment);
router.patch('/:cid', auth, resolveComment);
router.delete('/:cid', auth, deleteComment);

module.exports = router;
