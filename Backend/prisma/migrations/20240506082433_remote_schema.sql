
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."Folder" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "userId" "text",
    "private" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."Folder" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Link" (
    "id" "text" NOT NULL,
    "userId" "text",
    "folderId" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    "bookmarked" boolean NOT NULL,
    "remind" timestamp(3) without time zone,
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "trash" boolean DEFAULT false,
    "thumbnail" "text"
);

ALTER TABLE "public"."Link" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Session" (
    "id" "text" NOT NULL,
    "sid" "text" NOT NULL,
    "data" "text" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);

ALTER TABLE "public"."Session" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Share" (
    "id" integer NOT NULL,
    "userId" "text",
    "public" boolean DEFAULT false NOT NULL,
    "folderId" "text" NOT NULL,
    "password" "text"
);

ALTER TABLE "public"."Share" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."Share_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."Share_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."Share_id_seq" OWNED BY "public"."Share"."id";

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "text" NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "password" "text" NOT NULL,
    "creationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "otp" "text",
    "otpExpiresAt" timestamp(3) without time zone,
    "otpVerified" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."User" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."UserSettings" (
    "id" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "previews" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."UserSettings" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);

ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tempUser" (
    "id" "text" NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "password" "text" NOT NULL,
    "otp" "text",
    "otpExpiresAt" timestamp(3) without time zone
);

ALTER TABLE "public"."tempUser" OWNER TO "postgres";

ALTER TABLE ONLY "public"."Share" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Share_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."Folder"
    ADD CONSTRAINT "Folder_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Link"
    ADD CONSTRAINT "Link_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Share"
    ADD CONSTRAINT "Share_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."UserSettings"
    ADD CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tempUser"
    ADD CONSTRAINT "tempUser_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "Session_sid_key" ON "public"."Session" USING "btree" ("sid");

CREATE UNIQUE INDEX "Share_folderId_key" ON "public"."Share" USING "btree" ("folderId");

CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings" USING "btree" ("userId");

CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING "btree" ("email");

CREATE UNIQUE INDEX "User_username_key" ON "public"."User" USING "btree" ("username");

CREATE UNIQUE INDEX "tempUser_email_key" ON "public"."tempUser" USING "btree" ("email");

CREATE UNIQUE INDEX "tempUser_username_key" ON "public"."tempUser" USING "btree" ("username");

ALTER TABLE ONLY "public"."Folder"
    ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Link"
    ADD CONSTRAINT "Link_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Link"
    ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Share"
    ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Share"
    ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."UserSettings"
    ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "Enable read access for all users" ON "public"."Link" FOR SELECT USING (true);

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."Folder" TO "service_role";

GRANT ALL ON TABLE "public"."Link" TO "service_role";

GRANT ALL ON TABLE "public"."Session" TO "service_role";

GRANT ALL ON TABLE "public"."Share" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Share_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."User" TO "service_role";

GRANT ALL ON TABLE "public"."UserSettings" TO "service_role";

GRANT ALL ON TABLE "public"."_prisma_migrations" TO "service_role";

GRANT ALL ON TABLE "public"."tempUser" TO "service_role";

RESET ALL;
