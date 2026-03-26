const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validate, noteSchema, emailSchema } = require('../utils/validate');
const {
  createNote, getNotes, getNote, updateNote, deleteNote,
  addCollaborator, getCollaborators, removeCollaborator,
  getVersions, restoreVersion,
  getPendingInvitations, acceptInvitation, declineInvitation
} = require('../controllers/notes');

router.get('/invitations/pending', auth, getPendingInvitations);
router.post('/invitations/:invitationId/accept', auth, acceptInvitation);
router.post('/invitations/:invitationId/decline', auth, declineInvitation);

router.get('/', auth, getNotes);
router.get('/:id', auth, getNote);
router.post('/', auth, validate(noteSchema), createNote);
router.patch('/:id', auth, validate(noteSchema), updateNote);
router.delete('/:id', auth, deleteNote);

router.post('/:id/collaborators', auth, validate(emailSchema), addCollaborator);
router.get('/:id/collaborators', auth, getCollaborators);
router.delete('/:id/collaborators/:userId', auth, removeCollaborator);

router.get('/:id/versions', auth, getVersions);
router.post('/:id/versions/:vid/restore', auth, restoreVersion);

module.exports = router;
