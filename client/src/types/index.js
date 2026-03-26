/**
 * @typedef {'primary' | 'gradient' | 'outline' | 'ghost' | 'danger'} ButtonVariant
 * @typedef {'xs' | 'sm' | 'md' | 'lg' | 'xl'} ButtonSize
 * @typedef {'xs' | 'sm' | 'md' | 'lg'} IconButtonSize
 * @typedef {'google' | 'github' | 'apple'} SocialProvider
 * @typedef {'xs' | 'sm' | 'md' | 'lg'} AvatarSize
 *
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 *
 * @typedef {Object} Note
 * @property {number} id
 * @property {string} title
 * @property {string} content
 * @property {number} user_id
 * @property {string} role
 * @property {boolean} [isCollaborator]
 * @property {string} updated_at
 * @property {string} created_at
 *
 * @typedef {Object} Comment
 * @property {number} id
 * @property {string} content
 * @property {number} user_id
 * @property {string} user_name
 * @property {boolean} resolved
 * @property {string} created_at
 *
 * @typedef {Object} NoteUser
 * @property {number} userId
 * @property {string} name
 *
 * @typedef {Object} Version
 * @property {number} id
 * @property {string} title
 * @property {string} content
 * @property {string} saved_by_name
 * @property {string} created_at
 */

export {}
