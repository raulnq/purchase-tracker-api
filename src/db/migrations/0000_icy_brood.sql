CREATE SCHEMA IF NOT EXISTS "purchase_tracker";
CREATE TABLE "purchase_tracker"."stores" (
	"storeid" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
