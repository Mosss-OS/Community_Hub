import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

// Enums
export const testimonyCategoryEnum = pgEnum('testimony_category', ['HEALING', 'PROVISION', 'RELATIONSHIPS', 'SALVATION', 'OTHER']);
export const prayerRequestCategoryEnum = pgEnum('prayer_request_category', ['HEALTH', 'FAMILY', 'PROVISION', 'SPIRITUAL', 'OTHER']);
export const ministryTypeEnum = pgEnum('ministry_type', ['WORSHIP', 'YOUTH', 'CHILDREN', 'PRAYER', 'BIBLE_STUDY', 'OUTREACH', 'OTHER']);
export const eventTypeEnum = pgEnum('event_type', ['SERVICE', 'STUDY', 'YOUTH', 'PRAYER', 'FELLOWSHIP', 'OTHER']);
export const baptismStatusEnum = pgEnum('baptism_status', ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED']);
export const announcementPriorityEnum = pgEnum('announcement_priority', ['LOW', 'MEDIUM', 'HIGH']);
export const weddingStatusEnum = pgEnum('wedding_status', ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export const funeralStatusEnum = pgEnum('funeral_status', ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);

// Testimonies
export const testimonies = pgTable('testimonies', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: testimonyCategoryEnum('category').default('OTHER'),
  authorId: uuid('author_id').references(() => users.id),
  isApproved: boolean('is_approved').default(false),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Prayer Wall
export const prayerRequests = pgTable('prayer_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: prayerRequestCategoryEnum('category').default('OTHER'),
  authorId: uuid('author_id').references(() => users.id),
  isAnonymous: boolean('is_anonymous').default(false),
  prayerCount: integer('prayer_count').default(0),
  isAnswered: boolean('is_answered').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ministry Teams
export const ministries = pgTable('ministries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: ministryTypeEnum('type').default('OTHER'),
  leaderId: uuid('leader_id').references(() => users.id),
  memberCount: integer('member_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Calendar Events (extending existing events)
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  time: text('time'),
  type: eventTypeEnum('type').default('OTHER'),
  location: text('location'),
  maxAttendees: integer('max_attendees'),
  currentAttendees: integer('current_attendees').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Baptisms
export const baptisms = pgTable('baptisms', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateName: text('candidate_name').notNull(),
  candidateEmail: text('candidate_email'),
  candidatePhone: text('candidate_phone'),
  preferredDate: timestamp('preferred_date'),
  serviceTime: text('service_time'),
  pastorId: uuid('pastor_id').references(() => users.id),
  status: baptismStatusEnum('status').default('PENDING'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Announcements
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  priority: announcementPriorityEnum('priority').default('MEDIUM'),
  isPinned: boolean('is_pinned').default(false),
  authorId: uuid('author_id').references(() => users.id),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Weddings
export const weddings = pgTable('weddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  groomName: text('groom_name').notNull(),
  brideName: text('bride_name').notNull(),
  groomPhone: text('groom_phone'),
  bridePhone: text('bride_phone'),
  weddingDate: timestamp('wedding_date').notNull(),
  serviceTime: text('service_time'),
  status: weddingStatusEnum('status').default('PENDING'),
  specialRequests: text('special_requests'),
  pastorId: uuid('pastor_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Funerals
export const funerals = pgTable('funerals', {
  id: uuid('id').primaryKey().defaultRandom(),
  deceasedName: text('deceased_name').notNull(),
  dateOfPassing: timestamp('date_of_passing'),
  serviceDate: timestamp('service_date'),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  specialRequests: text('special_requests'),
  status: funeralStatusEnum('status').default('PENDING'),
  pastorId: uuid('pastor_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notification Preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique(),
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(false),
  prayerAlerts: boolean('prayer_alerts').default(true),
  eventReminders: boolean('event_reminders').default(true),
  donationReceipts: boolean('donation_receipts').default(true),
  sermonNotifications: boolean('sermon_notifications').default(false),
  communityUpdates: boolean('community_updates').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sermon Clips
export const sermonClips = pgTable('sermon_clips', {
  id: uuid('id').primaryKey().defaultRandom(),
  sermonId: integer('sermon_id').references(() => sermons.id),
  title: text('title').notNull(),
  startTime: integer('start_time').notNull(), // in seconds
  endTime: integer('end_time').notNull(), // in seconds
  clipUrl: text('clip_url'),
  createdById: uuid('created_by_id').references(() => users.id),
  shareCount: integer('share_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Streaming Configurations
export const streamingConfigs = pgTable('streaming_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(), // 'youtube', 'facebook', 'tiktok'
  streamKey: text('stream_key'),
  rtmpUrl: text('rtmp_url'),
  isEnabled: boolean('is_enabled').default(false),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const testimoniesRelations = relations(testimonies, ({ one }) => ({
  author: one(users, { fields: [testimonies.authorId], references: [users.id] }),
}));

export const prayerRequestsRelations = relations(prayerRequests, ({ one }) => ({
  author: one(users, { fields: [prayerRequests.authorId], references: [users.id] }),
}));

export const ministriesRelations = relations(ministries, ({ one }) => ({
  leader: one(users, { fields: [ministries.leaderId], references: [users.id] }),
}));

export const baptismsRelations = relations(baptisms, ({ one }) => ({
  pastor: one(users, { fields: [baptisms.pastorId], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
}));

export const weddingsRelations = relations(weddings, ({ one }) => ({
  pastor: one(users, { fields: [weddings.pastorId], references: [users.id] }),
}));

export const funeralsRelations = relations(funerals, ({ one }) => ({
  pastor: one(users, { fields: [funerals.pastorId], references: [users.id] }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

export const sermonClipsRelations = relations(sermonClips, ({ one }) => ({
  sermon: one(sermons, { fields: [sermonClips.sermonId], references: [sermons.id] }),
  createdBy: one(users, { fields: [sermonClips.createdById], references: [users.id] }),
}));

export const streamingConfigsRelations = relations(streamingConfigs, ({ one }) => ({
  createdBy: one(users, { fields: [streamingConfigs.createdById], references: [users.id] }),
}));

// Import users and sermons for relations
import { users } from './auth';
import { sermons } from './sermons';
