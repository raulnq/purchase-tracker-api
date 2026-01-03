CREATE SCHEMA IF NOT EXISTS "purchase_tracker";

CREATE TABLE "purchase_tracker"."categories" (
	"categoryid" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_tracker"."products" (
	"productid" uuid PRIMARY KEY NOT NULL,
	"name" varchar(1024) NOT NULL,
	"categoryid" uuid
);
--> statement-breakpoint
CREATE TABLE "purchase_tracker"."purchase_items" (
	"purchaseitemid" serial NOT NULL,
	"purchaseid" uuid NOT NULL,
	"productid" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar(32) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	CONSTRAINT "purchase_items_purchaseitemid_purchaseid_pk" PRIMARY KEY("purchaseitemid","purchaseid")
);
--> statement-breakpoint
CREATE TABLE "purchase_tracker"."purchases" (
	"purchaseid" uuid PRIMARY KEY NOT NULL,
	"storeid" uuid NOT NULL,
	"date" date NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_tracker"."stores" (
	"storeid" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_tracker"."products" ADD CONSTRAINT "products_categoryid_categories_categoryid_fk" FOREIGN KEY ("categoryid") REFERENCES "purchase_tracker"."categories"("categoryid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tracker"."purchase_items" ADD CONSTRAINT "purchase_items_purchaseid_purchases_purchaseid_fk" FOREIGN KEY ("purchaseid") REFERENCES "purchase_tracker"."purchases"("purchaseid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tracker"."purchase_items" ADD CONSTRAINT "purchase_items_productid_products_productid_fk" FOREIGN KEY ("productid") REFERENCES "purchase_tracker"."products"("productid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tracker"."purchases" ADD CONSTRAINT "purchases_storeid_stores_storeid_fk" FOREIGN KEY ("storeid") REFERENCES "purchase_tracker"."stores"("storeid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "purchase_tracker"."products" USING btree ("categoryid");--> statement-breakpoint
CREATE INDEX "idx_purchase_items_purchase_id" ON "purchase_tracker"."purchase_items" USING btree ("purchaseid");--> statement-breakpoint
CREATE INDEX "idx_purchase_items_product_id" ON "purchase_tracker"."purchase_items" USING btree ("productid");--> statement-breakpoint
CREATE INDEX "idx_purchases_store_id" ON "purchase_tracker"."purchases" USING btree ("storeid");--> statement-breakpoint
CREATE INDEX "idx_purchases_date" ON "purchase_tracker"."purchases" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_purchases_store_date" ON "purchase_tracker"."purchases" USING btree ("storeid","date");