import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// User table
export const users = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    username: text(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
    role: text().default("user").notNull(),
    displayUsername: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ mode: "string" }),
    stripeCustomerId: text(),
  },
  (table) => [
    unique("user_username_unique").on(table.username),
    unique("user_email_unique").on(table.email),
  ]
);

// Verification table
export const verification = pgTable("verification", {
  id: text("id").primaryKey().notNull(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// Sites table
export const sites = pgTable("sites", {
  siteId: serial("site_id").primaryKey().notNull(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  organizationId: text("organization_id").references(() => organization.id),
});

// Active sessions table
export const activeSessions = pgTable("active_sessions", {
  sessionId: text("session_id").primaryKey().notNull(),
  siteId: integer("site_id"),
  userId: text("user_id"),
  hostname: text("hostname"),
  startTime: timestamp("start_time").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
  pageviews: integer("pageviews").default(0),
  entryPage: text("entry_page"),
  exitPage: text("exit_page"),
  deviceType: text("device_type"),
  screenWidth: integer("screen_width"),
  screenHeight: integer("screen_height"),
  browser: text("browser"),
  operatingSystem: text("operating_system"),
  language: text("language"),
  referrer: text("referrer"),
});

export const reports = pgTable("reports", {
  reportId: serial("report_id").primaryKey().notNull(),
  siteId: integer("site_id").references(() => sites.siteId),
  userId: text("user_id").references(() => users.id),
  reportType: text("report_type"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Account table
export const account = pgTable("account", {
  id: text("id").primaryKey().notNull(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

// Organization table
export const organization = pgTable("organization", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("createdAt").notNull(),
  metadata: text("metadata"),
});

// Member table
export const member = pgTable("member", {
  id: text("id").primaryKey().notNull(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

// Invitation table
export const invitation = pgTable("invitation", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  inviterId: text("inviterId")
    .notNull()
    .references(() => users.id),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id),
  role: text("role").notNull(),
  status: text("status").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

// Session table
export const session = pgTable("session", {
  id: text("id").primaryKey().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  impersonatedBy: text("impersonatedBy"),
  activeOrganizationId: text("activeOrganizationId"),
});

// Subscription table
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey().notNull(),
  plan: text("plan").notNull(),
  referenceId: text("referenceId").notNull(),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  status: text("status").notNull(),
  periodStart: timestamp("periodStart", { mode: "string" }),
  periodEnd: timestamp("periodEnd", { mode: "string" }),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd"),
  seats: integer("seats"),
  trialStart: timestamp("trialStart", { mode: "string" }),
  trialEnd: timestamp("trialEnd", { mode: "string" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
