CREATE TABLE "purchase_tracker"."purchase_items" (
	"purchaseitemid" serial NOT NULL,
	"purchaseid" uuid NOT NULL,
	"productid" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	CONSTRAINT "purchase_items_purchaseitemid_purchaseid_pk" PRIMARY KEY("purchaseitemid","purchaseid")
);
--> statement-breakpoint
ALTER TABLE "purchase_tracker"."purchase_items" ADD CONSTRAINT "purchase_items_purchaseid_purchases_purchaseid_fk" FOREIGN KEY ("purchaseid") REFERENCES "purchase_tracker"."purchases"("purchaseid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tracker"."purchase_items" ADD CONSTRAINT "purchase_items_productid_products_productid_fk" FOREIGN KEY ("productid") REFERENCES "purchase_tracker"."products"("productid") ON DELETE no action ON UPDATE no action;