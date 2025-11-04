CREATE TABLE "purchase_tracker"."products" (
	"productid" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(255),
	"categoryid" uuid
);
--> statement-breakpoint
ALTER TABLE "purchase_tracker"."products" ADD CONSTRAINT "products_categoryid_categories_categoryid_fk" FOREIGN KEY ("categoryid") REFERENCES "purchase_tracker"."categories"("categoryid") ON DELETE no action ON UPDATE no action;