CREATE TABLE IF NOT EXISTS "budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kategori" text NOT NULL,
	"nominal" bigint NOT NULL,
	"bulan" integer NOT NULL,
	"tahun" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "budget_user_id_kategori_bulan_tahun_unique" UNIQUE("user_id","kategori","bulan","tahun")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tagihan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nama" text NOT NULL,
	"nominal" bigint NOT NULL,
	"tanggal_jatuh_tempo" integer NOT NULL,
	"kategori" text DEFAULT 'Lainnya' NOT NULL,
	"catatan" text,
	"is_berulang" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tagihan_bulan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tagihan_id" uuid,
	"user_id" uuid NOT NULL,
	"bulan" integer NOT NULL,
	"tahun" integer NOT NULL,
	"status" text DEFAULT 'belum_lunas' NOT NULL,
	"tanggal_bayar" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tagihan_bulan_tagihan_id_bulan_tahun_unique" UNIQUE("tagihan_id","bulan","tahun")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaksi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"jenis" text NOT NULL,
	"nominal" bigint NOT NULL,
	"kategori" text NOT NULL,
	"deskripsi" text,
	"tanggal" date DEFAULT CURRENT_DATE NOT NULL,
	"tagihan_bulan_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"siklus_tgl" integer DEFAULT 26 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tagihan_bulan" ADD CONSTRAINT "tagihan_bulan_tagihan_id_tagihan_id_fk" FOREIGN KEY ("tagihan_id") REFERENCES "public"."tagihan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tagihan_bulan" ADD CONSTRAINT "tagihan_bulan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_tagihan_bulan_id_tagihan_bulan_id_fk" FOREIGN KEY ("tagihan_bulan_id") REFERENCES "public"."tagihan_bulan"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_tanggal_idx" ON "transaksi" USING btree ("user_id","tanggal");