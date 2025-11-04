CREATE TABLE "purchase_tracker"."purchases" (
	"purchaseid" uuid PRIMARY KEY NOT NULL,
	"storeid" uuid NOT NULL,
	"date" date NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_tracker"."purchases" ADD CONSTRAINT "purchases_storeid_stores_storeid_fk" FOREIGN KEY ("storeid") REFERENCES "purchase_tracker"."stores"("storeid") ON DELETE no action ON UPDATE no action;