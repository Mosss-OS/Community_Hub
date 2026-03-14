export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, uuid, date, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, organizations } from "./models/auth";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const branding = pgTable("branding", {
  id: serial("id").primaryKey(),
  colors: jsonb("colors").$type<{ primary: string; secondary: string; accent: string }>().default({ primary: "#000000", secondary: "#ffffff", accent: "#3b82f6" }),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  fonts: jsonb("fonts").$type<{ heading: string; body: string }>().default({ heading: "Inter", body: "Inter" }),
  churchName: text("church_name"),
  churchAddress: text("church_address"),
  churchCity: text("church_city"),
  churchState: text("church_state"),
  churchCountry: text("church_country"),
  churchZipCode: text("church_zip_code"),
  churchPhone: text("church_phone"),
  churchEmail: text("church_email"),
  churchLatitude: text("church_latitude"),
  churchLongitude: text("church_longitude"),
  serviceTimes: jsonb("service_times").$type<{ sunday: string; wednesday: string; friday: string }>().default({ sunday: "7:00 AM & 9:00 AM", wednesday: "6:00 PM", friday: "7:00 PM" }),
  youtubeUrl: text("youtube_url"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  creatorId: uuid("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: varchar("recurrence_rule", { length: 50 }),
  recurrenceEndDate: timestamp("recurrence_end_date"),
  category: varchar("category", { length: 100 }),
  tags: text("tags").array(),
  allowFeedback: boolean("allow_feedback").default(true),
  isVirtual: boolean("is_virtual").default(false),
  virtualLink: varchar("virtual_link", { length: 500 }),
  capacity: integer("capacity"),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  addedToCalendar: boolean("added_to_calendar").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  attended: boolean("attended").default(false),
  checkedInAt: timestamp("checked_in_at"),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const eventCategories = pgTable("event_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const eventFeedback = pgTable("event_feedback", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: uuid("user_id").references(() => users.id),
  rating: integer("rating"),
  comment: text("comment"),
  wouldRecommend: boolean("would_recommend"),
  createdAt: timestamp("created_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const sermons = pgTable("sermons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  speaker: text("speaker").notNull(),
  date: timestamp("date").notNull(),
  topic: text("topic"),
  videoUrl: text("video_url"),
  videoFilePath: text("video_file_path"),
  audioUrl: text("audio_url"),
  audioFilePath: text("audio_file_path"),
  series: text("series"),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  isUpcoming: boolean("is_upcoming").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const prayerRequests = pgTable("prayer_requests", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  authorName: text("author_name"),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isAnswered: boolean("is_answered").default(false),
  answeredAt: timestamp("answered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  prayCount: integer("pray_count").default(0),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  amount: integer("amount").notNull(), // In cents
  currency: text("currency").default("usd"),
  status: text("status").notNull(), // pending, succeeded, failed
  campaignId: integer("campaign_id").references(() => fundraisingCampaigns.id),
  createdAt: timestamp("created_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const fundraisingCampaigns = pgTable("fundraising_campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  goalAmount: integer("goal_amount").notNull(), // In cents
  currentAmount: integer("current_amount").default(0), // In cents
  imageUrl: text("image_url"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const dailyDevotionals = pgTable("daily_devotionals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author"),
  bibleVerse: text("bible_verse"),
  theme: text("theme"),
  imageUrl: text("image_url"),
  publishDate: timestamp("publish_date").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const bibleReadingPlans = pgTable("bible_reading_plans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // Days
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const bibleReadingProgress = pgTable("bible_reading_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => bibleReadingPlans.id).notNull(),
  dayNumber: integer("day_number").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

// === RELATIONS ===
export const prayerRequestsRelations = relations(prayerRequests, ({ one }) => ({
  user: one(users, {
    fields: [prayerRequests.userId],
    references: [users.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  campaign: one(fundraisingCampaigns, {
    fields: [donations.campaignId],
    references: [fundraisingCampaigns.id],
  }),
}));

export const fundraisingCampaignsRelations = relations(fundraisingCampaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [fundraisingCampaigns.createdBy],
    references: [users.id],
  }),
  donations: many(donations),
}));

export const dailyDevotionalsRelations = relations(dailyDevotionals, ({ one }) => ({
  creator: one(users, {
    fields: [dailyDevotionals.createdBy],
    references: [users.id],
  }),
}));

export const bibleReadingPlansRelations = relations(bibleReadingPlans, ({ one, many }) => ({
  creator: one(users, {
    fields: [bibleReadingPlans.createdBy],
    references: [users.id],
  }),
  progress: many(bibleReadingProgress),
}));

export const bibleReadingProgressRelations = relations(bibleReadingProgress, ({ one }) => ({
  user: one(users, {
    fields: [bibleReadingProgress.userId],
    references: [users.id],
  }),
  plan: one(bibleReadingPlans, {
    fields: [bibleReadingProgress.planId],
    references: [bibleReadingPlans.id],
  }),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

export const eventFeedbackRelations = relations(eventFeedback, ({ one }) => ({
  event: one(events, {
    fields: [eventFeedback.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventFeedback.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertBrandingSchema = createInsertSchema(branding).omit({ id: true });

// Custom event schema that accepts string dates and converts to Date
export const insertEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().min(1),
  imageUrl: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  allowFeedback: z.boolean().optional(),
  isVirtual: z.boolean().optional(),
  virtualLink: z.string().optional(),
  capacity: z.number().optional(),
}).transform(data => ({
  ...data,
  date: new Date(data.date),
  endDate: data.endDate ? new Date(data.endDate) : undefined,
  recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
}));

// Custom sermon schema that accepts string dates and converts to Date
export const insertSermonSchema = z.object({
  title: z.string().min(1),
  speaker: z.string().min(1),
  date: z.string().datetime(),
  topic: z.string().optional(),
  videoUrl: z.string().optional(),
  videoFilePath: z.string().optional(),
  audioUrl: z.string().optional(),
  audioFilePath: z.string().optional(),
  series: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isUpcoming: z.boolean().optional(),
}).transform(data => ({
  ...data,
  date: new Date(data.date),
}));

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({ id: true, createdAt: true, prayCount: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true, createdAt: true });
export const insertFundraisingCampaignSchema = createInsertSchema(fundraisingCampaigns).omit({ id: true, createdAt: true, currentAmount: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Branding = typeof branding.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Sermon = typeof sermons.$inferSelect;
export type PrayerRequest = typeof prayerRequests.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type FundraisingCampaign = typeof fundraisingCampaigns.$inferSelect;
export type DailyDevotional = typeof dailyDevotionals.$inferSelect;
export type BibleReadingPlan = typeof bibleReadingPlans.$inferSelect;
export type BibleReadingProgress = typeof bibleReadingProgress.$inferSelect;

export type InsertBranding = z.infer<typeof insertBrandingSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertSermon = z.infer<typeof insertSermonSchema>;
export type InsertPrayerRequest = z.infer<typeof insertPrayerRequestSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type InsertFundraisingCampaign = z.infer<typeof insertFundraisingCampaignSchema>;
export type InsertDailyDevotional = typeof dailyDevotionals.$inferInsert;
export type InsertBibleReadingPlan = typeof bibleReadingPlans.$inferInsert;
export type EventCategory = typeof eventCategories.$inferSelect;
export type EventFeedback = typeof eventFeedback.$inferSelect;
export type InsertEventFeedback = typeof eventFeedback.$inferInsert;

// Request types
export type CreateEventRequest = InsertEvent;
export type CreateSermonRequest = InsertSermon;
export type CreatePrayerRequestRequest = InsertPrayerRequest;
export type CreateDonationRequest = InsertDonation;
export type CreateFundraisingCampaignRequest = InsertFundraisingCampaign;

// === ATTENDANCE TABLES ===

export const serviceTypeEnum = pgEnum('service_type', [
  'SUNDAY_SERVICE',
  'MIDWEEK_SERVICE', 
  'SPECIAL_EVENT',
  'ONLINE_LIVE',
  'ONLINE_REPLAY'
]);

export const attendanceTypeEnum = pgEnum('attendance_type', [
  'SELF_CHECKIN',
  'MANUAL',
  'ONLINE_AUTO',
  'QR_CHECKIN'
]);

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  serviceType: serviceTypeEnum("service_type").notNull(),
  serviceId: integer("service_id"),
  serviceName: text("service_name").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  attendanceType: attendanceTypeEnum("attendance_type").notNull(),
  checkInTime: timestamp("check_in_time"),
  watchDuration: integer("watch_duration"),
  isOnline: boolean("is_online").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const attendanceLinks = pgTable("attendance_links", {
  id: serial("id").primaryKey(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  serviceId: integer("service_id"),
  serviceName: text("service_name").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  uniqueToken: text("unique_token").notNull().unique(),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const attendanceSettings = pgTable("attendance_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === ATTENDANCE RELATIONS ===
export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [attendance.createdBy],
    references: [users.id],
  }),
}));

export const attendanceLinksRelations = relations(attendanceLinks, ({ one }) => ({
  creator: one(users, {
    fields: [attendanceLinks.createdBy],
    references: [users.id],
  }),
}));

// === ATTENDANCE SCHEMAS ===
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertAttendanceLinkSchema = createInsertSchema(attendanceLinks).omit({ id: true });
export const insertAttendanceSettingsSchema = createInsertSchema(attendanceSettings).omit({ id: true });

// === MEMBER MESSAGES ===
export const messageTypeEnum = pgEnum('message_type', [
  'ABSENCE_ALERT',
  'GENERAL',
  'PASTORAL',
  'ANNOUNCEMENT'
]);

export const messagePriorityEnum = pgEnum('message_priority', [
  'high',
  'normal',
  'low'
]);

export const memberMessages = pgTable("member_messages", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  type: messageTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  priority: messagePriorityEnum("priority").default("normal"),
  createdBy: uuid("created_by").references(() => users.id),
  replyToId: integer("reply_to_id"),
  senderId: uuid("sender_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const memberMessagesRelations = relations(memberMessages, ({ one }) => ({
  user: one(users, {
    fields: [memberMessages.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [memberMessages.createdBy],
    references: [users.id],
  }),
}));

export const insertMemberMessageSchema = createInsertSchema(memberMessages).omit({ id: true, createdAt: true });

// === ATTENDANCE TYPES ===
export type Attendance = typeof attendance.$inferSelect;
export type AttendanceLink = typeof attendanceLinks.$inferSelect;
export type AttendanceSettings = typeof attendanceSettings.$inferSelect;
export type MemberMessage = typeof memberMessages.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertAttendanceLink = z.infer<typeof insertAttendanceLinkSchema>;
export type InsertAttendanceSettings = z.infer<typeof insertAttendanceSettingsSchema>;
export type InsertMemberMessage = z.infer<typeof insertMemberMessageSchema>;

// Request types
export type CreateAttendanceRequest = InsertAttendance;
export type CreateAttendanceLinkRequest = InsertAttendanceLink;

// === MUSIC LIBRARY ===

export const musicGenres = pgTable("music_genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const music = pgTable("music", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  genreId: integer("genre_id").references(() => musicGenres.id),
  duration: integer("duration"), // in seconds
  audioUrl: text("audio_url"),
  audioFilePath: text("audio_file_path"),
  coverImageUrl: text("cover_image_url"),
  lyrics: text("lyrics"),
  isPublished: boolean("is_published").default(false),
  playCount: integer("play_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const musicPlaylists = pgTable("music_playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  userId: uuid("user_id").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const playlistMusic = pgTable("playlist_music", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").references(() => musicPlaylists.id).notNull(),
  musicId: integer("music_id").references(() => music.id).notNull(),
  position: integer("position").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// === MUSIC RELATIONS ===
export const musicRelations = relations(music, ({ one }) => ({
  genre: one(musicGenres, {
    fields: [music.genreId],
    references: [musicGenres.id],
  }),
  creator: one(users, {
    fields: [music.createdBy],
    references: [users.id],
  }),
}));

export const musicPlaylistsRelations = relations(musicPlaylists, ({ one, many }) => ({
  user: one(users, {
    fields: [musicPlaylists.userId],
    references: [users.id],
  }),
  tracks: many(playlistMusic),
}));

export const playlistMusicRelations = relations(playlistMusic, ({ one }) => ({
  playlist: one(musicPlaylists, {
    fields: [playlistMusic.playlistId],
    references: [musicPlaylists.id],
  }),
  music: one(music, {
    fields: [playlistMusic.musicId],
    references: [music.id],
  }),
}));

// === MUSIC SCHEMAS ===
export const insertMusicSchema = createInsertSchema(music).omit({ id: true, playCount: true, createdAt: true });
export const insertMusicPlaylistSchema = createInsertSchema(musicPlaylists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPlaylistMusicSchema = createInsertSchema(playlistMusic).omit({ id: true, addedAt: true });

// === MUSIC TYPES ===
export type Music = typeof music.$inferSelect;
export type MusicPlaylist = typeof musicPlaylists.$inferSelect;
export type PlaylistMusic = typeof playlistMusic.$inferSelect;
export type MusicGenre = typeof musicGenres.$inferSelect;

export type InsertMusic = z.infer<typeof insertMusicSchema>;
export type InsertMusicPlaylist = z.infer<typeof insertMusicPlaylistSchema>;
export type InsertPlaylistMusic = z.infer<typeof insertPlaylistMusicSchema>;

// === HOUSE CELL COMMUNITY ===

export const houseCells = pgTable("house_cells", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: uuid("leader_id").references(() => users.id),
  leaderName: text("leader_name"),
  leaderPhone: text("leader_phone"),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  meetingDay: text("meeting_day"),
  meetingTime: text("meeting_time"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

export const houseCellMessages = pgTable("house_cell_messages", {
  id: serial("id").primaryKey(),
  houseCellId: integer("house_cell_id").notNull().references(() => houseCells.id),
  userId: uuid("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === HOUSE CELL RELATIONS ===
export const houseCellsRelations = relations(houseCells, ({ one, many }) => ({
  leader: one(users, {
    fields: [houseCells.leaderId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [houseCells.createdBy],
    references: [users.id],
  }),
  messages: many(houseCellMessages),
}));

export const houseCellMessagesRelations = relations(houseCellMessages, ({ one }) => ({
  houseCell: one(houseCells, {
    fields: [houseCellMessages.houseCellId],
    references: [houseCells.id],
  }),
  user: one(users, {
    fields: [houseCellMessages.userId],
    references: [users.id],
  }),
}));

// === HOUSE CELL SCHEMAS ===
export const insertHouseCellSchema = createInsertSchema(houseCells).omit({ id: true, createdAt: true });
export const insertHouseCellMessageSchema = createInsertSchema(houseCellMessages).omit({ id: true, createdAt: true });

// === HOUSE CELL TYPES ===
export type HouseCell = typeof houseCells.$inferSelect;
export type HouseCellMessage = typeof houseCellMessages.$inferSelect;
export type InsertHouseCell = z.infer<typeof insertHouseCellSchema>;
export type InsertHouseCellMessage = z.infer<typeof insertHouseCellMessageSchema>;

// === GROUP SPACE ===

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  createdBy: uuid("created_by").references(() => users.id),
  isPrivate: boolean("is_private").default(false),
  allowMemberInvite: boolean("allow_member_invite").default(true),
  location: text("location"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  targetAgeMin: integer("target_age_min"),
  targetAgeMax: integer("target_age_max"),
  interests: jsonb("interests").default("[]"),
  category: text("category"),
  requireApproval: boolean("require_approval").default(false),
  maxMembers: integer("max_members"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: uuid("user_id").references(() => users.id),
  role: text("role").default("MEMBER"),
  status: text("status").default("ACTIVE"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupJoinRequests = pgTable("group_join_requests", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: uuid("user_id").references(() => users.id),
  message: text("message"),
  status: text("status").default("PENDING"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupActivityLogs = pgTable("group_activity_logs", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: uuid("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === GROUP RELATIONS ===
export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  messages: many(groupMessages),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const groupMessagesRelations = relations(groupMessages, ({ one }) => ({
  group: one(groups, {
    fields: [groupMessages.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMessages.userId],
    references: [users.id],
  }),
}));

export const groupJoinRequestsRelations = relations(groupJoinRequests, ({ one }) => ({
  group: one(groups, {
    fields: [groupJoinRequests.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupJoinRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [groupJoinRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const groupActivityLogsRelations = relations(groupActivityLogs, ({ one }) => ({
  group: one(groups, {
    fields: [groupActivityLogs.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupActivityLogs.userId],
    references: [users.id],
  }),
}));

// === GROUP SCHEMAS ===
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ id: true, joinedAt: true });
export const insertGroupMessageSchema = createInsertSchema(groupMessages).omit({ id: true, createdAt: true });
export const insertGroupJoinRequestSchema = createInsertSchema(groupJoinRequests).omit({ id: true, createdAt: true });
export const insertGroupActivityLogSchema = createInsertSchema(groupActivityLogs).omit({ id: true, createdAt: true });

// === GROUP TYPES ===
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type GroupMessage = typeof groupMessages.$inferSelect;
export type GroupJoinRequest = typeof groupJoinRequests.$inferSelect;
export type GroupActivityLog = typeof groupActivityLogs.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;
export type InsertGroupJoinRequest = z.infer<typeof insertGroupJoinRequestSchema>;
export type InsertGroupActivityLog = z.infer<typeof insertGroupActivityLogSchema>;

// === AUDIT LOGS ===
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  organizationId: uuid("organization_id").references(() => organizations.id),
});

// === PERMISSIONS ===
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  permissionId: integer("permission_id").references(() => permissions.id),
});

// === AUDIT LOG RELATIONS ===
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

// === TYPES ===
export type AuditLog = typeof auditLogs.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// === LIVE STREAMING ===
export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  streamUrl: text("stream_url"),
  embedUrl: text("embed_url"),
  youtubeVideoId: text("youtube_video_id"),
  youtubeChannelId: text("youtube_channel_id"),
  youtubeChannelName: text("youtube_channel_name"),
  isLive: boolean("is_live").default(false),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  viewerCount: integer("viewer_count").default(0),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveStreamRelations = relations(liveStreams, ({ one }) => ({
  creator: one(users, {
    fields: [liveStreams.createdBy],
    references: [users.id],
  }),
}));

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({ id: true, createdAt: true, viewerCount: true });
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;

// === API Keys for External Integrations ===

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  prefix: text("prefix").notNull(),
  permissions: jsonb("permissions").default("[\"read\"]"),
  rateLimit: integer("rate_limit").default(100), // requests per hour
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const apiKeyRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true, key: true, prefix: true });
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// === Webhooks for External Integrations ===

export const apiWebhooks = pgTable("api_webhooks", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  url: text("url").notNull(),
  events: jsonb("events").notNull(), // event types to trigger webhook
  secret: text("secret"),
  isActive: boolean("is_active").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiWebhookRelations = relations(apiWebhooks, ({ one }) => ({
  user: one(users, {
    fields: [apiWebhooks.userId],
    references: [users.id],
  }),
}));

export const insertApiWebhookSchema = createInsertSchema(apiWebhooks).omit({ id: true, createdAt: true });
export type ApiWebhook = typeof apiWebhooks.$inferSelect;
export type InsertApiWebhook = z.infer<typeof insertApiWebhookSchema>;

// === MULTI-LANGUAGE & LOCALIZATION ===

export const supportedLanguages = pgTable("supported_languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  nativeName: text("native_name").notNull(),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportedLanguagesRelations = relations(supportedLanguages, ({ one }) => ({
}));

export const insertSupportedLanguageSchema = createInsertSchema(supportedLanguages).omit({ id: true, createdAt: true });
export type SupportedLanguage = typeof supportedLanguages.$inferSelect;
export type InsertSupportedLanguage = z.infer<typeof insertSupportedLanguageSchema>;

// === Volunteer Management ===

export const volunteerSkills = pgTable("volunteer_skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
});

export const volunteerProfiles = pgTable("volunteer_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  skills: jsonb("skills").default("[]"),
  availability: jsonb("availability").default("{}"),
  totalHours: integer("total_hours").default(0),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const volunteerOpportunities = pgTable("volunteer_opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  requiredSkills: jsonb("required_skills").default("[]"),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in minutes
  location: text("location"),
  spotsAvailable: integer("spots_available"),
  spotsFilled: integer("spots_filled").default(0),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const volunteerAssignments = pgTable("volunteer_assignments", {
  id: serial("id").primaryKey(),
  volunteerId: uuid("volunteer_id").references(() => users.id).notNull(),
  opportunityId: integer("opportunity_id").references(() => volunteerOpportunities.id).notNull(),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  checkInAt: timestamp("check_in_at"),
  checkOutAt: timestamp("check_out_at"),
  hoursWorked: integer("hours_worked").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const volunteerBadges = pgTable("volunteer_badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  criteria: text("criteria"), // JSON criteria for earning badge
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => volunteerBadges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Relations
export const volunteerProfileRelations = relations(volunteerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [volunteerProfiles.userId],
    references: [users.id],
  }),
}));

export const volunteerOpportunityRelations = relations(volunteerOpportunities, ({ one }) => ({
  creator: one(users, {
    fields: [volunteerOpportunities.createdBy],
    references: [users.id],
  }),
}));

export const volunteerAssignmentRelations = relations(volunteerAssignments, ({ one }) => ({
  volunteer: one(users, {
    fields: [volunteerAssignments.volunteerId],
    references: [users.id],
  }),
  opportunity: one(volunteerOpportunities, {
    fields: [volunteerAssignments.opportunityId],
    references: [volunteerOpportunities.id],
  }),
}));

export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(volunteerBadges, {
    fields: [userBadges.badgeId],
    references: [volunteerBadges.id],
  }),
}));

// Insert schemas
export const insertVolunteerSkillSchema = createInsertSchema(volunteerSkills).omit({ id: true });
export type VolunteerSkill = typeof volunteerSkills.$inferSelect;
export type InsertVolunteerSkill = z.infer<typeof insertVolunteerSkillSchema>;

export const insertVolunteerProfileSchema = createInsertSchema(volunteerProfiles).omit({ id: true });
export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;
export type InsertVolunteerProfile = z.infer<typeof insertVolunteerProfileSchema>;

export const insertVolunteerOpportunitySchema = createInsertSchema(volunteerOpportunities).omit({ id: true, createdAt: true, spotsFilled: true });
export type VolunteerOpportunity = typeof volunteerOpportunities.$inferSelect;
export type InsertVolunteerOpportunity = z.infer<typeof insertVolunteerOpportunitySchema>;

export const insertVolunteerAssignmentSchema = createInsertSchema(volunteerAssignments).omit({ id: true, createdAt: true });
export type VolunteerAssignment = typeof volunteerAssignments.$inferSelect;
export type InsertVolunteerAssignment = z.infer<typeof insertVolunteerAssignmentSchema>;

export const insertVolunteerBadgeSchema = createInsertSchema(volunteerBadges).omit({ id: true, createdAt: true });
export type VolunteerBadge = typeof volunteerBadges.$inferSelect;
export type InsertVolunteerBadge = z.infer<typeof insertVolunteerBadgeSchema>;

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

// === Privacy & Moderation ===

export const privacySettings = pgTable("privacy_settings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  showProfile: boolean("show_profile").default(true),
  showAttendance: boolean("show_attendance").default(true),
  showDonations: boolean("show_donations").default(false),
  showPrayerRequests: boolean("show_prayer_requests").default(true),
  allowMessaging: boolean("allow_messaging").default(true),
  showInDirectory: boolean("show_in_directory").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentFlags = pgTable("content_flags", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // prayer_request, message, event, comment, etc.
  contentId: integer("content_id").notNull(),
  reporterId: uuid("reporter_id").references(() => users.id),
  reason: text("reason").notNull(), // spam, inappropriate, abusive, harassment, other
  status: text("status").default("pending"), // pending, reviewed, resolved, dismissed
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const abuseReports = pgTable("abuse_reports", {
  id: serial("id").primaryKey(),
  reporterId: uuid("reporter_id").references(() => users.id).notNull(),
  reportedUserId: uuid("reported_user_id").references(() => users.id),
  reportedContentId: integer("reported_content_id"),
  reportedContentType: text("reported_content_type"),
  category: text("category").notNull(), // harassment, bullying, abuse, misconduct, other
  description: text("description").notNull(),
  evidence: jsonb("evidence").default("[]"),
  status: text("status").default("pending"), // pending, investigating, resolved, dismissed
  resolution: text("resolution"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const privacySettingsRelations = relations(privacySettings, ({ one }) => ({
  user: one(users, {
    fields: [privacySettings.userId],
    references: [users.id],
  }),
}));

export const contentFlagRelations = relations(contentFlags, ({ one }) => ({
  reporter: one(users, {
    fields: [contentFlags.reporterId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [contentFlags.reviewedBy],
    references: [users.id],
  }),
}));

export const abuseReportRelations = relations(abuseReports, ({ one }) => ({
  reporter: one(users, {
    fields: [abuseReports.reporterId],
    references: [users.id],
  }),
  reportedUser: one(users, {
    fields: [abuseReports.reportedUserId],
    references: [users.id],
  }),
  resolver: one(users, {
    fields: [abuseReports.resolvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertPrivacySettingsSchema = createInsertSchema(privacySettings).omit({ id: true, createdAt: true, updatedAt: true });
export type PrivacySettings = typeof privacySettings.$inferSelect;
export type InsertPrivacySettings = z.infer<typeof insertPrivacySettingsSchema>;

export const insertContentFlagSchema = createInsertSchema(contentFlags).omit({ id: true, createdAt: true });
export type ContentFlag = typeof contentFlags.$inferSelect;
export type InsertContentFlag = z.infer<typeof insertContentFlagSchema>;

export const insertAbuseReportSchema = createInsertSchema(abuseReports).omit({ id: true, createdAt: true });
export type AbuseReport = typeof abuseReports.$inferSelect;
export type InsertAbuseReport = z.infer<typeof insertAbuseReportSchema>;

// === Bible Study Tools ===

export const userHighlights = pgTable("user_highlights", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  color: text("color").default("#FFEB3B"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userNotes = pgTable("user_notes", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verseDiscussions = pgTable("verse_discussions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupAnnotations = pgTable("group_annotations", {
  id: serial("id").primaryKey(),
  groupId: integer("groups").references(() => groups.id).notNull(),
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  content: text("content").notNull(),
  createdBy: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userHighlightRelations = relations(userHighlights, ({ one }) => ({
  user: one(users, {
    fields: [userHighlights.userId],
    references: [users.id],
  }),
}));

export const userNoteRelations = relations(userNotes, ({ one }) => ({
  user: one(users, {
    fields: [userNotes.userId],
    references: [users.id],
  }),
}));

export const verseDiscussionRelations = relations(verseDiscussions, ({ one }) => ({
  user: one(users, {
    fields: [verseDiscussions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserHighlightSchema = createInsertSchema(userHighlights).omit({ id: true, createdAt: true });
export type UserHighlight = typeof userHighlights.$inferSelect;
export type InsertUserHighlight = z.infer<typeof insertUserHighlightSchema>;

export const insertUserNoteSchema = createInsertSchema(userNotes).omit({ id: true, createdAt: true, updatedAt: true });
export type UserNote = typeof userNotes.$inferSelect;
export type InsertUserNote = z.infer<typeof insertUserNoteSchema>;

export const insertVerseDiscussionSchema = createInsertSchema(verseDiscussions).omit({ id: true, createdAt: true });
export type VerseDiscussion = typeof verseDiscussions.$inferSelect;
export type InsertVerseDiscussion = z.infer<typeof insertVerseDiscussionSchema>;

export const insertGroupAnnotationSchema = createInsertSchema(groupAnnotations).omit({ id: true, createdAt: true });
export type GroupAnnotation = typeof groupAnnotations.$inferSelect;
export type InsertGroupAnnotation = z.infer<typeof insertGroupAnnotationSchema>;

// === DISCIPLESHIP PATHWAYS ===

export const trackCategoryEnum = pgEnum("track_category", ["new_believer", "leadership", "discipleship", "ministry", "theology", "practical", "other"]);

export const discipleshipTracks = pgTable("discipleship_tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: trackCategoryEnum("category").default("other"),
  imageUrl: text("image_url"),
  estimatedWeeks: integer("estimated_weeks"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").references(() => discipleshipTracks.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  videoUrl: text("video_url"),
  order: integer("order").default(0),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  order: integer("order").default(0),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  trackId: integer("track_id").references(() => discipleshipTracks.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  quizScore: integer("quiz_score"),
  quizAttempts: integer("quiz_attempts").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for Discipleship
export const insertDiscipleshipTrackSchema = createInsertSchema(discipleshipTracks).omit({ id: true, createdAt: true, updatedAt: true });
export type DiscipleshipTrack = typeof discipleshipTracks.$inferSelect;
export type InsertDiscipleshipTrack = z.infer<typeof insertDiscipleshipTrackSchema>;

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true, updatedAt: true });
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true });
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, createdAt: true, updatedAt: true });
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export const insertReflectionSchema = createInsertSchema(reflections).omit({ id: true, createdAt: true });
export type Reflection = typeof reflections.$inferSelect;
export type InsertReflection = z.infer<typeof insertReflectionSchema>;

// === Sermon Clips ===

export const clipFormats = ["square", "vertical", "landscape"] as const;
export type ClipFormat = typeof clipFormats[number];

export const sermonClips = pgTable("sermon_clips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sourceVideoUrl: text("source_video_url"),
  sourceVideoPath: text("source_video_path"),
  clipStartTime: integer("clip_start_time").notNull(),
  clipEndTime: integer("clip_end_time").notNull(),
  format: text("format").notNull().default("landscape"),
  overlayText: text("overlay_text"),
  verseReference: text("verse_reference"),
  outputUrl: text("output_url"),
  outputPath: text("output_path"),
  status: text("status").notNull().default("pending"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSermonClipSchema = createInsertSchema(sermonClips).omit({ id: true, createdAt: true });
export type SermonClip = typeof sermonClips.$inferSelect;
export type InsertSermonClip = z.infer<typeof insertSermonClipSchema>;

// === CHURCH SOCIAL FEED ===

export const postVisibilityEnum = pgEnum('post_visibility', [
  'PUBLIC',
  'MEMBERS_ONLY',
  'PRIVATE'
]);

export const postTypeEnum = pgEnum('post_type', [
  'TEXT',
  'IMAGE',
  'VIDEO',
  'TESTIMONY',
  'PRAYER_REQUEST',
  'ANNOUNCEMENT'
]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content"),
  type: postTypeEnum("type").default("TEXT"),
  visibility: postVisibilityEnum("visibility").default("MEMBERS_ONLY"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  verseReference: text("verse_reference"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isHidden: boolean("is_hidden").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => postComments.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postShares = pgTable("post_shares", {
  id: serial("id").primaryKey(),
  originalPostId: integer("original_post_id").references(() => posts.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sharedPostId: integer("shared_post_id").references(() => posts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  followerId: uuid("follower_id").references(() => users.id).notNull(),
  followingId: uuid("following_id").references(() => users.id).notNull(),
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  postsCount: integer("posts_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postHashtags = pgTable("post_hashtags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  hashtagId: integer("hashtag_id").references(() => hashtags.id).notNull(),
});

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
  shares: many(postShares),
  hashtags: many(postHashtags),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  parent: one(postComments, {
    fields: [postComments.parentId],
    references: [postComments.id],
  }),
  likes: many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(postComments, {
    fields: [commentLikes.commentId],
    references: [postComments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));

export const postSharesRelations = relations(postShares, ({ one }) => ({
  originalPost: one(posts, {
    fields: [postShares.originalPostId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postShares.userId],
    references: [users.id],
  }),
  sharedPost: one(posts, {
    fields: [postShares.sharedPostId],
    references: [posts.id],
  }),
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  follower: one(users, {
    fields: [userConnections.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [userConnections.followingId],
    references: [users.id],
  }),
}));

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  posts: many(postHashtags),
}));

export const postHashtagsRelations = relations(postHashtags, ({ one }) => ({
  post: one(posts, {
    fields: [postHashtags.postId],
    references: [posts.id],
  }),
  hashtag: one(hashtags, {
    fields: [postHashtags.hashtagId],
    references: [hashtags.id],
  }),
}));

// Insert schemas
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true, commentsCount: true, sharesCount: true });
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;

export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true });
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({ id: true, createdAt: true });
export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;

export const insertPostShareSchema = createInsertSchema(postShares).omit({ id: true, createdAt: true });
export type PostShare = typeof postShares.$inferSelect;
export type InsertPostShare = z.infer<typeof insertPostShareSchema>;

export const insertUserConnectionSchema = createInsertSchema(userConnections).omit({ id: true, createdAt: true });
export type UserConnection = typeof userConnections.$inferSelect;
export type InsertUserConnection = z.infer<typeof insertUserConnectionSchema>;

export const insertHashtagSchema = createInsertSchema(hashtags).omit({ id: true, createdAt: true, postsCount: true });
export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = z.infer<typeof insertHashtagSchema>;

// === SPIRITUAL HEALTH & ENGAGEMENT ANALYTICS ===

export const userEngagementMetrics = pgTable("user_engagement_metrics", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: date("date").notNull().defaultNow(),
  sermonsWatched: integer("sermons_watched").default(0),
  prayersSubmitted: integer("prayers_submitted").default(0),
  eventsAttended: integer("events_attended").default(0),
  devotionalsRead: integer("devotionals_read").default(0),
  groupMessages: integer("group_messages").default(0),
  loginCount: integer("login_count").default(1),
  totalSessionTime: integer("total_session_time").default(0),
});

export const spiritualHealthScores = pgTable("spiritual_health_scores", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  weekStart: date("week_start").notNull(),
  attendanceScore: integer("attendance_score").default(0),
  engagementScore: integer("engagement_score").default(0),
  growthScore: integer("growth_score").default(0),
  overallScore: integer("overall_score").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const discipleshipAnalytics = pgTable("discipleship_analytics", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").references(() => discipleshipTracks.id),
  totalEnrolled: integer("total_enrolled").default(0),
  activeLearners: integer("active_learners").default(0),
  completedCount: integer("completed_count").default(0),
  averageCompletionTime: integer("average_completion_time"),
  quizAverageScore: integer("quiz_average_score"),
  weekStart: date("week_start").notNull(),
});

export const groupAnalytics = pgTable("group_analytics", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id),
  weekStart: date("week_start").notNull(),
  activeMembers: integer("active_members").default(0),
  messagesCount: integer("messages_count").default(0),
  meetingsHeld: integer("meetings_held").default(0),
  newMembers: integer("new_members").default(0),
});

export const analyticsReports = pgTable("analytics_reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  reportType: text("report_type").notNull(),
  filters: jsonb("filters").default("{}"),
  generatedBy: uuid("generated_by").references(() => users.id),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userEngagementMetricsRelations = relations(userEngagementMetrics, ({ one }) => ({
  user: one(users, {
    fields: [userEngagementMetrics.userId],
    references: [users.id],
  }),
}));

export const spiritualHealthScoresRelations = relations(spiritualHealthScores, ({ one }) => ({
  user: one(users, {
    fields: [spiritualHealthScores.userId],
    references: [users.id],
  }),
}));

export const discipleshipAnalyticsRelations = relations(discipleshipAnalytics, ({ one }) => ({
  track: one(discipleshipTracks, {
    fields: [discipleshipAnalytics.trackId],
    references: [discipleshipTracks.id],
  }),
}));

export const groupAnalyticsRelations = relations(groupAnalytics, ({ one }) => ({
  group: one(groups, {
    fields: [groupAnalytics.groupId],
    references: [groups.id],
  }),
}));

export const analyticsReportsRelations = relations(analyticsReports, ({ one }) => ({
  generator: one(users, {
    fields: [analyticsReports.generatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserEngagementMetricsSchema = createInsertSchema(userEngagementMetrics).omit({ id: true });
export type UserEngagementMetrics = typeof userEngagementMetrics.$inferSelect;
export type InsertUserEngagementMetrics = z.infer<typeof insertUserEngagementMetricsSchema>;

export const insertSpiritualHealthScoreSchema = createInsertSchema(spiritualHealthScores).omit({ id: true, calculatedAt: true });
export type SpiritualHealthScore = typeof spiritualHealthScores.$inferSelect;
export type InsertSpiritualHealthScore = z.infer<typeof insertSpiritualHealthScoreSchema>;

export const insertDiscipleshipAnalyticsSchema = createInsertSchema(discipleshipAnalytics).omit({ id: true });
export type DiscipleshipAnalytics = typeof discipleshipAnalytics.$inferSelect;
export type InsertDiscipleshipAnalytics = z.infer<typeof insertDiscipleshipAnalyticsSchema>;

export const insertGroupAnalyticsSchema = createInsertSchema(groupAnalytics).omit({ id: true });
export type GroupAnalytics = typeof groupAnalytics.$inferSelect;
export type InsertGroupAnalytics = z.infer<typeof insertGroupAnalyticsSchema>;

export const insertAnalyticsReportSchema = createInsertSchema(analyticsReports).omit({ id: true, createdAt: true });
export type AnalyticsReport = typeof analyticsReports.$inferSelect;
export type InsertAnalyticsReport = z.infer<typeof insertAnalyticsReportSchema>;

// === PASTORAL CARE & COUNSELING SYSTEM ===

export const counselingRequests = pgTable("counseling_requests", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  requestType: text("request_type").notNull(),
  urgency: text("urgency").default("normal"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default("pending"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const counselingNotes = pgTable("counseling_notes", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => counselingRequests.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const counselingFollowups = pgTable("counseling_followups", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => counselingRequests.id).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pastoralVisits = pgTable("pastoral_visits", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => counselingRequests.id),
  visitorId: uuid("visitor_id").references(() => users.id).notNull(),
  visitedUserId: uuid("visited_user_id").references(() => users.id),
  visitDate: date("visit_date").notNull(),
  location: text("location"),
  notes: text("notes"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const counselingRequestRelations = relations(counselingRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [counselingRequests.userId],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [counselingRequests.assignedTo],
    references: [users.id],
  }),
  notes: many(counselingNotes),
  followups: many(counselingFollowups),
  visits: many(pastoralVisits),
}));

export const counselingNoteRelations = relations(counselingNotes, ({ one }) => ({
  request: one(counselingRequests, {
    fields: [counselingNotes.requestId],
    references: [counselingRequests.id],
  }),
  author: one(users, {
    fields: [counselingNotes.authorId],
    references: [users.id],
  }),
}));

export const counselingFollowupRelations = relations(counselingFollowups, ({ one }) => ({
  request: one(counselingRequests, {
    fields: [counselingFollowups.requestId],
    references: [counselingRequests.id],
  }),
}));

export const pastoralVisitRelations = relations(pastoralVisits, ({ one }) => ({
  request: one(counselingRequests, {
    fields: [pastoralVisits.requestId],
    references: [counselingRequests.id],
  }),
  visitor: one(users, {
    fields: [pastoralVisits.visitorId],
    references: [users.id],
  }),
  visitedUser: one(users, {
    fields: [pastoralVisits.visitedUserId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCounselingRequestSchema = createInsertSchema(counselingRequests).omit({ id: true, createdAt: true, updatedAt: true });
export type CounselingRequest = typeof counselingRequests.$inferSelect;
export type InsertCounselingRequest = z.infer<typeof insertCounselingRequestSchema>;

export const insertCounselingNoteSchema = createInsertSchema(counselingNotes).omit({ id: true, createdAt: true });
export type CounselingNote = typeof counselingNotes.$inferSelect;
export type InsertCounselingNote = z.infer<typeof insertCounselingNoteSchema>;

export const insertCounselingFollowupSchema = createInsertSchema(counselingFollowups).omit({ id: true, createdAt: true });
export type CounselingFollowup = typeof counselingFollowups.$inferSelect;
export type InsertCounselingFollowup = z.infer<typeof insertCounselingFollowupSchema>;

export const insertPastoralVisitSchema = createInsertSchema(pastoralVisits).omit({ id: true, createdAt: true });
export type PastoralVisit = typeof pastoralVisits.$inferSelect;
export type InsertPastoralVisit = z.infer<typeof insertPastoralVisitSchema>;

// === AI SERMON SEARCH & SMART RECOMMENDATIONS ===

export const sermonEmbeddings = pgTable("sermon_embeddings", {
  id: serial("id").primaryKey(),
  sermonId: integer("sermon_id").references(() => sermons.id).notNull(),
  summary: text("summary"),
  keyTopics: jsonb("key_topics").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sermonViews = pgTable("sermon_views", {
  id: serial("id").primaryKey(),
  sermonId: integer("sermon_id").references(() => sermons.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  watchDuration: integer("watch_duration").default(0),
  completed: boolean("completed").default(false),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const userSermonPreferences = pgTable("user_sermon_preferences", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  favoriteSpeakers: jsonb("favorite_speakers").$type<string[]>(),
  favoriteTopics: jsonb("favorite_topics").$type<string[]>(),
  favoriteSeries: jsonb("favorite_series").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sermonRecommendations = pgTable("sermon_recommendations", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  recommendedSermons: jsonb("recommended_sermons").$type<number[]>(),
  basedOn: text("based_on"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const sermonEmbeddingRelations = relations(sermonEmbeddings, ({ one }) => ({
  sermon: one(sermons, {
    fields: [sermonEmbeddings.sermonId],
    references: [sermons.id],
  }),
}));

export const sermonViewRelations = relations(sermonViews, ({ one }) => ({
  sermon: one(sermons, {
    fields: [sermonViews.sermonId],
    references: [sermons.id],
  }),
  user: one(users, {
    fields: [sermonViews.userId],
    references: [users.id],
  }),
}));

export const userSermonPreferenceRelations = relations(userSermonPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userSermonPreferences.userId],
    references: [users.id],
  }),
}));

export const sermonRecommendationRelations = relations(sermonRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [sermonRecommendations.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertSermonEmbeddingSchema = createInsertSchema(sermonEmbeddings).omit({ id: true, createdAt: true });
export type SermonEmbedding = typeof sermonEmbeddings.$inferSelect;
export type InsertSermonEmbedding = z.infer<typeof insertSermonEmbeddingSchema>;

export const insertSermonViewSchema = createInsertSchema(sermonViews).omit({ id: true, viewedAt: true });
export type SermonView = typeof sermonViews.$inferSelect;
export type InsertSermonView = z.infer<typeof insertSermonViewSchema>;

export const insertUserSermonPreferenceSchema = createInsertSchema(userSermonPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type UserSermonPreference = typeof userSermonPreferences.$inferSelect;
export type InsertUserSermonPreference = z.infer<typeof insertUserSermonPreferenceSchema>;

export const insertSermonRecommendationSchema = createInsertSchema(sermonRecommendations).omit({ id: true, createdAt: true });
export type SermonRecommendation = typeof sermonRecommendations.$inferSelect;
export type InsertSermonRecommendation = z.infer<typeof insertSermonRecommendationSchema>;

// === AI CHURCH ASSISTANT (CHATBOT) ===

export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatbotIntents = pgTable("chatbot_intents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  patterns: jsonb("patterns").$type<string[]>(),
  responses: jsonb("responses").$type<string[]>().notNull(),
  category: varchar("category", { length: 100 }),
  keywords: jsonb("keywords").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatbotPreferences = pgTable("chatbot_preferences", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  language: varchar("language", { length: 10 }).default("en"),
  notificationEnabled: boolean("notification_enabled").default(true),
  digestPreference: varchar("digest_preference", { length: 50 }).default("daily"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatbotAnalytics = pgTable("chatbot_analytics", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id),
  userId: uuid("user_id").references(() => users.id),
  intent: varchar("intent", { length: 255 }),
  responseTimeMs: integer("response_time_ms"),
  feedback: varchar("feedback", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const chatConversationRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

export const chatbotIntentRelations = relations(chatbotIntents, () => ({}));

export const chatbotPreferenceRelations = relations(chatbotPreferences, ({ one }) => ({
  user: one(users, {
    fields: [chatbotPreferences.userId],
    references: [users.id],
  }),
}));

export const chatbotAnalyticRelations = relations(chatbotAnalytics, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatbotAnalytics.conversationId],
    references: [chatConversations.id],
  }),
  user: one(users, {
    fields: [chatbotAnalytics.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({ id: true, createdAt: true, updatedAt: true });
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export const insertChatbotIntentSchema = createInsertSchema(chatbotIntents).omit({ id: true, createdAt: true });
export type ChatbotIntent = typeof chatbotIntents.$inferSelect;
export type InsertChatbotIntent = z.infer<typeof insertChatbotIntentSchema>;

export const insertChatbotPreferenceSchema = createInsertSchema(chatbotPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type ChatbotPreference = typeof chatbotPreferences.$inferSelect;
export type InsertChatbotPreference = z.infer<typeof insertChatbotPreferenceSchema>;

export const insertChatbotAnalyticSchema = createInsertSchema(chatbotAnalytics).omit({ id: true, createdAt: true });
export type ChatbotAnalytic = typeof chatbotAnalytics.$inferSelect;
export type InsertChatbotAnalytic = z.infer<typeof insertChatbotAnalyticSchema>;

// === MULTI-CAMPUS & BRANCH MANAGEMENT ===

export const campuses = pgTable("campuses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Nigeria"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  pastorId: uuid("pastor_id").references(() => users.id),
  isHeadquarters: boolean("is_headquarters").default(false),
  isActive: boolean("is_active").default(true),
  timezone: varchar("timezone", { length: 50 }).default("Africa/Lagos"),
  logoUrl: varchar("logo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  campusId: integer("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  leaderId: uuid("leader_id").references(() => users.id),
  leaderName: varchar("leader_name", { length: 255 }),
  leaderPhone: varchar("leader_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campusMembers = pgTable("campus_members", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  campusId: integer("campus_id").references(() => campuses.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  membershipType: varchar("membership_type", { length: 50 }).default("member"),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const campusEvents = pgTable("campus_events", {
  id: serial("id").primaryKey(),
  campusId: integer("campus_id").references(() => campuses.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  isPrimary: boolean("is_primary").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campusTransfers = pgTable("campus_transfers", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fromCampusId: integer("from_campus_id").references(() => campuses.id),
  toCampusId: integer("to_campus_id").references(() => campuses.id).notNull(),
  fromBranchId: integer("from_branch_id").references(() => branches.id),
  toBranchId: integer("to_branch_id").references(() => branches.id),
  status: varchar("status", { length: 50 }).default("pending"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campusReports = pgTable("campus_reports", {
  id: serial("id").primaryKey(),
  campusId: integer("campus_id").references(() => campuses.id).notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  data: jsonb("data").$type<Record<string, any>>(),
  generatedBy: uuid("generated_by").references(() => users.id),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Relations
export const campusRelations = relations(campuses, ({ one, many }) => ({
  pastor: one(users, {
    fields: [campuses.pastorId],
    references: [users.id],
  }),
  branches: many(branches),
  members: many(campusMembers),
}));

export const branchRelations = relations(branches, ({ one, many }) => ({
  campus: one(campuses, {
    fields: [branches.campusId],
    references: [campuses.id],
  }),
  leader: one(users, {
    fields: [branches.leaderId],
    references: [users.id],
  }),
}));

export const campusMemberRelations = relations(campusMembers, ({ one }) => ({
  user: one(users, {
    fields: [campusMembers.userId],
    references: [users.id],
  }),
  campus: one(campuses, {
    fields: [campusMembers.campusId],
    references: [campuses.id],
  }),
  branch: one(branches, {
    fields: [campusMembers.branchId],
    references: [branches.id],
  }),
}));

export const campusEventRelations = relations(campusEvents, ({ one }) => ({
  campus: one(campuses, {
    fields: [campusEvents.campusId],
    references: [campuses.id],
  }),
  event: one(events, {
    fields: [campusEvents.eventId],
    references: [events.id],
  }),
}));

export const campusTransferRelations = relations(campusTransfers, ({ one }) => ({
  user: one(users, {
    fields: [campusTransfers.userId],
    references: [users.id],
  }),
  fromCampus: one(campuses, {
    fields: [campusTransfers.fromCampusId],
    references: [campuses.id],
  }),
  toCampus: one(campuses, {
    fields: [campusTransfers.toCampusId],
    references: [campuses.id],
  }),
}));

export const campusReportRelations = relations(campusReports, ({ one }) => ({
  campus: one(campuses, {
    fields: [campusReports.campusId],
    references: [campuses.id],
  }),
}));

// Insert schemas
export const insertCampusSchema = createInsertSchema(campuses).omit({ id: true, createdAt: true, updatedAt: true });
export type Campus = typeof campuses.$inferSelect;
export type InsertCampus = z.infer<typeof insertCampusSchema>;

export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true, updatedAt: true });
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

export const insertCampusMemberSchema = createInsertSchema(campusMembers).omit({ id: true, assignedAt: true });
export type CampusMember = typeof campusMembers.$inferSelect;
export type InsertCampusMember = z.infer<typeof insertCampusMemberSchema>;

export const insertCampusEventSchema = createInsertSchema(campusEvents).omit({ id: true, createdAt: true });
export type CampusEvent = typeof campusEvents.$inferSelect;
export type InsertCampusEvent = z.infer<typeof insertCampusEventSchema>;

export const insertCampusTransferSchema = createInsertSchema(campusTransfers).omit({ id: true, approvedAt: true, createdAt: true });
export type CampusTransfer = typeof campusTransfers.$inferSelect;
export type InsertCampusTransfer = z.infer<typeof insertCampusTransferSchema>;

export const insertCampusReportSchema = createInsertSchema(campusReports).omit({ id: true, generatedAt: true });
export type CampusReport = typeof campusReports.$inferSelect;
export type InsertCampusReport = z.infer<typeof insertCampusReportSchema>;

// === PRIVACY, SAFETY & MODERATION CONTROLS ===

export const userPrivacySettings = pgTable("privacy_settings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  profileVisibility: varchar("profile_visibility", { length: 50 }).default("members"),
  showEmail: boolean("show_email").default(false),
  showPhone: boolean("show_phone").default(false),
  showBirthday: boolean("show_birthday").default(true),
  showSocialLinks: boolean("show_social_links").default(true),
  allowMessages: boolean("allow_messages").default(true),
  allowGroupInvites: boolean("allow_group_invites").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportCategories = pgTable("report_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  severityLevel: integer("severity_level").default(1),
  isActive: boolean("is_active").default(true),
});

export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  reporterId: uuid("reporter_id").references(() => users.id).notNull(),
  reportedUserId: uuid("reported_user_id").references(() => users.id),
  reportedContentId: integer("reported_content_id"),
  reportedContentType: varchar("reported_content_type", { length: 50 }),
  categoryId: integer("category_id").references(() => reportCategories.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  contentData: jsonb("content_data").$type<Record<string, any>>(),
  flaggedBy: uuid("flagged_by").references(() => users.id),
  flagReason: varchar("flag_reason", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  action: varchar("action", { length: 50 }),
  actionNotes: text("action_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBlocks = pgTable("user_blocks", {
  id: serial("id").primaryKey(),
  blockerId: uuid("blocker_id").references(() => users.id).notNull(),
  blockedId: uuid("blocked_id").references(() => users.id).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userHiddenContent = pgTable("user_hidden_content", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull(),
  deviceInfo: varchar("device_info", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  lastActive: timestamp("last_active").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  deviceInfo: varchar("device_info", { length: 500 }),
  location: varchar("location", { length: 255 }),
  success: boolean("success").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const user2FA = pgTable("user_2fa", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  secret: varchar("secret", { length: 255 }).notNull(),
  enabled: boolean("enabled").default(false),
  backupCodes: jsonb("backup_codes").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataExportRequests = pgTable("data_export_requests", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  exportData: jsonb("export_data").$type<string[]>(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataDeletionRequests = pgTable("data_deletion_requests", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  scheduledDeletion: date("scheduled_deletion"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const privacySettingRelations = relations(privacySettings, ({ one }) => ({
  user: one(users, {
    fields: [privacySettings.userId],
    references: [users.id],
  }),
}));

export const userReportRelations = relations(userReports, ({ one }) => ({
  reporter: one(users, {
    fields: [userReports.reporterId],
    references: [users.id],
  }),
  reportedUser: one(users, {
    fields: [userReports.reportedUserId],
    references: [users.id],
  }),
  category: one(reportCategories, {
    fields: [userReports.categoryId],
    references: [reportCategories.id],
  }),
}));

export const userBlockRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [userBlocks.blockerId],
    references: [users.id],
  }),
  blocked: one(users, {
    fields: [userBlocks.blockedId],
    references: [users.id],
  }),
}));

export const userSessionRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

export const user2FARelations = relations(user2FA, ({ one }) => ({
  user: one(users, {
    fields: [user2FA.userId],
    references: [users.id],
  }),
}));

export const dataExportRequestRelations = relations(dataExportRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataExportRequests.userId],
    references: [users.id],
  }),
}));

export const dataDeletionRequestRelations = relations(dataDeletionRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataDeletionRequests.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertPrivacySettingSchema = createInsertSchema(privacySettings).omit({ id: true, createdAt: true, updatedAt: true });
export type PrivacySetting = typeof privacySettings.$inferSelect;
export type InsertPrivacySetting = z.infer<typeof insertPrivacySettingSchema>;

export const insertReportCategorySchema = createInsertSchema(reportCategories).omit({ id: true });
export type ReportCategory = typeof reportCategories.$inferSelect;
export type InsertReportCategory = z.infer<typeof insertReportCategorySchema>;

export const insertUserReportSchema = createInsertSchema(userReports).omit({ id: true, resolvedAt: true, createdAt: true });
export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;

export const insertModerationQueueSchema = createInsertSchema(moderationQueue).omit({ id: true, reviewedAt: true, createdAt: true });
export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;

export const insertUserBlockSchema = createInsertSchema(userBlocks).omit({ id: true, createdAt: true });
export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;

export const insertUserHiddenContentSchema = createInsertSchema(userHiddenContent).omit({ id: true, createdAt: true });
export type UserHiddenContent = typeof userHiddenContent.$inferSelect;
export type InsertUserHiddenContent = z.infer<typeof insertUserHiddenContentSchema>;

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, lastActive: true, createdAt: true });
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({ id: true, createdAt: true });
export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;

export const insertUser2FASchema = createInsertSchema(user2FA).omit({ id: true, createdAt: true, updatedAt: true });
export type User2FA = typeof user2FA.$inferSelect;
export type InsertUser2FA = z.infer<typeof insertUser2FASchema>;

export const insertDataExportRequestSchema = createInsertSchema(dataExportRequests).omit({ id: true, processedAt: true, createdAt: true });
export type DataExportRequest = typeof dataExportRequests.$inferSelect;
export type InsertDataExportRequest = z.infer<typeof insertDataExportRequestSchema>;

export const insertDataDeletionRequestSchema = createInsertSchema(dataDeletionRequests).omit({ id: true, processedAt: true, createdAt: true });
export type DataDeletionRequest = typeof dataDeletionRequests.$inferSelect;
export type InsertDataDeletionRequest = z.infer<typeof insertDataDeletionRequestSchema>;

// === API & EXTERNAL INTEGRATIONS ===

export const externalApiKeys = pgTable("external_api_keys", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  hashedKey: varchar("hashed_key", { length: 255 }).notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  rateLimit: integer("rate_limit").default(1000),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webhooks = pgTable("webhooks_v2", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  events: jsonb("events").$type<string[]>().notNull(),
  secret: varchar("secret", { length: 255 }),
  isActive: boolean("is_active").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").references(() => webhooks.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").$type<Record<string, any>>(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const externalIntegrations = pgTable("external_integrations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("disconnected"),
  config: jsonb("config").$type<Record<string, any>>(),
  credentials: jsonb("credentials").$type<Record<string, any>>(),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const oauthApps = pgTable("oauth_apps", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clientId: varchar("client_id", { length: 255 }).notNull().unique(),
  clientSecret: varchar("client_secret", { length: 255 }),
  redirectUris: jsonb("redirect_uris").$type<string[]>(),
  scopes: jsonb("scopes").$type<string[]>().default([]),
  isPublic: boolean("is_public").default(false),
  ownerId: uuid("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const oauthCodes = pgTable("oauth_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  clientId: varchar("client_id", { length: 255 }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  redirectUri: varchar("redirect_uri", { length: 500 }).notNull(),
  scope: jsonb("scope").$type<string[]>(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  accessToken: varchar("access_token", { length: 255 }).notNull().unique(),
  refreshToken: varchar("refresh_token", { length: 255 }),
  clientId: varchar("client_id", { length: 255 }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  scope: jsonb("scope").$type<string[]>(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiRateLimits = pgTable("api_rate_limits", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => externalApiKeys.id),
  endpoint: varchar("endpoint", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  requestCount: integer("request_count").default(1),
  windowStart: timestamp("window_start").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiCallLogs = pgTable("api_call_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => externalApiKeys.id),
  method: varchar("method", { length: 10 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  statusCode: integer("status_code"),
  responseTimeMs: integer("response_time_ms"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrationSyncJobs = pgTable("integration_sync_jobs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => externalIntegrations.id).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  recordsProcessed: integer("records_processed").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const externalApiKeyRelations = relations(externalApiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [externalApiKeys.userId],
    references: [users.id],
  }),
  rateLimits: many(apiRateLimits),
  callLogs: many(apiCallLogs),
}));

export const webhookV2Relations = relations(webhooks, ({ one, many }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveryRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveries.webhookId],
    references: [webhooks.id],
  }),
}));

export const oauthAppRelations = relations(oauthApps, ({ one }) => ({
  owner: one(users, {
    fields: [oauthApps.ownerId],
    references: [users.id],
  }),
}));

export const oauthCodeRelations = relations(oauthCodes, ({ one }) => ({
  user: one(users, {
    fields: [oauthCodes.userId],
    references: [users.id],
  }),
}));

export const oauthTokenRelations = relations(oauthTokens, ({ one }) => ({
  user: one(users, {
    fields: [oauthTokens.userId],
    references: [users.id],
  }),
}));

export const integrationSyncJobRelations = relations(integrationSyncJobs, ({ one }) => ({
  integration: one(externalIntegrations, {
    fields: [integrationSyncJobs.integrationId],
    references: [externalIntegrations.id],
  }),
}));

// Insert schemas
export const insertExternalApiKeySchema = createInsertSchema(externalApiKeys).omit({ id: true, createdAt: true, updatedAt: true });
export type ExternalApiKey = typeof externalApiKeys.$inferSelect;
export type InsertExternalApiKey = z.infer<typeof insertExternalApiKeySchema>;

export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true, updatedAt: true });
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;

export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries).omit({ id: true, createdAt: true });
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;

export const insertExternalIntegrationSchema = createInsertSchema(externalIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export type ExternalIntegration = typeof externalIntegrations.$inferSelect;
export type InsertExternalIntegration = z.infer<typeof insertExternalIntegrationSchema>;

export const insertOauthAppSchema = createInsertSchema(oauthApps).omit({ id: true, createdAt: true });
export type OauthApp = typeof oauthApps.$inferSelect;
export type InsertOauthApp = z.infer<typeof insertOauthAppSchema>;

export const insertOauthCodeSchema = createInsertSchema(oauthCodes).omit({ id: true, createdAt: true });
export type OauthCode = typeof oauthCodes.$inferSelect;
export type InsertOauthCode = z.infer<typeof insertOauthCodeSchema>;

export const insertOauthTokenSchema = createInsertSchema(oauthTokens).omit({ id: true, createdAt: true });
export type OauthToken = typeof oauthTokens.$inferSelect;
export type InsertOauthToken = z.infer<typeof insertOauthTokenSchema>;

export const insertApiRateLimitSchema = createInsertSchema(apiRateLimits).omit({ id: true, createdAt: true });
export type ApiRateLimit = typeof apiRateLimits.$inferSelect;
export type InsertApiRateLimit = z.infer<typeof insertApiRateLimitSchema>;

export const insertApiCallLogSchema = createInsertSchema(apiCallLogs).omit({ id: true, createdAt: true });
export type ApiCallLog = typeof apiCallLogs.$inferSelect;
export type InsertApiCallLog = z.infer<typeof insertApiCallLogSchema>;

export const insertIntegrationSyncJobSchema = createInsertSchema(integrationSyncJobs).omit({ id: true, createdAt: true });
export type IntegrationSyncJob = typeof integrationSyncJobs.$inferSelect;
export type InsertIntegrationSyncJob = z.infer<typeof insertIntegrationSyncJobSchema>;

// === WHITE-LABEL CHURCH PLATFORM ===

// organizations table is now imported from models/auth.ts

export const organizationThemes = pgTable("organization_themes", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  config: jsonb("config").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customPages = pgTable("custom_pages", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  content: text("content"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").default(false),
  showInNav: boolean("show_in_nav").default(false),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customMenuItems = pgTable("custom_menu_items", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  menuLocation: varchar("menu_location", { length: 50 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }),
  pageId: integer("page_id").references(() => customPages.id),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).unique(),
  eventNotifications: boolean("event_notifications").default(true),
  sermonNotifications: boolean("sermon_notifications").default(true),
  prayerNotifications: boolean("prayer_notifications").default(true),
  liveStreamNotifications: boolean("live_stream_notifications").default(true),
  attendanceNotifications: boolean("attendance_notifications").default(true),
  messageNotifications: boolean("message_notifications").default(true),
  groupNotifications: boolean("group_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushNotificationLogs = pgTable("push_notification_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  body: text("body"),
  icon: text("icon"),
  badge: text("badge"),
  tag: text("tag"),
  data: jsonb("data"),
  status: varchar("status", { length: 50 }).default("pending"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  fieldType: varchar("field_type", { length: 50 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  placeholder: varchar("placeholder", { length: 255 }),
  isRequired: boolean("is_required").default(false),
  options: jsonb("options").$type<string[]>(),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).default("member"),
  status: varchar("status", { length: 50 }).default("active"),
  invitedBy: uuid("invited_by"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const organizationSettings = pgTable("organization_settings", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull().unique(),
  settings: jsonb("settings").$type<Record<string, any>>(),
  features: jsonb("features").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customDomains = pgTable("custom_domains", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  sslEnabled: boolean("ssl_enabled").default(false),
  sslCert: varchar("ssl_cert", { length: 500 }),
  sslKey: varchar("ssl_key", { length: 500 }),
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationAnalytics = pgTable("organization_analytics", {
  id: serial("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  metricType: varchar("metric_type", { length: 100 }).notNull(),
  metricValue: real("metric_value").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Relations
export const organizationRelations = relations(organizations, ({ one, many }) => ({
  themes: many(organizationThemes),
  pages: many(customPages),
  members: many(organizationMembers),
  settings: one(organizationSettings),
  customDomains: many(customDomains),
}));

export const organizationThemeRelations = relations(organizationThemes, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationThemes.organizationId],
    references: [organizations.id],
  }),
}));

export const customPageRelations = relations(customPages, ({ one }) => ({
  organization: one(organizations, {
    fields: [customPages.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationMemberRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const organizationSettingRelations = relations(organizationSettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationSettings.organizationId],
    references: [organizations.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true, updatedAt: true });
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export const insertOrganizationThemeSchema = createInsertSchema(organizationThemes).omit({ id: true, createdAt: true, updatedAt: true });
export type OrganizationTheme = typeof organizationThemes.$inferSelect;
export type InsertOrganizationTheme = z.infer<typeof insertOrganizationThemeSchema>;

export const insertCustomPageSchema = createInsertSchema(customPages).omit({ id: true, createdAt: true, updatedAt: true });
export type CustomPage = typeof customPages.$inferSelect;
export type InsertCustomPage = z.infer<typeof insertCustomPageSchema>;

export const insertCustomMenuItemSchema = createInsertSchema(customMenuItems).omit({ id: true, createdAt: true, updatedAt: true });
export type CustomMenuItem = typeof customMenuItems.$inferSelect;
export type InsertCustomMenuItem = z.infer<typeof insertCustomMenuItemSchema>;

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;

export const insertPushNotificationLogSchema = createInsertSchema(pushNotificationLogs).omit({ id: true, createdAt: true });
export type PushNotificationLog = typeof pushNotificationLogs.$inferSelect;
export type InsertPushNotificationLog = z.infer<typeof insertPushNotificationLogSchema>;

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({ id: true, createdAt: true, updatedAt: true });
export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;

export const insertOrganizationMemberSchema = createInsertSchema(organizationMembers).omit({ id: true, joinedAt: true });
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = z.infer<typeof insertOrganizationMemberSchema>;

export const insertOrganizationSettingSchema = createInsertSchema(organizationSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type OrganizationSetting = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSetting = z.infer<typeof insertOrganizationSettingSchema>;

export const insertCustomDomainSchema = createInsertSchema(customDomains).omit({ id: true, createdAt: true, updatedAt: true });
export type CustomDomain = typeof customDomains.$inferSelect;
export type InsertCustomDomain = z.infer<typeof insertCustomDomainSchema>;

export const insertOrganizationAnalyticSchema = createInsertSchema(organizationAnalytics).omit({ id: true, recordedAt: true });
export type OrganizationAnalytic = typeof organizationAnalytics.$inferSelect;
export type InsertOrganizationAnalytic = z.infer<typeof insertOrganizationAnalyticSchema>;
