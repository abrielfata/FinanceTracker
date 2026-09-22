CREATE TABLE IF NOT EXISTS "saving_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nama" text NOT NULL,
	"target_nominal" bigint NOT NULL,
	"terkumpul_nominal" bigint DEFAULT 0 NOT NULL,
	"target_bulan" text,
	"kategori" text DEFAULT 'Tabungan' NOT NULL,
	"warna" text DEFAULT '#2B6CB0' NOT NULL,
	"ikon" text DEFAULT 'savings' NOT NULL,
	"catatan" text,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saving_goals" ADD CONSTRAINT "saving_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
