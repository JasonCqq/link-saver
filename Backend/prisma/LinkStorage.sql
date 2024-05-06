--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Ubuntu 15.4-1.pgdg22.04+1)
-- Dumped by pg_dump version 15.4 (Ubuntu 15.4-1.pgdg22.04+1)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: jason1
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO jason1;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: jason1
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Folder; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."Folder" (
    id text NOT NULL,
    name text NOT NULL,
    "userId" text,
    private boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Folder" OWNER TO jason1;

--
-- Name: Link; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."Link" (
    id text NOT NULL,
    "userId" text,
    url text NOT NULL,
    "folderId" text,
    title text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    bookmarked boolean NOT NULL,
    thumbnail bytea NOT NULL,
    remind timestamp(3) without time zone,
    trash boolean DEFAULT false
);


ALTER TABLE public."Link" OWNER TO jason1;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    sid text NOT NULL,
    data text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO jason1;

--
-- Name: Share; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."Share" (
    id integer NOT NULL,
    "userId" text,
    public boolean DEFAULT false NOT NULL,
    "folderId" text NOT NULL,
    password text
);


ALTER TABLE public."Share" OWNER TO jason1;

--
-- Name: Share_id_seq; Type: SEQUENCE; Schema: public; Owner: jason1
--

CREATE SEQUENCE public."Share_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Share_id_seq" OWNER TO jason1;

--
-- Name: Share_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jason1
--

ALTER SEQUENCE public."Share_id_seq" OWNED BY public."Share".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "creationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    otp text,
    "otpVerified" boolean DEFAULT false NOT NULL,
    "otpExpiresAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO jason1;

--
-- Name: UserSettings; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."UserSettings" (
    id text NOT NULL,
    "userId" text NOT NULL,
    previews boolean DEFAULT true NOT NULL
);


ALTER TABLE public."UserSettings" OWNER TO jason1;

--
-- Name: tempUser; Type: TABLE; Schema: public; Owner: jason1
--

CREATE TABLE public."tempUser" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    otp text,
    "otpExpiresAt" timestamp(3) without time zone
);


ALTER TABLE public."tempUser" OWNER TO jason1;

--
-- Name: Share id; Type: DEFAULT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Share" ALTER COLUMN id SET DEFAULT nextval('public."Share_id_seq"'::regclass);


--
-- Data for Name: Folder; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."Folder" (id, name, "userId", private) FROM stdin;
38bda8a7-eb73-48b3-8b38-ecfbcea267af	Default	27471540-7224-4ce7-a22d-139aab4c93ba	t
\.


--
-- Data for Name: Link; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."Link" (id, "userId", url, "folderId", title, "createdAt", "updatedAt", bookmarked, thumbnail, remind, trash) FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."Session" (id, sid, data, "expiresAt") FROM stdin;
x-cdhY6QbH5V48vbssEqKKXH6V1pNkRg	x-cdhY6QbH5V48vbssEqKKXH6V1pNkRg	{"cookie":{"originalMaxAge":604800000,"expires":"2024-05-13T03:14:54.052Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":"27471540-7224-4ce7-a22d-139aab4c93ba","username":"jason","email":"jason.cq.huang@gmail.com","creationDate":"2024-05-06T03:14:22.385Z"}}	2024-05-13 03:14:54.052
18SLR9GBfgKpVaZUZwDVFiY1IcZ6HwC3	18SLR9GBfgKpVaZUZwDVFiY1IcZ6HwC3	{"cookie":{"originalMaxAge":604800000,"expires":"2024-05-13T08:04:35.142Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":"27471540-7224-4ce7-a22d-139aab4c93ba","username":"jason","email":"jason.cq.huang@gmail.com","creationDate":"2024-05-06T03:14:22.385Z"}}	2024-05-13 08:04:35.142
\.


--
-- Data for Name: Share; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."Share" (id, "userId", public, "folderId", password) FROM stdin;
24	27471540-7224-4ce7-a22d-139aab4c93ba	f	38bda8a7-eb73-48b3-8b38-ecfbcea267af	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."User" (id, username, email, password, "creationDate", otp, "otpVerified", "otpExpiresAt") FROM stdin;
27471540-7224-4ce7-a22d-139aab4c93ba	jason	jason.cq.huang@gmail.com	$2b$10$D/U9m756x45vNGe3sHYEJ.aK0vPA/goE3wsZ2m5qUdfUrh82ESnN.	2024-05-06 03:14:22.385	\N	f	\N
\.


--
-- Data for Name: UserSettings; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."UserSettings" (id, "userId", previews) FROM stdin;
a6c34987-e742-4988-a188-1d68cdfa3b15	27471540-7224-4ce7-a22d-139aab4c93ba	t
\.


--
-- Data for Name: tempUser; Type: TABLE DATA; Schema: public; Owner: jason1
--

COPY public."tempUser" (id, username, email, password, otp, "otpExpiresAt") FROM stdin;
\.


--
-- Name: Share_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jason1
--

SELECT pg_catalog.setval('public."Share_id_seq"', 24, true);


--
-- Name: Folder Folder_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Folder"
    ADD CONSTRAINT "Folder_pkey" PRIMARY KEY (id);


--
-- Name: Link Link_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Link"
    ADD CONSTRAINT "Link_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Share Share_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_pkey" PRIMARY KEY (id);


--
-- Name: UserSettings UserSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."UserSettings"
    ADD CONSTRAINT "UserSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: tempUser tempUser_pkey; Type: CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."tempUser"
    ADD CONSTRAINT "tempUser_pkey" PRIMARY KEY (id);


--
-- Name: Session_sid_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "Session_sid_key" ON public."Session" USING btree (sid);


--
-- Name: Share_folderId_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "Share_folderId_key" ON public."Share" USING btree ("folderId");


--
-- Name: UserSettings_userId_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "UserSettings_userId_key" ON public."UserSettings" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: tempUser_email_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "tempUser_email_key" ON public."tempUser" USING btree (email);


--
-- Name: tempUser_username_key; Type: INDEX; Schema: public; Owner: jason1
--

CREATE UNIQUE INDEX "tempUser_username_key" ON public."tempUser" USING btree (username);


--
-- Name: Folder Folder_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Folder"
    ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Link Link_folderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Link"
    ADD CONSTRAINT "Link_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES public."Folder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Link Link_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Link"
    ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Share Share_folderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES public."Folder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Share Share_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSettings UserSettings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jason1
--

ALTER TABLE ONLY public."UserSettings"
    ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: jason1
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

