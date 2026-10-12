CREATE TYPE "public"."country" AS ENUM('BR', 'PT');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('BRL', 'EUR');--> statement-breakpoint
CREATE TYPE "public"."entity_group" AS ENUM('companies', 'personal', 'properties');--> statement-breakpoint
CREATE TYPE "public"."entry_kind" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."entry_source" AS ENUM('manual', 'recurring', 'invoice', 'movement', 'import');--> statement-breakpoint
CREATE TYPE "public"."entry_status" AS ENUM('pending', 'settled', 'cancelled');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"entity_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"group" "entity_group" NOT NULL,
	"country" "country" NOT NULL,
	"currency" "currency" NOT NULL,
	"color" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"currency" "currency" NOT NULL,
	"cost_center_id" text NOT NULL,
	"category_id" text NOT NULL,
	"kind" "entry_kind" NOT NULL,
	"description" text NOT NULL,
	"due_date" date NOT NULL,
	"period" text NOT NULL,
	"amount_cents" bigint,
	"expected_cents" bigint,
	"status" "entry_status" NOT NULL,
	"settled_on" date,
	"notes" text DEFAULT '' NOT NULL,
	"link_group" uuid,
	"source" "entry_source" NOT NULL,
	"recurring_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"cost_center_id" text NOT NULL,
	"category_id" text NOT NULL,
	"kind" "entry_kind" NOT NULL,
	"description" text NOT NULL,
	"day_of_month" smallint,
	"expected_cents" bigint,
	"months" smallint[],
	"manual" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"property_initial_cash_cents" bigint DEFAULT 0 NOT NULL,
	"company_pt_initial_cash_cents" bigint DEFAULT 0 NOT NULL,
	"daily_rate_cents" bigint NOT NULL,
	"vat_rate" numeric(5, 4) NOT NULL,
	CONSTRAINT "settings_single_row" CHECK ("settings"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_cost_center_id_cost_centers_id_fk" FOREIGN KEY ("cost_center_id") REFERENCES "public"."cost_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_recurring_id_recurring_templates_id_fk" FOREIGN KEY ("recurring_id") REFERENCES "public"."recurring_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_cost_center_id_cost_centers_id_fk" FOREIGN KEY ("cost_center_id") REFERENCES "public"."cost_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entries_entity_period_idx" ON "entries" USING btree ("entity_id","period");--> statement-breakpoint
CREATE INDEX "entries_status_idx" ON "entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "entries_link_group_idx" ON "entries" USING btree ("link_group");--> statement-breakpoint
CREATE UNIQUE INDEX "entries_recurring_period_uq" ON "entries" USING btree ("recurring_id","period");