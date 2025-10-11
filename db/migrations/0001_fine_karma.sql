CREATE TYPE "public"."submission_status" AS ENUM('pending', 'approved', 'rejected');

CREATE TABLE "submitted_opportunities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "status" "submission_status" DEFAULT 'pending' NOT NULL,
  "submitter_name" text NOT NULL,
  "submitter_email" text NOT NULL,
  "submitter_role" text NOT NULL,
  "organization_name" text NOT NULL,
  "contact_name" text,
  "contact_email" text NOT NULL,
  "contact_phone" text,
  "opportunity_title" text NOT NULL,
  "opportunity_description" text,
  "location_address" text NOT NULL,
  "city" text,
  "shift_dates" text NOT NULL,
  "expected_hours" numeric,
  "capacity" integer,
  "additional_notes" text,
  "reviewer_id" uuid,
  "review_notes" text,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "submitted_opportunities"
  ADD CONSTRAINT "submitted_opportunities_reviewer_id_profiles_id_fk"
  FOREIGN KEY ("reviewer_id")
  REFERENCES "public"."profiles"("id")
  ON DELETE SET NULL
  ON UPDATE NO ACTION;
