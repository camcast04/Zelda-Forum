/**
 * @typedef {(string | number | boolean | null | { [key: string]: Json | undefined } | Json[])} Json
 */

/**
 * @typedef GetPostsResponse
 * @type {object}
 * @property {string} created_at
 * @property {string} id
 * @property {number} score
 * @property {string} title
 * @property {string} user_id
 * @property {string} username
 */

/**
 * @typedef GetSinglePostWithCommentResponse
 * @type {object}
 * @property {string} author_name
 * @property {string} content
 * @property {string} created_at
 * @property {string} id
 * @property {string} path
 * @property {number} score
 * @property {string} title
 */

/**
 * @typedef {Object} Database
 * @property {Object} graphql_public
 * @property {Object} graphql_public.Tables
 * @property {Object} graphql_public.Views
 * @property {Object} graphql_public.Functions
 * @property {Object} graphql_public.Enums
 * @property {Object} graphql_public.CompositeTypes
 * @property {Object} public
 * @property {Object} public.Tables
 * @property {UserProfileTable} public.Tables.user_profiles
 * @property {Object} public.Views
 * @property {Object} public.Functions
 * @property {Object} public.Enums
 * @property {Object} public.CompositeTypes
 * @property {Object} storage
 * @property {Object} storage.Tables
 * @property {BucketsTable} storage.Tables.buckets
 * @property {MigrationsTable} storage.Tables.migrations
 * @property {ObjectsTable} storage.Tables.objects
 * @property {Object} storage.Views
 * @property {Object} storage.Functions
 * @property {Object} storage.Enums
 * @property {Object} storage.CompositeTypes
 */

/**
 * @typedef {Object} UserProfileRow
 * @property {string} user_id
 * @property {string} username
 */

/**
 * @typedef {Object} UserProfileTable
 * @property {UserProfileRow} Row
 * @property {UserProfileRow} Insert
 * @property {UserProfileRow} Update
 * @property {Array} Relationships
 */

/**
 * @typedef {Object} BucketsRow
 * @property {Array<string> | null} allowed_mime_types
 * @property {boolean | null} avif_autodetection
 * @property {string | null} created_at
 * @property {number | null} file_size_limit
 * @property {string} id
 * @property {string} name
 * @property {string | null} owner
 * @property {boolean | null} public
 * @property {string | null} updated_at
 */

/**
 * @typedef {Object} BucketsTable
 * @property {BucketsRow} Row
 * @property {BucketsRow} Insert
 * @property {BucketsRow} Update
 * @property {Array} Relationships
 */

/**
 * @typedef {Object} MigrationsRow
 * @property {string | null} executed_at
 * @property {string} hash
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} MigrationsTable
 * @property {MigrationsRow} Row
 * @property {MigrationsRow} Insert
 * @property {MigrationsRow} Update
 * @property {Array} Relationships
 */

/**
 * @typedef {Object} ObjectsRow
 * @property {string | null} bucket_id
 * @property {string | null} created_at
 * @property {string} id
 * @property {string | null} last_accessed_at
 * @property {Json | null} metadata
 * @property {string | null} name
 * @property {string | null} owner
 * @property {Array<string> | null} path_tokens
 * @property {string | null} updated_at
 * @property {string | null} version
 */

/**
 * @typedef {Object} ObjectsTable
 * @property {ObjectsRow} Row
 * @property {ObjectsRow} Insert
 * @property {ObjectsRow} Update
 * @property {Array} Relationships
 */
