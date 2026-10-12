ALTER TABLE "entries" DROP CONSTRAINT "entries_cost_center_id_cost_centers_id_fk";--> statement-breakpoint
ALTER TABLE "entries" DROP CONSTRAINT "entries_category_id_categories_id_fk";--> statement-breakpoint
ALTER TABLE "recurring_templates" DROP CONSTRAINT "recurring_templates_cost_center_id_cost_centers_id_fk";--> statement-breakpoint
ALTER TABLE "recurring_templates" DROP CONSTRAINT "recurring_templates_category_id_categories_id_fk";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey";--> statement-breakpoint
ALTER TABLE "cost_centers" DROP CONSTRAINT "cost_centers_pkey";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "entity_id" text;--> statement-breakpoint
-- Categorias e centros partilhados passam a ser copiados só para as entidades que os usam;
-- as listas base de cada entidade são repostas pelo seed no arranque.
INSERT INTO "categories" ("entity_id", "id", "name")
SELECT DISTINCT u.entity_id, c.id, c.name
FROM "categories" c
JOIN (
  SELECT entity_id, category_id FROM "entries"
  UNION SELECT entity_id, category_id FROM "recurring_templates"
) u ON u.category_id = c.id
WHERE c.entity_id IS NULL;--> statement-breakpoint
DELETE FROM "categories" WHERE "entity_id" IS NULL;--> statement-breakpoint
INSERT INTO "cost_centers" ("entity_id", "id", "name", "sort_order")
SELECT DISTINCT u.entity_id, c.id, c.name, c.sort_order
FROM "cost_centers" c
JOIN (
  SELECT entity_id, cost_center_id FROM "entries"
  UNION SELECT entity_id, cost_center_id FROM "recurring_templates"
) u ON u.cost_center_id = c.id
WHERE c.entity_id IS NULL;--> statement-breakpoint
DELETE FROM "cost_centers" WHERE "entity_id" IS NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "entity_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cost_centers" ALTER COLUMN "entity_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_entity_id_id_pk" PRIMARY KEY("entity_id","id");--> statement-breakpoint
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_entity_id_id_pk" PRIMARY KEY("entity_id","id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_cost_center_fk" FOREIGN KEY ("entity_id","cost_center_id") REFERENCES "public"."cost_centers"("entity_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_category_fk" FOREIGN KEY ("entity_id","category_id") REFERENCES "public"."categories"("entity_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_cost_center_fk" FOREIGN KEY ("entity_id","cost_center_id") REFERENCES "public"."cost_centers"("entity_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_category_fk" FOREIGN KEY ("entity_id","category_id") REFERENCES "public"."categories"("entity_id","id") ON DELETE no action ON UPDATE no action;
