-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('farmer', 'buyer', 'admin', 'officer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductUnit" AS ENUM ('kg', 'ton');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingStatus" AS ENUM ('draft', 'active', 'sold_out', 'pending_confirmation', 'suspended', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('pending', 'resolved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OtpPurpose" AS ENUM ('login', 'change_phone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingEventType" AS ENUM ('view', 'wa_click');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "farmer_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_name" TEXT NOT NULL,
    "subdistrict" TEXT NOT NULL,
    "address_detail" TEXT NOT NULL,
    "id_card_photo" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "commodities" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "icon" TEXT NOT NULL DEFAULT 'eco',

    CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_listings" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "commodity_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specification_grade" TEXT NOT NULL,
    "quality_param_name" TEXT,
    "quality_param_value" TEXT,
    "price_per_unit" DECIMAL(12,2) NOT NULL,
    "unit" "ProductUnit" NOT NULL DEFAULT 'kg',
    "stock_quantity" DECIMAL(10,2) NOT NULL,
    "min_order" DECIMAL(10,2) NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "last_stock_confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "listing_photos" (
    "id" SERIAL NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "photo_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "price_boards" (
    "id" SERIAL NOT NULL,
    "commodity_id" INTEGER NOT NULL,
    "subdistrict" TEXT NOT NULL,
    "indicated_price" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "effective_date" TIMESTAMP(3) NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "reports" (
    "id" SERIAL NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "otp_codes" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'login',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" SERIAL NOT NULL,
    "actor_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "meta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "listing_events" (
    "id" SERIAL NOT NULL,
    "type" "ListingEventType" NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_number_key" ON "users"("phone_number");
CREATE UNIQUE INDEX IF NOT EXISTS "farmer_profiles_user_id_key" ON "farmer_profiles"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "commodities_name_key" ON "commodities"("name");
CREATE INDEX IF NOT EXISTS "product_listings_status_last_stock_confirmed_at_idx" ON "product_listings"("status", "last_stock_confirmed_at");
CREATE INDEX IF NOT EXISTS "product_listings_commodity_id_status_idx" ON "product_listings"("commodity_id", "status");
CREATE INDEX IF NOT EXISTS "listing_photos_listing_id_idx" ON "listing_photos"("listing_id");
CREATE INDEX IF NOT EXISTS "price_boards_commodity_id_subdistrict_effective_date_idx" ON "price_boards"("commodity_id", "subdistrict", "effective_date");
CREATE INDEX IF NOT EXISTS "reports_listing_id_status_idx" ON "reports"("listing_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "reports_reporter_id_listing_id_key" ON "reports"("reporter_id", "listing_id");
CREATE INDEX IF NOT EXISTS "otp_codes_phone_number_purpose_created_at_idx" ON "otp_codes"("phone_number", "purpose", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");
CREATE INDEX IF NOT EXISTS "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");
CREATE INDEX IF NOT EXISTS "listing_events_listing_id_type_created_at_idx" ON "listing_events"("listing_id", "type", "created_at");
