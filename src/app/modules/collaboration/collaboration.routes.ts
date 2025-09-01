import express from 'express';
import { CollaborationControllers } from './collaboration.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import {
  createStudyGroupSchema,
  updateStudyGroupSchema,
  getStudyGroupsSchema,
  getStudyGroupSchema,
  deleteStudyGroupSchema,
  joinGroupSchema,
  leaveGroupSchema,
  updateMemberRoleSchema,
  createNoteSchema,
  updateNoteSchema,
  getNotesSchema,
  getNoteSchema,
  deleteNoteSchema
} from './collaboration.validation';

const router = express.Router();

// Study Groups Routes
// Create a new study group
router.post(
  '/groups',
  auth(),
  validateRequest(createStudyGroupSchema),
  CollaborationControllers.createStudyGroup
);

// Get all study groups with optional filters
router.get(
  '/groups',
  auth(),
  validateRequest(getStudyGroupsSchema),
  CollaborationControllers.getStudyGroups
);

// Search study groups
router.get(
  '/groups/search',
  auth(),
  CollaborationControllers.searchGroups
);

// Get collaboration statistics
router.get(
  '/stats',
  auth(),
  CollaborationControllers.getCollaborationStats
);

// Get a specific study group by ID
router.get(
  '/groups/:id',
  auth(),
  validateRequest(getStudyGroupSchema),
  CollaborationControllers.getStudyGroupById
);

// Update a study group
router.patch(
  '/groups/:id',
  auth(),
  validateRequest(updateStudyGroupSchema),
  CollaborationControllers.updateStudyGroup
);

// Delete a study group
router.delete(
  '/groups/:id',
  auth(),
  validateRequest(deleteStudyGroupSchema),
  CollaborationControllers.deleteStudyGroup
);

// Join a study group
router.post(
  '/groups/:groupId/join',
  auth(),
  validateRequest(joinGroupSchema),
  CollaborationControllers.joinStudyGroup
);

// Leave a study group
router.post(
  '/groups/:groupId/leave',
  auth(),
  validateRequest(leaveGroupSchema),
  CollaborationControllers.leaveStudyGroup
);

// Update member role
router.patch(
  '/groups/:groupId/members/:memberId',
  auth(),
  validateRequest(updateMemberRoleSchema),
  CollaborationControllers.updateMemberRole
);

// Notes Routes
// Create a new note
router.post(
  '/notes',
  auth(),
  validateRequest(createNoteSchema),
  CollaborationControllers.createNote
);

// Get all notes with optional filters
router.get(
  '/notes',
  auth(),
  validateRequest(getNotesSchema),
  CollaborationControllers.getNotes
);

// Get popular tags
router.get(
  '/notes/tags/popular',
  auth(),
  CollaborationControllers.getPopularTags
);

// Get a specific note by ID
router.get(
  '/notes/:id',
  auth(),
  validateRequest(getNoteSchema),
  CollaborationControllers.getNoteById
);

// Update a note
router.patch(
  '/notes/:id',
  auth(),
  validateRequest(updateNoteSchema),
  CollaborationControllers.updateNote
);

// Delete a note
router.delete(
  '/notes/:id',
  auth(),
  validateRequest(deleteNoteSchema),
  CollaborationControllers.deleteNote
);

export const CollaborationRoutes = router;