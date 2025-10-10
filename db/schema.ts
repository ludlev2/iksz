import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const profileRole = pgEnum('profile_role', [
  'student',
  'teacher',
  'organization_admin',
]);

export const applicationStatus = pgEnum('application_status', [
  'pending',
  'approved',
  'waitlisted',
  'rejected',
  'cancelled',
]);

export const hourLogStatus = pgEnum('hour_log_status', [
  'draft',
  'submitted',
  'approved',
  'rejected',
]);

export const shiftStatus = pgEnum('shift_status', [
  'draft',
  'published',
  'closed',
]);

export const documentType = pgEnum('document_type', [
  'parental_consent',
  'agreement',
  'other',
]);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: profileRole('role').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const schools = pgTable('schools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  district: text('district'),
  contactEmail: text('contact_email'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const studentProfiles = pgTable('student_profiles', {
  profileId: uuid('profile_id')
    .primaryKey()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  schoolId: uuid('school_id').references(() => schools.id, {
    onDelete: 'set null',
  }),
  grade: integer('grade'),
  targetHours: integer('target_hours').default(50).notNull(),
  emergencyContact: jsonb('emergency_contact'),
  birthDate: timestamp('birth_date'),
  preferences: jsonb('preferences'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const teacherAssignments = pgTable(
  'teacher_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    teacherId: uuid('teacher_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    schoolId: uuid('school_id')
      .references(() => schools.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    teacherSchoolUnique: uniqueIndex('teacher_school_unique').on(
      table.teacherId,
      table.schoolId,
    ),
  }),
);

export const organizationProfiles = pgTable(
  'organization_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    website: text('website'),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    city: text('city'),
    lat: numeric('lat', 10, 6),
    lng: numeric('lng', 10, 6),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('organization_slug_idx').on(table.slug),
  }),
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    profileId: uuid('profile_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizationProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    role: profileRole('role').default('organization_admin').notNull(),
    invitedBy: uuid('invited_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.profileId, table.organizationId],
    }),
  }),
);

export const opportunityCategories = pgTable(
  'opportunity_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    labelHu: text('label_hu').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('opportunity_category_slug_idx').on(table.slug),
  }),
);

export const opportunities = pgTable('opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizationProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  shortDescription: text('short_description'),
  description: text('description'),
  categoryId: uuid('category_id').references(() => opportunityCategories.id, {
    onDelete: 'set null',
  }),
  tags: text('tags').array(),
  address: text('address'),
  city: text('city'),
  lat: numeric('lat', 10, 6),
  lng: numeric('lng', 10, 6),
  minGrade: integer('min_grade'),
  maxGrade: integer('max_grade'),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdBy: uuid('created_by')
    .references(() => profiles.id, { onDelete: 'set null' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const opportunityShifts = pgTable('opportunity_shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  opportunityId: uuid('opportunity_id')
    .references(() => opportunities.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title'),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  hoursAwarded: numeric('hours_awarded', 5, 2).notNull(),
  capacity: integer('capacity').notNull(),
  status: shiftStatus('status').default('draft').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const studentApplications = pgTable(
  'student_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    shiftId: uuid('shift_id')
      .references(() => opportunityShifts.id, { onDelete: 'cascade' })
      .notNull(),
    status: applicationStatus('status').default('pending').notNull(),
    motivation: text('motivation'),
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    respondedBy: uuid('responded_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    metadata: jsonb('metadata'),
  },
  (table) => ({
    uniqueStudentShift: uniqueIndex('student_shift_unique').on(
      table.studentId,
      table.shiftId,
    ),
  }),
);

export const hourLogs = pgTable('hour_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  shiftId: uuid('shift_id').references(() => opportunityShifts.id, {
    onDelete: 'set null',
  }),
  applicationId: uuid('application_id').references(
    () => studentApplications.id,
    { onDelete: 'set null' },
  ),
  teacherId: uuid('teacher_id').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
  durationHours: numeric('duration_hours', 6, 2).notNull(),
  status: hourLogStatus('status').default('draft').notNull(),
  notes: text('notes'),
  proofUrl: text('proof_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  rejectionReason: text('rejection_reason'),
  signatureMetadata: jsonb('signature_metadata'),
});

export const favorites = pgTable(
  'favorites',
  {
    studentId: uuid('student_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    opportunityId: uuid('opportunity_id')
      .references(() => opportunities.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.studentId, table.opportunityId],
    }),
  }),
);

export const documentTemplates = pgTable('document_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: documentType('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  filePath: text('file_path').notNull(),
  createdBy: uuid('created_by').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const studentDocuments = pgTable('student_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  templateId: uuid('template_id').references(() => documentTemplates.id, {
    onDelete: 'set null',
  }),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id, {
    onDelete: 'set null',
  }),
  filePath: text('file_path').notNull(),
  status: text('status').default('draft').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
