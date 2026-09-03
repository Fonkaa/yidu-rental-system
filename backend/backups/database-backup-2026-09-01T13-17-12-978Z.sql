--
-- PostgreSQL database dump
--

\restrict cukXLWi5qlCG35W56b1E82VGxZWcIJlWooSyAe5DmuqMRFW2VyaelklI8aSykld

-- Dumped from database version 18.6 (c5250a2)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: LeaseStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeaseStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'TERMINATED'
);


--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'UNAVAILABLE',
    'RENTED',
    'EXPIRED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);


--
-- Name: RentalRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RentalRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'TENANT',
    'LANDLORD',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: CommissionSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CommissionSetting" (
    id text NOT NULL,
    "ratePercent" double precision DEFAULT 10 NOT NULL,
    "updatedByAdminId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "propertyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Lease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lease" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "propertyId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "rentAmount" double precision NOT NULL,
    status public."LeaseStatus" DEFAULT 'ACTIVE'::public."LeaseStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Location" (
    id text NOT NULL,
    city text NOT NULL,
    "subCity" text,
    "kebeleOrWoreda" text,
    region text
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    "propertyId" text,
    text text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "relatedEntityType" text,
    "relatedEntityId" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "leaseId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "commissionAmount" numeric(10,2) NOT NULL,
    "gatewayTransactionId" text,
    method text DEFAULT 'Telebirr'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Property; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    "titleEn" text NOT NULL,
    "titleAm" text,
    "descriptionEn" text NOT NULL,
    "descriptionAm" text,
    price double precision NOT NULL,
    rooms integer NOT NULL,
    furnished boolean DEFAULT false NOT NULL,
    "landmarkDescription" text,
    "gpsLat" double precision,
    "gpsLng" double precision,
    status public."ListingStatus" DEFAULT 'PENDING'::public."ListingStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "landlordId" text NOT NULL,
    "categoryId" text NOT NULL,
    "locationId" text NOT NULL,
    "rejectionReason" text
);


--
-- Name: PropertyImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PropertyImage" (
    id text NOT NULL,
    url text NOT NULL,
    "propertyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RentalRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RentalRequest" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "propertyId" text NOT NULL,
    message text,
    status public."RentalRequestStatus" DEFAULT 'PENDING'::public."RentalRequestStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "landlordId" text NOT NULL,
    "proposedPrice" double precision,
    "startDate" timestamp(3) without time zone
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    phone text,
    role public."Role" DEFAULT 'TENANT'::public."Role" NOT NULL,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "familyNumber" integer,
    "faydaNumber" text,
    gender text,
    "maritalStatus" text,
    "otpCode" text,
    "otpExpiry" timestamp(3) without time zone,
    "faydaBackImage" text,
    "faydaFrontImage" text
);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, description) FROM stdin;
villa	Villa	\N
apartment	Apartment	\N
house	House	\N
\.


--
-- Data for Name: CommissionSetting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CommissionSetting" (id, "ratePercent", "updatedByAdminId", "updatedAt") FROM stdin;
febc0455-0768-4ce3-befe-41684422645c	10	\N	2026-08-22 04:42:00.366
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Favorite" (id, "userId", "propertyId", "createdAt") FROM stdin;
35fdacba-4627-4f29-a9ff-9847c27613f4	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	2026-08-27 10:37:46.646
ccea0577-caca-4948-983d-1cd417ec2c42	29f7e681-e9db-45e1-8b37-330acf4a92a8	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	2026-08-27 10:46:16.854
95ea120d-e82e-4e1b-ac34-8a23b66fc668	8c2d09f5-f305-4b47-9eb5-c48ddca97552	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	2026-08-28 11:34:00.332
\.


--
-- Data for Name: Lease; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lease" (id, "tenantId", "propertyId", "startDate", "endDate", "rentAmount", status, "createdAt", "updatedAt") FROM stdin;
83c3efb9-1312-486b-a44b-252dc00ffb8d	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 00:00:00	2026-08-24 00:00:00	1000	EXPIRED	2026-08-24 08:14:33.033	2026-08-24 08:15:10.406
bd5881bc-2c82-403a-93c4-f2e3d265f165	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 00:00:00	2026-08-24 00:00:00	1000	EXPIRED	2026-08-24 08:18:06.544	2026-08-24 08:18:55.175
fbec1012-43df-4c01-9c65-693efdaec7b7	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 00:00:00	2026-08-24 00:00:00	800	EXPIRED	2026-08-24 08:31:47.377	2026-08-24 08:32:12.463
251f7a05-c9ec-496e-ac1b-4bee5adc23c2	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 00:00:00	2026-08-24 00:00:00	600	EXPIRED	2026-08-24 08:46:17.47	2026-08-24 08:47:00.476
bdbe8ab1-934f-4643-9f24-49d502b9ff39	8c2d09f5-f305-4b47-9eb5-c48ddca97552	6919c6ab-0ca7-4472-b705-1ef5825bbbdf	2026-08-24 00:00:00	2026-08-26 00:00:00	2000	EXPIRED	2026-08-24 11:11:45.591	2026-08-26 06:10:30.996
9966c22c-1898-4762-89d0-d65f1606590f	8c2d09f5-f305-4b47-9eb5-c48ddca97552	6919c6ab-0ca7-4472-b705-1ef5825bbbdf	2026-08-24 00:00:00	2026-08-26 00:00:00	2000	EXPIRED	2026-08-24 11:14:27.485	2026-08-26 06:10:30.996
9ba4d263-3c08-4408-b988-dafdcb24ec11	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 00:00:00	2026-08-25 00:00:00	1200	EXPIRED	2026-08-24 08:54:23.775	2026-08-25 05:28:30.592
56560914-6f23-41ce-9566-45d05db82ea6	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 00:00:00	2026-08-25 00:00:00	1200	EXPIRED	2026-08-24 11:12:29.317	2026-08-25 05:28:30.592
90487799-312a-4f4b-b8ac-2a2b4944bfda	8c2d09f5-f305-4b47-9eb5-c48ddca97552	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-24 00:00:00	2026-08-25 00:00:00	3000	EXPIRED	2026-08-24 13:28:43.125	2026-08-25 05:28:30.592
20989477-7219-43f7-a220-5871d130ce2d	8c2d09f5-f305-4b47-9eb5-c48ddca97552	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-24 00:00:00	2026-08-25 00:00:00	3000	EXPIRED	2026-08-24 13:33:54.731	2026-08-25 05:28:30.592
adc612eb-6b35-43d6-96fd-7f18726aca19	8c2d09f5-f305-4b47-9eb5-c48ddca97552	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-24 00:00:00	2026-08-25 00:00:00	3000	EXPIRED	2026-08-24 13:37:02.471	2026-08-25 05:28:30.592
ae44727f-b800-4e5c-8bcc-954e57a0e664	8c2d09f5-f305-4b47-9eb5-c48ddca97552	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-24 00:00:00	2026-08-25 00:00:00	3000	EXPIRED	2026-08-24 13:40:24.122	2026-08-25 05:28:30.592
b913543a-9abe-4d7e-a7cb-5acd32841db1	8c2d09f5-f305-4b47-9eb5-c48ddca97552	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-24 00:00:00	2026-08-25 00:00:00	3000	EXPIRED	2026-08-24 13:40:37.244	2026-08-25 05:28:30.592
b2bc8b82-7b1d-47b3-84c8-77b0ee96c720	8c2d09f5-f305-4b47-9eb5-c48ddca97552	f9774764-1f8f-4347-b990-965e169b523a	2026-08-26 00:00:00	2026-09-03 00:00:00	2500	ACTIVE	2026-08-26 08:25:17.497	2026-08-26 08:25:20.329
512a3e4b-b241-4437-b83c-a2cddb62abfa	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 05:46:06.902	2026-08-27 11:07:49.355
9758e7aa-4d29-4e94-aed5-1feb69877861	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 05:50:56.483	2026-08-27 11:07:49.355
57903093-e9f9-4b67-b66f-41c2cb8358cd	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 05:53:25.562	2026-08-27 11:07:49.355
2e0d60a8-033c-429a-9428-46ddfccc5ba3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 05:56:48.136	2026-08-27 11:07:49.355
3c2899b9-9e6d-424e-ba97-a3cbeef95454	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:00:13.956	2026-08-27 11:07:49.355
367e1bac-fbde-47f9-abda-bcc247a62c0b	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:00:42.915	2026-08-27 11:07:49.355
d580258a-bb66-4e30-a04f-e0c89f270f5f	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:05:43.258	2026-08-27 11:07:49.355
ad15a1a4-cbe4-4e92-92b7-ae4f05c5e2e8	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:10:05.588	2026-08-27 11:07:49.355
a6c60fde-ffdb-4593-a38d-9cd9f37d3f1c	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:10:55.371	2026-08-27 11:07:49.355
036f6155-403c-4708-a0fd-de9a6893785a	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:14:25.365	2026-08-27 11:07:49.355
20cae39d-8a9a-4cc0-852b-c7fb44c0ffb5	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:16:14.638	2026-08-27 11:07:49.355
e63ba1ec-c6c6-496f-ae6a-401507af5477	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:20:50.584	2026-08-27 11:07:49.355
b9401184-8583-481e-a2e3-626a6e069b08	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-21 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-24 06:24:39.958	2026-08-27 11:07:49.355
4f7f6957-4a92-461c-81c7-ce3f1f289ce1	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-28 00:00:00	2026-09-05 00:00:00	1000	ACTIVE	2026-08-28 08:02:32.762	2026-08-28 08:02:32.762
c2c46429-2efe-434e-9145-85042314de4d	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-28 00:00:00	2026-09-05 00:00:00	1000	ACTIVE	2026-08-28 08:08:20.152	2026-08-28 08:08:23.322
7053a218-8e77-4436-98cd-19172cf90c67	8c2d09f5-f305-4b47-9eb5-c48ddca97552	b521bb29-4b4c-443d-8a15-24707ac1a9b2	2026-08-25 00:00:00	2026-08-27 00:00:00	1000	EXPIRED	2026-08-28 08:07:15.157	2026-08-28 08:09:06.286
e848ecca-cb47-43ea-977c-da5e1e8802f7	8c2d09f5-f305-4b47-9eb5-c48ddca97552	5cc0f07a-7447-4127-b7b6-6c4c02755e89	2026-08-22 00:00:00	2026-08-28 00:00:00	1000	EXPIRED	2026-08-28 08:14:38.833	2026-08-28 08:17:12.005
77966734-ac3a-4eb4-8172-3f905f5e3ff0	8c2d09f5-f305-4b47-9eb5-c48ddca97552	592e0338-6f28-445f-8302-f5ce36b13c6b	2026-08-28 00:00:00	2026-09-05 00:00:00	10000	ACTIVE	2026-08-28 08:35:09.66	2026-08-28 08:35:14.408
39a7ed76-5ef2-4ef2-807e-654003941c66	8c2d09f5-f305-4b47-9eb5-c48ddca97552	592e0338-6f28-445f-8302-f5ce36b13c6b	2026-08-28 00:00:00	2026-09-05 00:00:00	10000	ACTIVE	2026-08-28 08:35:20.251	2026-08-28 08:35:22.715
fc78cc18-d930-4265-9604-303dbdc0a2cd	8c2d09f5-f305-4b47-9eb5-c48ddca97552	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	2026-08-29 00:00:00	2026-09-05 00:00:00	10000	ACTIVE	2026-08-28 11:40:53.416	2026-08-28 11:40:56.285
9f65ee80-6219-48e4-8968-e07f4df26247	29f7e681-e9db-45e1-8b37-330acf4a92a8	c3e21d20-730b-42e5-9841-3c5bb2068c80	2018-02-03 00:00:00	2019-08-03 00:00:00	46000	EXPIRED	2026-08-28 11:05:05.769	2026-08-28 11:05:29.312
3abe4769-2f71-41ce-8a39-4ed86a56af11	8c2d09f5-f305-4b47-9eb5-c48ddca97552	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	2026-08-29 00:00:00	2026-09-02 00:00:00	10000	EXPIRED	2026-08-28 08:20:36.241	2026-09-01 11:05:15.338
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Location" (id, city, "subCity", "kebeleOrWoreda", region) FROM stdin;
addisketema	Addis Ababa	Addis Ketema	\N	\N
akakykaliti	Addis Ababa	Akaky Kaliti	\N	\N
arada	Addis Ababa	Arada	\N	\N
bole	Addis Ababa	Bole	\N	\N
gullele	Addis Ababa	Gullele	\N	\N
kirkos	Addis Ababa	Kirkos	\N	\N
kolfekeranio	Addis Ababa	Kolfe Keranio	\N	\N
lemikura	Addis Ababa	Lemi Kura	\N	\N
lideta	Addis Ababa	Lideta	\N	\N
nifassilklafto	Addis Ababa	Nifas Silk-Lafto	\N	\N
yeka	Addis Ababa	Yeka	\N	\N
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "senderId", "receiverId", "propertyId", text, "isRead", "createdAt") FROM stdin;
4bf8f820-5b9d-47da-a732-3f98e0116883	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	hi there	f	2026-08-24 12:20:57.753
ede09fae-5426-449f-b9fa-42f666597ca3	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	how are u	f	2026-08-24 12:31:19.409
208a497c-3572-4931-92eb-afcf62c1f02a	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	i am fine what is new ?	f	2026-08-24 12:32:20.322
c58b31ee-269d-414d-a629-b8b03fdaad00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	things are good	f	2026-08-24 12:32:57.404
61cffbb4-2765-46e2-95fb-84b5b06ff762	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	okay we will tak	f	2026-08-24 12:35:45.175
685b5230-26d0-44ca-a6b0-f6d151711ca1	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	take five	f	2026-08-24 12:36:25.761
b9c0eed4-7baa-4436-a558-2865776f294d	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	hi there	f	2026-08-24 13:42:33.784
544c02e1-fe2d-46c2-ab45-331e21e7269f	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	hi	f	2026-08-24 13:49:16.264
56c9c62c-e4ec-4e0a-8b9e-fd7d379e5264	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	by	f	2026-08-24 13:49:52.74
06578d4b-32e8-4305-955a-eaacd9af665c	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	hi	f	2026-08-25 08:34:02.594
d53f5781-346a-4c62-b19e-b98b8800db22	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	hi	f	2026-08-25 08:37:29.488
ee3bf65a-fba5-4c40-a8d0-a963925344b8	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	29f7e681-e9db-45e1-8b37-330acf4a92a8	\N	werttgaxb	f	2026-08-27 11:11:00.799
a5280c9e-7973-43a5-a7ab-ddf9172a0cc9	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	hi	f	2026-08-28 08:41:48.731
650bda46-f502-45d6-adaf-7e93f1b9f55d	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	29f7e681-e9db-45e1-8b37-330acf4a92a8	\N	selam man	f	2026-08-28 11:21:17.964
d98c9c5a-808d-49e0-9a95-58f50c518907	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	\N	hi	f	2026-08-28 11:28:53.235
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, message, "relatedEntityType", "relatedEntityId", "isRead", "createdAt", "readAt") FROM stdin;
edf26664-6003-4c3d-9626-7bc13a5ed3cc	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "house" was rejected. Reason: Missing or blurry property images.	Property	b1ffb219-650f-40c4-90f2-84d88f964edc	t	2026-08-28 08:31:42.86	2026-08-28 08:31:53.64
c3f16fec-95cc-4175-a6c1-157d84bc37d6	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (joy ) has registered on the platform.	User	695621d0-0e35-45e7-8316-3a4daa468f6c	f	2026-08-28 09:20:43.739	\N
c2a2dff4-1bc8-4995-94cf-3500ba1a7ae5	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (joy ) has registered on the platform.	User	695621d0-0e35-45e7-8316-3a4daa468f6c	f	2026-08-28 09:20:44.093	\N
a1e1693c-c85c-4c2c-902c-3972e6f589b3	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (joy ) has registered on the platform.	User	695621d0-0e35-45e7-8316-3a4daa468f6c	f	2026-08-28 09:20:44.271	\N
dd476de5-b37c-4c9b-a292-4d1b786b8932	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (joy ) has registered on the platform.	User	695621d0-0e35-45e7-8316-3a4daa468f6c	f	2026-08-28 09:20:44.451	\N
7d1f54ad-712f-4a5d-bbf0-31cc5e1bc1c8	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	10e56593-5517-496e-935f-0950f288b8d4	f	2026-08-28 09:23:13.376	\N
9ff78243-f27a-4458-884c-356974e423a8	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "apartment" has been approved and is now live.	Property	6919c6ab-0ca7-4472-b705-1ef5825bbbdf	t	2026-08-24 11:06:50.384	2026-08-24 12:47:40.4
ad9e61dd-0f41-46aa-a359-14294a8d5129	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "apartment" has been approved and is now live.	Property	daecc830-469c-4f56-ac13-7a909a7c6bea	t	2026-08-24 06:36:05.277	2026-08-24 12:47:41.581
35ceb037-e4f7-44b0-b79d-28670a533fef	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "apartment" has been approved and is now live.	Property	b521bb29-4b4c-443d-8a15-24707ac1a9b2	t	2026-08-22 15:50:05.551	2026-08-24 13:00:35.504
e75a596b-7f1e-4da2-adf9-e241c9431491	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "villa" has been approved and is now live.	Property	fc2e9425-a5ec-4e7d-b7dc-67626691e242	t	2026-08-22 15:27:47.635	2026-08-24 13:00:36.888
4f49b75d-4f4d-4057-b04a-24c617b89b65	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "villa" has been approved and is now live.	Property	5cc0f07a-7447-4127-b7b6-6c4c02755e89	t	2026-08-22 14:43:13.899	2026-08-24 13:00:37.766
ab634679-a6cc-4b09-839d-4ed4893f24b8	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "apartment" has been approved and is now live.	Property	8b6f85a2-d834-4049-be7a-79c437c3d549	t	2026-08-22 14:43:06.408	2026-08-24 13:00:39.055
d7ba45e4-102a-492d-9a4d-fff3302f3a47	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved	Your listing "apartment" has been approved and is now live.	Property	722333c9-0086-4dca-8642-ec62e34c193e	t	2026-08-22 08:03:59.253	2026-08-24 13:00:39.895
9c8a7361-e610-4a19-9a76-2a941ba1c070	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	10e56593-5517-496e-935f-0950f288b8d4	f	2026-08-28 09:23:13.753	\N
32756c23-3aae-4fa4-bc84-9066802d3281	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	10e56593-5517-496e-935f-0950f288b8d4	f	2026-08-28 09:23:13.941	\N
41b64fd7-c0fc-409c-8f0b-9a67bf49c748	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	letif submitted a new listing "house" for moderation.	Property	f9774764-1f8f-4347-b990-965e169b523a	t	2026-08-24 13:06:00.885	2026-08-24 13:06:34.855
07e97ac0-657c-492f-9174-fef2d68a12fe	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	10e56593-5517-496e-935f-0950f288b8d4	f	2026-08-28 09:23:14.129	\N
2fc84910-9a74-42c0-a377-53d0fd769c53	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	f9774764-1f8f-4347-b990-965e169b523a	t	2026-08-24 13:06:45.707	2026-08-24 13:07:04.682
3e6737cb-1c0f-425c-8f05-a4cabaf7a825	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	c772f887-4abd-477b-8e40-16dca1349964	f	2026-08-28 09:23:19.215	\N
9d8d86be-5690-4e94-849c-2721ef4f1b4a	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	fiker ylkal submitted a rental request for "house".	Property	f9774764-1f8f-4347-b990-965e169b523a	t	2026-08-24 13:08:28.412	2026-08-24 13:09:04.328
7ac1c663-de53-4922-81e6-1cd238f06644	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	c772f887-4abd-477b-8e40-16dca1349964	f	2026-08-28 09:23:19.403	\N
9ea61420-719a-4293-b1a6-d7e80904c92d	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	c772f887-4abd-477b-8e40-16dca1349964	f	2026-08-28 09:23:19.593	\N
4b4fd798-b289-427a-8d4b-622086570b68	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	fiker ylkal submitted a rental request for "house".	Property	41af5363-15dc-4c75-afd6-a38f629f22b5	t	2026-08-24 13:19:59.617	2026-08-24 13:20:35.036
19dee5bc-a84d-44f7-af2e-df641922b664	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	41af5363-15dc-4c75-afd6-a38f629f22b5	t	2026-08-24 13:19:03.074	2026-08-24 13:20:36.027
fb774e09-7716-4214-8c16-d12bbbb73eb6	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "house" has been approved by the landlord.	RentalRequest	bafc1460-231b-4c0e-89f5-9c7928ea0b30	t	2026-08-24 13:20:55.622	2026-08-24 13:21:16.154
08d9b99b-97c0-4aed-94d8-4afd8c79f3c5	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 3,300 ETB for "house" has been processed automatically.	Payment	787b3638-5bb4-44ea-854b-95c9ac51248a	t	2026-08-24 13:40:40.616	2026-08-24 13:42:08.627
31e5c5f2-f6e9-453b-9f06-844d3dc9fa3a	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 3,300 ETB for "house" has been processed automatically.	Payment	d9be9bc7-7877-4833-b2c5-1c876218a10a	t	2026-08-24 13:40:30.6	2026-08-24 13:42:09.559
e6132437-320a-4a44-8c60-a72beb676686	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 3,300 ETB has been settled for your property "house".	Payment	d9be9bc7-7877-4833-b2c5-1c876218a10a	t	2026-08-24 13:40:31.298	2026-08-24 13:42:24.691
e96c2bcb-07b7-4a91-898c-71a012fa8d09	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	letif submitted a new listing "house" for moderation.	Property	f9774764-1f8f-4347-b990-965e169b523a	t	2026-08-24 13:05:59.942	2026-08-25 05:51:46.276
ce9ca51f-30dc-453f-981a-d3c4ef760939	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 3,300 ETB has been settled for your property "house".	Payment	787b3638-5bb4-44ea-854b-95c9ac51248a	t	2026-08-24 13:40:40.816	2026-08-24 13:42:23.743
48de0d4b-4875-4696-88fe-2538d95d2d41	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	c772f887-4abd-477b-8e40-16dca1349964	f	2026-08-28 09:23:19.783	\N
817ca48c-37e0-4958-8fa0-6b3dd9ab4336	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (ase) has registered on the platform.	User	bfc68357-b5b9-470a-82b3-2400ec845ff7	t	2026-08-24 13:46:42.625	2026-08-24 13:46:52.725
ea7bc437-f014-440a-be2a-1dab5bf6b842	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	NEW_MESSAGE	New Message from fiker ylkal 💬	hi	User	8c2d09f5-f305-4b47-9eb5-c48ddca97552	t	2026-08-24 13:49:19.46	2026-08-24 13:49:41.368
76901469-cdf2-4a9a-b85b-fe045a800859	8c2d09f5-f305-4b47-9eb5-c48ddca97552	NEW_MESSAGE	New Message from letif 💬	by	User	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	t	2026-08-24 13:49:54.905	2026-08-24 13:50:12.848
2a565a6b-6063-4e1f-bf9c-0eae4d670180	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (ase) has registered on the platform.	User	bfc68357-b5b9-470a-82b3-2400ec845ff7	t	2026-08-24 13:46:42.171	2026-08-25 05:51:43.622
2ece035f-669e-423c-b29d-6b09e35ccd4a	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "hose" for moderation.	Property	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	f	2026-08-25 08:18:30.297	\N
928b1756-77af-46bd-bd2c-d58e069aa78f	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	NEW_MESSAGE	New Message from Fiker 💬	hi	User	8c2d09f5-f305-4b47-9eb5-c48ddca97552	t	2026-08-25 08:34:05.754	2026-08-25 08:37:45.873
5a288368-845a-433b-a401-15b935706cb1	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "hose" for moderation.	Property	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	t	2026-08-25 08:18:31.081	2026-08-25 08:39:09.141
4827a877-2538-42c5-a36d-44f1471fb1eb	8c2d09f5-f305-4b47-9eb5-c48ddca97552	NEW_MESSAGE	New Message from Asefa 💬	hi	User	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	t	2026-08-25 08:37:32.807	2026-08-25 15:35:36.374
fb1d24a1-e1df-4fb8-98c5-875f55134431	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "hose" was rejected. Please review and resubmit.	Property	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	t	2026-08-25 15:57:19.589	2026-08-25 15:58:20.189
60146787-f536-4c69-8973-697832e485e1	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "apartment" for moderation.	Property	e41cd36b-4763-4434-a8a7-d3395cc4e09a	f	2026-08-25 16:01:25.135	\N
bfe12380-5958-47a8-b02a-a78c0942c70e	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "apartment" for moderation.	Property	e41cd36b-4763-4434-a8a7-d3395cc4e09a	t	2026-08-25 16:01:25.861	2026-08-25 16:04:11.172
a9e7a482-4340-4d74-a921-18c2119b20bf	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "apartment" was rejected. Please review and resubmit.	Property	e41cd36b-4763-4434-a8a7-d3395cc4e09a	t	2026-08-25 16:02:30.934	2026-08-25 16:04:32.885
88859afb-d126-4a14-b615-85948fbb6d87	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "hose" for moderation.	Property	d0eeae65-1699-4f90-a649-a9f0ef87ada6	f	2026-08-25 16:05:30.273	\N
12c707ef-5afa-4f13-b6c1-461d47723a6b	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "hose" for moderation.	Property	d0eeae65-1699-4f90-a649-a9f0ef87ada6	t	2026-08-25 16:05:30.745	2026-08-25 16:06:11.717
a24a48d7-def7-4304-9b20-4a89b973204d	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "hose" was rejected. Please review and resubmit.	Property	d0eeae65-1699-4f90-a649-a9f0ef87ada6	t	2026-08-25 16:06:22.947	2026-08-25 16:06:55.106
9bd9a980-0c47-4c5d-979e-a881cc83e731	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "hose" was rejected. Please review and resubmit.	Property	d0eeae65-1699-4f90-a649-a9f0ef87ada6	t	2026-08-25 16:06:02.343	2026-08-25 16:06:55.945
4e5dd838-253b-4e30-bc94-25de53024c4b	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "hose" was rejected. Please review and resubmit.	Property	d0eeae65-1699-4f90-a649-a9f0ef87ada6	t	2026-08-25 16:06:41.025	2026-08-25 16:06:56.819
30df9219-18e3-4da9-98fa-42f112206c42	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "hose" for moderation.	Property	17e41811-e855-4429-a2d6-7a52469d278b	f	2026-08-25 16:09:52.914	\N
30f670ea-737d-4102-a93f-908876421f33	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "hose" was rejected. Please review and resubmit.	Property	17e41811-e855-4429-a2d6-7a52469d278b	t	2026-08-25 16:10:22.85	2026-08-26 07:36:42.356
e9febb29-6006-48a8-a380-73b612fdb4fa	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (eyob eshetie) has registered on the platform.	User	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	f	2026-08-26 07:46:35.783	\N
66227d34-e6b7-48db-92c4-a752832141f8	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new landlord (eyob eshetie) has registered on the platform.	User	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	t	2026-08-26 07:46:36.145	2026-08-26 08:10:11.76
01783939-80c9-4297-b5e6-9b7e1bfc7acd	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "hose" for moderation.	Property	17e41811-e855-4429-a2d6-7a52469d278b	t	2026-08-25 16:09:53.532	2026-08-26 08:10:13.519
85e9c239-8c8b-4723-a872-0cb848f99323	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 2,750 ETB for "house" has been processed automatically.	Payment	80f3a366-7c2d-466a-abe6-1ab090927a07	t	2026-08-26 08:25:21.896	2026-08-26 08:25:44.325
11c7c96e-e21a-4efc-b419-4712cb5f63c4	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 2,750 ETB has been settled for your property "house".	Payment	80f3a366-7c2d-466a-abe6-1ab090927a07	t	2026-08-26 08:25:22.834	2026-08-26 08:28:24.674
6c53d850-0ffd-4bda-b533-cdc584940242	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new admin (man mortal) has registered on the platform.	User	b12b714a-9825-4f9e-96ad-b29a62067836	f	2026-08-27 07:36:05.829	\N
ad2c46ee-f7fa-4eff-9519-62a79acacee6	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "property" for moderation.	Property	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	f	2026-08-27 10:37:00.41	\N
69ce42c7-6c73-4b37-bcee-4ac8dd2e06cb	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "property" for moderation.	Property	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	t	2026-08-27 10:37:00.92	2026-08-27 10:39:24.304
aa31ee71-88cd-4e5c-8c35-dbc6701b0637	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new admin (man mortal) has registered on the platform.	User	b12b714a-9825-4f9e-96ad-b29a62067836	t	2026-08-27 07:36:06.849	2026-08-27 11:24:30.036
80a98ceb-2ee7-472c-9477-0193fc3e5017	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker Fonka submitted a rental request for "villa".	Property	592e0338-6f28-445f-8302-f5ce36b13c6b	t	2026-08-28 08:33:17.752	2026-08-28 08:33:45.628
1812d5d4-51d2-4d2a-a66d-16f70e836fb0	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration 👤	A new admin (man mortal) has registered on the platform.	User	b12b714a-9825-4f9e-96ad-b29a62067836	t	2026-08-27 07:36:06.542	2026-08-27 10:39:19.66
717ab1f1-5186-4627-8cf0-0693c042d8e8	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	29f7e681-e9db-45e1-8b37-330acf4a92a8	f	2026-08-27 10:44:00.21	\N
75b23853-04bb-4676-b7b9-17c146e103b1	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	RENTAL_REQUEST	New Rental Inquiry! 🏠	man submitted a rental request for "property".	Property	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	t	2026-08-27 11:07:34.609	2026-08-27 11:10:05.446
1fa5a20f-fe77-414b-a560-549cb7d351e5	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	LISTING_APPROVED	Listing Approved ✅	Your listing "property" has been approved and is now live.	Property	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	t	2026-08-27 10:40:02.376	2026-08-27 11:10:07.19
32f2442b-241f-4db2-8e17-b655e5f3ed05	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	29f7e681-e9db-45e1-8b37-330acf4a92a8	t	2026-08-27 10:44:00.71	2026-08-27 11:12:21.775
4d5d93dc-b553-44fc-a477-23e7efa82bb5	29f7e681-e9db-45e1-8b37-330acf4a92a8	NEW_MESSAGE	New Message from eyob eshetie 💬	werttgaxb	User	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	t	2026-08-27 11:11:02.991	2026-08-27 11:15:01.187
763dd2f1-ad55-4934-91d8-5a30d602abfb	29f7e681-e9db-45e1-8b37-330acf4a92a8	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "property" has been approved by the landlord.	RentalRequest	509a1de2-e756-4683-9547-75bb79c97152	t	2026-08-27 11:10:28.995	2026-08-27 11:15:02.742
96533a40-7871-4aab-a7dd-9fd25c14f17f	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "property" for moderation.	Property	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	t	2026-08-27 10:37:01.125	2026-08-27 11:24:30.857
6e43f641-f520-4139-814e-116687fe6db7	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	29f7e681-e9db-45e1-8b37-330acf4a92a8	t	2026-08-27 10:44:00.898	2026-08-27 11:24:31.775
b5cae072-6e89-44ce-a054-9651709c1c63	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (ababe) has registered on the platform.	User	001a5598-8635-47e1-b6d2-cb7d7f168466	f	2026-08-27 13:02:38.596	\N
da09366c-6781-407d-8d2b-e34f3473c048	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (ababe) has registered on the platform.	User	001a5598-8635-47e1-b6d2-cb7d7f168466	f	2026-08-27 13:02:38.983	\N
3d360cc9-141a-48ef-9c4f-b4f604146490	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration 👤	A new admin (abyu man) has registered on the platform.	User	48acb94e-2b2b-446d-b3ec-e1d4d495f662	f	2026-08-28 06:13:15.105	\N
dbc583de-581f-40ce-8364-509b74cf06f8	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new admin (abyu man) has registered on the platform.	User	48acb94e-2b2b-446d-b3ec-e1d4d495f662	f	2026-08-28 06:13:15.925	\N
18f1b51f-7fa1-4cc3-b3b8-caf604470117	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration 👤	A new admin (abyu man) has registered on the platform.	User	48acb94e-2b2b-446d-b3ec-e1d4d495f662	f	2026-08-28 06:13:16.15	\N
cb9b6b7d-225f-4189-95ee-5b5c7addc459	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (ababe) has registered on the platform.	User	001a5598-8635-47e1-b6d2-cb7d7f168466	t	2026-08-27 13:02:39.175	2026-08-28 07:36:05.326
5deffbc1-f45a-4360-8b63-57605b740f86	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new admin (abyu man) has registered on the platform.	User	48acb94e-2b2b-446d-b3ec-e1d4d495f662	t	2026-08-28 06:13:16.354	2026-08-28 07:36:04.384
5a8c8c7b-315a-4b28-a624-15faebc7851a	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefe submitted a new listing "apartment" for moderation.	Property	b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	f	2026-08-28 07:39:18.481	\N
1185757f-fe7c-492a-8883-ca8b3cfec49b	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefe submitted a new listing "apartment" for moderation.	Property	b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	f	2026-08-28 07:39:18.885	\N
28446670-52fa-4966-b432-d0f0fd14d6e4	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefe submitted a new listing "apartment" for moderation.	Property	b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	f	2026-08-28 07:39:19.088	\N
14374fac-c8be-4f35-87cb-8790f542b02a	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefe submitted a new listing "apartment" for moderation.	Property	b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	t	2026-08-28 07:39:19.281	2026-08-28 07:39:41.15
a1976275-da76-4b15-bc4c-674cbf22f3f4	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "apartment" was rejected. Reason: not suitable	Property	b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	t	2026-08-28 07:39:55.143	2026-08-28 07:40:08.997
b1d9c093-e911-4f86-8e2b-163585d6d211	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "apartment" for moderation.	Property	6a235e1f-a461-4f98-bacb-4153743d51cd	f	2026-08-28 07:47:59.674	\N
b439acda-8434-48ea-bb16-e0b74e632915	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "apartment" for moderation.	Property	6a235e1f-a461-4f98-bacb-4153743d51cd	f	2026-08-28 07:48:00.036	\N
ef58d878-97ff-43ca-9b76-2574831cadde	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "apartment" for moderation.	Property	6a235e1f-a461-4f98-bacb-4153743d51cd	f	2026-08-28 07:48:00.445	\N
52e297c7-1cd2-4745-8c44-869348fae18b	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "apartment" for moderation.	Property	6a235e1f-a461-4f98-bacb-4153743d51cd	t	2026-08-28 07:48:00.219	2026-08-28 07:50:11.61
904233ff-4197-4b59-bd93-a32aee2973e3	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_REJECTED	Listing Rejected	Your listing "apartment" was rejected. Reason: Incorrect pricing structure or currency format.	Property	6a235e1f-a461-4f98-bacb-4153743d51cd	t	2026-08-28 07:50:29.52	2026-08-28 07:50:55.791
cc3944b2-c7d8-4159-bb28-07da20ac1f13	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker Fonka submitted a rental request for "house".	Property	41af5363-15dc-4c75-afd6-a38f629f22b5	t	2026-08-28 07:52:12.282	2026-08-28 07:52:57.977
a1c96637-155b-4b13-ba70-f9c1042a3f04	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "house" has been approved by the landlord.	RentalRequest	bafc1460-231b-4c0e-89f5-9c7928ea0b30	t	2026-08-28 07:52:52.32	2026-08-28 07:58:43.498
9696f15c-c5e0-440c-bc11-901456b69210	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker Fonka submitted a rental request for "apartment".	Property	6919c6ab-0ca7-4472-b705-1ef5825bbbdf	t	2026-08-28 07:56:59.215	2026-08-28 07:57:23.879
39ce4977-9a3f-4edf-94f8-4fcb89221fb3	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 11,000 ETB for "villa" has been processed automatically.	Payment	aa4576ea-61f9-4931-a06b-8713d7470895	t	2026-08-28 08:35:23.116	2026-08-28 08:35:59.752
fff75e9a-9e16-4c99-b341-e4135c92f8fd	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 11,000 ETB for "villa" has been processed automatically.	Payment	d6729e55-c881-4ac2-8ea9-b8fa5e819b90	t	2026-08-28 08:35:16.078	2026-08-28 08:36:41.217
f2499bbc-0903-4b85-9933-586d512bbf29	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "villa" has been approved by the landlord.	RentalRequest	6351a56a-15b1-42dd-b3db-82657863c740	t	2026-08-28 08:33:55.059	2026-08-28 08:36:42.077
b743644d-f820-4e23-a966-ab8e7639b5ca	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	NEW_MESSAGE	New Message from Fiker Fonka 💬	hi	User	8c2d09f5-f305-4b47-9eb5-c48ddca97552	t	2026-08-28 08:41:51.059	2026-08-28 08:42:04.512
cce172b9-8fc7-46cd-815a-2b452c0a819a	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	cc3ed5d4-79e8-45bc-a135-f84b0137c036	f	2026-08-28 08:49:15.658	\N
bc5cae3e-93e3-43fe-b4bc-a2087cb333c4	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	cc3ed5d4-79e8-45bc-a135-f84b0137c036	f	2026-08-28 08:49:16.143	\N
8b93ce11-eee9-4069-9b26-59095e689da9	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	cc3ed5d4-79e8-45bc-a135-f84b0137c036	f	2026-08-28 08:49:16.357	\N
0f916b4c-cdff-463e-8505-194dc7b3500f	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	cc3ed5d4-79e8-45bc-a135-f84b0137c036	f	2026-08-28 08:49:16.654	\N
00e81924-716f-4121-8d56-a2f6b617f7a0	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	1e486f4b-70aa-4d6b-806d-036627fa49f0	f	2026-08-28 09:23:49.136	\N
6974b94c-e424-4a22-82d6-e970e68eac68	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	1e486f4b-70aa-4d6b-806d-036627fa49f0	f	2026-08-28 09:23:49.355	\N
226047bd-bd97-4676-8613-50d26877d65b	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	1e486f4b-70aa-4d6b-806d-036627fa49f0	f	2026-08-28 09:23:49.874	\N
8eeae4d6-002b-4de1-85e9-47a8b9f7dd2d	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	7d93135d-1c10-4371-a598-5f99b2df57ad	f	2026-08-28 09:24:07.96	\N
7358b34d-7a63-4818-af08-0fc2b9991c6f	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	7d93135d-1c10-4371-a598-5f99b2df57ad	f	2026-08-28 09:24:08.149	\N
767bb2f3-232a-4f53-9cb3-43e7d76f4cb6	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	7d93135d-1c10-4371-a598-5f99b2df57ad	f	2026-08-28 09:24:08.527	\N
03cbfdd1-5f3e-4634-bbb0-598e9cee37c8	695621d0-0e35-45e7-8316-3a4daa468f6c	LISTING_REJECTED	Listing Rejected	Your listing "house" was rejected. Please review and resubmit.	Property	10e56593-5517-496e-935f-0950f288b8d4	f	2026-08-28 09:40:58.774	\N
12313cbf-57c9-4b1f-936d-31c931a64e32	695621d0-0e35-45e7-8316-3a4daa468f6c	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	1e486f4b-70aa-4d6b-806d-036627fa49f0	f	2026-08-28 09:41:10.386	\N
67ee8f22-2a84-49af-bd66-629f6fbdd951	29f7e681-e9db-45e1-8b37-330acf4a92a8	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "my" has been approved by the landlord.	RentalRequest	09a781d8-132d-4ab6-a7a5-7c0cfa83f853	t	2026-08-28 11:01:37.091	2026-08-28 11:02:28.638
4e18aaa2-0a8c-4655-9f29-affb30bb44b9	29f7e681-e9db-45e1-8b37-330acf4a92a8	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 50,600 ETB for "my" has been processed automatically.	Payment	1184a294-b6bd-4f29-86b1-f683c8cde1e9	f	2026-08-28 11:05:09.35	\N
871de1da-b589-4829-ac48-3f7458e982e0	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 50,600 ETB has been settled for your property "my".	Payment	1184a294-b6bd-4f29-86b1-f683c8cde1e9	t	2026-08-28 11:05:09.937	2026-08-28 11:10:11.247
018e3733-daff-45a4-8b76-b409175429c3	29f7e681-e9db-45e1-8b37-330acf4a92a8	NEW_MESSAGE	New Message from eyob eshetie 💬	selam man	User	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	f	2026-08-28 11:21:19.864	\N
17ff26b5-9239-4c8f-94fc-0f5103c102e4	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 11,000 ETB has been settled for your property "villa".	Payment	aa4576ea-61f9-4931-a06b-8713d7470895	t	2026-08-28 08:35:23.305	2026-08-28 11:24:28.576
ca837d2a-6ae2-40a2-be91-1a055696adb2	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 11,000 ETB has been settled for your property "villa".	Payment	d6729e55-c881-4ac2-8ea9-b8fa5e819b90	t	2026-08-28 08:35:17.292	2026-08-28 11:24:29.696
428279ac-30f4-4535-bcbb-1e8b93fc9acc	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	f	2026-08-28 11:26:38.439	\N
46ad6eb0-14fa-422c-a893-d599f1301254	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	f	2026-08-28 11:26:38.833	\N
9e352b22-d9e3-44cc-97f8-379bf70cbb53	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	f	2026-08-28 11:26:39.085	\N
b3accf8b-3f15-43c4-bd4f-7ec5ee91d1f1	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	7d93135d-1c10-4371-a598-5f99b2df57ad	t	2026-08-28 09:24:08.338	2026-08-28 11:43:10.74
cb2e8871-5868-43f5-a037-67a98eda5274	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	joy  submitted a new listing "house" for moderation.	Property	1e486f4b-70aa-4d6b-806d-036627fa49f0	t	2026-08-28 09:23:49.685	2026-08-28 11:43:12.896
3986ca9b-2626-4659-a748-1ae0d8631563	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 11,000 ETB for "house" has been processed automatically.	Payment	07fa31da-823c-4b4a-a68f-6f8489d7bb95	t	2026-08-28 08:20:40.42	2026-08-28 08:36:43.281
4be31afd-e460-47b6-8254-0f9d79d5c055	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker Fonka submitted a rental request for "apartment".	Property	daecc830-469c-4f56-ac13-7a909a7c6bea	t	2026-08-28 07:59:41.222	2026-08-28 07:59:58.944
043734d2-d875-4d67-bab9-8f1563b675e6	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "house" has been approved by the landlord.	RentalRequest	f138879b-1827-4f67-9525-7dc03449471b	t	2026-08-28 08:20:09.196	2026-08-28 08:36:44.085
be3d1406-f06a-4722-ab3d-97d8f8b44def	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "apartment" has been approved by the landlord.	RentalRequest	ba7096fa-5851-4b3a-96f9-1c6aa39a87ab	t	2026-08-28 08:00:10.171	2026-08-28 08:01:04.351
ebe8c29f-fc85-47d9-9330-7251b48234c5	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 1,100 ETB for "villa" has been processed automatically.	Payment	a387c7a3-3351-4652-940f-846e1085e40e	t	2026-08-28 08:14:44.754	2026-08-28 08:36:45.298
0102391c-fe0e-4b8f-a054-80871e4f0750	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration	A new tenant (abyu) has registered on the platform.	User	329e810e-2f28-4600-b142-237c5e364918	f	2026-08-28 08:03:59.664	\N
2d5297a5-3f41-4d58-8d47-1b83b83c0eec	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "apartment" has been approved by the landlord.	RentalRequest	fc93d74d-1173-4aa0-88f8-5f9ab59a465c	t	2026-08-28 08:01:57.547	2026-08-28 08:04:00.132
0730bfc5-5de3-41cb-ad45-ad93a680cbe0	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new tenant (abyu) has registered on the platform.	User	329e810e-2f28-4600-b142-237c5e364918	f	2026-08-28 08:04:00.098	\N
4ab4d23a-6e6f-4172-b91a-12802dfbb05c	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "villa" has been approved by the landlord.	RentalRequest	4d389abd-0b9a-41cc-9f4f-19ecc7555354	t	2026-08-28 08:14:04.441	2026-08-28 08:36:46.076
dc148eb7-e283-4eb9-8f1b-7937c5f2ab2a	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new tenant (abyu) has registered on the platform.	User	329e810e-2f28-4600-b142-237c5e364918	f	2026-08-28 08:04:00.515	\N
f2e91603-8c17-4805-b3d8-ecb955a6a223	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "villa" has been approved by the landlord.	RentalRequest	e78797d8-6ebf-4023-9344-cf71b47296cd	t	2026-08-28 08:11:45.381	2026-08-28 08:36:47.73
b5146790-fb60-445c-8479-031f86edae5b	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 1,100 ETB for "apartment" has been processed automatically.	Payment	f478edf6-3dcf-4e63-9a69-156463b4300d	t	2026-08-28 08:08:24.128	2026-08-28 08:36:48.499
461bc403-d07c-46e0-9d7f-25455f9ea5e2	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (nath) has registered on the platform.	User	b16169bd-e380-4616-9e21-88e551724bf9	f	2026-08-28 09:16:23.61	\N
d36bdbc0-96ff-4834-9002-c3cfbc252275	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "villa" for moderation.	Property	592e0338-6f28-445f-8302-f5ce36b13c6b	f	2026-08-28 08:16:00.627	\N
de5a04f9-a7e7-4973-be18-ca2faf088e58	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "villa" for moderation.	Property	592e0338-6f28-445f-8302-f5ce36b13c6b	f	2026-08-28 08:16:00.816	\N
d45c4856-a5bf-42fe-9f10-8e0c78ef7aeb	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "villa" for moderation.	Property	592e0338-6f28-445f-8302-f5ce36b13c6b	f	2026-08-28 08:16:01.217	\N
7f1afcf2-274c-47a1-8211-00392f39416e	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	f	2026-08-28 08:16:45.059	\N
12faf1f2-17f5-401b-b02c-90153be9986e	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	f	2026-08-28 08:16:45.82	\N
74cd979d-a8ad-4bb8-b061-778597be77ac	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	f	2026-08-28 08:16:46.173	\N
b9d6886a-2ccb-4aa9-a92f-88fec718a555	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	t	2026-08-28 08:17:04.029	2026-08-28 08:22:09.788
0be2fb34-380a-44ff-8345-bd8a68b7f328	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved ✅	Your listing "villa" has been approved and is now live.	Property	592e0338-6f28-445f-8302-f5ce36b13c6b	t	2026-08-28 08:17:02.539	2026-08-28 08:22:11.744
f181c460-1df1-46ce-b7f0-425c7e081d0e	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 1,100 ETB has been settled for your property "villa".	Payment	a387c7a3-3351-4652-940f-846e1085e40e	t	2026-08-28 08:14:46.155	2026-08-28 08:22:12.614
383ae281-3460-4ef1-9132-d5076af4a9a4	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 1,100 ETB has been settled for your property "apartment".	Payment	f478edf6-3dcf-4e63-9a69-156463b4300d	t	2026-08-28 08:08:24.496	2026-08-28 08:22:16.424
b017850e-9cf1-4ba0-898b-1b7bf3ce64f9	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker Fonka submitted a rental request for "villa".	Property	fc2e9425-a5ec-4e7d-b7dc-67626691e242	t	2026-08-28 08:09:44.792	2026-08-28 08:22:17.434
17514649-cf0e-4a64-ac55-5ce4349b112e	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	abyu submitted a rental request for "villa".	Property	fc2e9425-a5ec-4e7d-b7dc-67626691e242	t	2026-08-28 08:06:16.189	2026-08-28 08:22:18.496
b1c982ee-d02a-4473-bddb-f81a77db1021	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 11,000 ETB has been settled for your property "house".	Payment	07fa31da-823c-4b4a-a68f-6f8489d7bb95	t	2026-08-28 08:20:40.776	2026-08-28 08:22:22.002
c5fd71bd-be67-4586-9660-78006134195e	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new tenant (abyu) has registered on the platform.	User	329e810e-2f28-4600-b142-237c5e364918	t	2026-08-28 08:04:00.304	2026-08-28 08:31:02.587
e3e5c75c-e850-4eee-ac08-7b69f0f35cae	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "villa" for moderation.	Property	592e0338-6f28-445f-8302-f5ce36b13c6b	t	2026-08-28 08:16:01.024	2026-08-28 08:31:03.451
42e17bf1-0337-405a-abfa-3f05f838489c	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	t	2026-08-28 08:16:45.997	2026-08-28 08:31:04.466
bd289d56-c89f-43bc-8251-21d652a9115f	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker Fonka submitted a rental request for "house".	Property	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	t	2026-08-28 08:17:55.235	2026-08-28 08:22:08.698
c1ab210b-1867-4db7-b407-e39258728627	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	b1ffb219-650f-40c4-90f2-84d88f964edc	f	2026-08-28 08:29:57.375	\N
31cfa110-1e1e-4191-8508-1cafd817cb93	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	b1ffb219-650f-40c4-90f2-84d88f964edc	f	2026-08-28 08:29:57.729	\N
da78f98b-01ce-4667-a150-adaf4960fc11	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (nath) has registered on the platform.	User	b16169bd-e380-4616-9e21-88e551724bf9	f	2026-08-28 09:16:23.976	\N
cb1f4cb0-287c-498a-9c53-806e601ebde2	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	b1ffb219-650f-40c4-90f2-84d88f964edc	f	2026-08-28 08:29:58.082	\N
684612dd-c7f4-4b0f-a025-730ec6659d04	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	b1ffb219-650f-40c4-90f2-84d88f964edc	t	2026-08-28 08:29:57.906	2026-08-28 08:31:05.3
5bb27f8d-93be-4775-89af-b8f32ba94190	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (nath) has registered on the platform.	User	b16169bd-e380-4616-9e21-88e551724bf9	f	2026-08-28 09:16:24.156	\N
aeeb4cdd-e1b7-4c2b-888d-42843dd73f67	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration 👤	A new tenant (nath) has registered on the platform.	User	b16169bd-e380-4616-9e21-88e551724bf9	f	2026-08-28 09:16:24.332	\N
2c48a89b-81df-4296-a93d-a64789149404	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	abyu eshetie submitted a new listing "aqwdgeywuhigjhkojl" for moderation.	Property	6622acdb-d691-401c-9178-ee4af8c39431	f	2026-08-28 09:37:29.263	\N
ede3feeb-69f5-481b-a823-f785e4ec984d	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	abyu eshetie submitted a new listing "aqwdgeywuhigjhkojl" for moderation.	Property	6622acdb-d691-401c-9178-ee4af8c39431	f	2026-08-28 09:37:29.8	\N
b42820ec-26d3-4889-be24-03b405f12248	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	abyu eshetie submitted a new listing "aqwdgeywuhigjhkojl" for moderation.	Property	6622acdb-d691-401c-9178-ee4af8c39431	t	2026-08-28 09:37:28.818	2026-08-28 09:40:22.392
b644a315-231f-4e5c-b389-0e2cbf14bd67	695621d0-0e35-45e7-8316-3a4daa468f6c	RENTAL_REQUEST	New Rental Inquiry! 🏠	man submitted a rental request for "house".	Property	1e486f4b-70aa-4d6b-806d-036627fa49f0	f	2026-08-28 09:43:41.397	\N
32a2ae56-2f0b-408c-8060-d81ec8d56436	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "my" for moderation.	Property	c3e21d20-730b-42e5-9841-3c5bb2068c80	f	2026-08-28 10:55:29.121	\N
fee6cf9f-f3d6-488a-be69-c9b22b603e86	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "my" for moderation.	Property	c3e21d20-730b-42e5-9841-3c5bb2068c80	f	2026-08-28 10:55:29.509	\N
1722f620-71bb-4fe4-a846-d3511a5ca572	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "my" for moderation.	Property	c3e21d20-730b-42e5-9841-3c5bb2068c80	t	2026-08-28 10:55:28.738	2026-08-28 10:56:45.595
512ef8bb-39ff-4fd0-9705-3cd93dcf469d	cc3ed5d4-79e8-45bc-a135-f84b0137c036	LISTING_APPROVED	Listing Approved ✅	Your listing "aqwdgeywuhigjhkojl" has been approved and is now live.	Property	6622acdb-d691-401c-9178-ee4af8c39431	f	2026-08-28 10:57:25.241	\N
5ccdeac3-efbb-4159-af16-36fd9a0e5f25	695621d0-0e35-45e7-8316-3a4daa468f6c	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	7d93135d-1c10-4371-a598-5f99b2df57ad	f	2026-08-28 10:57:31.616	\N
f37a70a0-9a52-4872-a9b4-cf040f106fe9	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	RENTAL_REQUEST	New Rental Inquiry! 🏠	man submitted a rental request for "my".	Property	c3e21d20-730b-42e5-9841-3c5bb2068c80	t	2026-08-28 11:00:15.373	2026-08-28 11:01:06.721
c86583d6-d24f-483f-8b1c-f9d00ee5117e	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	eyob eshetie submitted a new listing "my" for moderation.	Property	c3e21d20-730b-42e5-9841-3c5bb2068c80	t	2026-08-28 10:55:29.31	2026-08-28 11:08:27.114
54f0ada2-1892-47fc-975e-4cea1f913974	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	abyu eshetie submitted a new listing "aqwdgeywuhigjhkojl" for moderation.	Property	6622acdb-d691-401c-9178-ee4af8c39431	t	2026-08-28 09:37:29.472	2026-08-28 11:08:28.08
60e02f1a-df09-4d25-9bed-f780980c9080	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	LISTING_APPROVED	Listing Approved ✅	Your listing "my" has been approved and is now live.	Property	c3e21d20-730b-42e5-9841-3c5bb2068c80	t	2026-08-28 10:57:10.964	2026-08-28 11:10:12.401
64ad041d-bb02-445d-9ad6-68afa3d60ca4	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_LISTING_PENDING	New Property Awaiting Review 📋	Asefa submitted a new listing "house" for moderation.	Property	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	t	2026-08-28 11:26:39.288	2026-08-28 11:30:02.408
41dfffc8-d6fc-4435-a47d-d10aac8cc604	8c2d09f5-f305-4b47-9eb5-c48ddca97552	NEW_MESSAGE	New Message from letif 💬	hi	User	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	t	2026-08-28 11:28:55.362	2026-08-28 11:32:14.428
b481ff8a-1056-4e1e-a4be-3ef6662e15f0	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENTAL_REQUEST	New Rental Inquiry! 🏠	Fiker submitted a rental request for "house".	Property	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	t	2026-08-28 11:38:08.657	2026-08-28 11:39:12.965
816e88ae-9fd3-4dd9-913f-f0cc5f3f5625	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	t	2026-08-28 11:30:26.12	2026-08-28 11:39:15.65
547fac42-8f44-47ff-b66a-08d377c4c7fe	8c2d09f5-f305-4b47-9eb5-c48ddca97552	REQUEST_APPROVED	Rental Request Approved! 🎉	Your request for "house" has been approved by the landlord.	RentalRequest	586f4c43-32ea-4111-918f-b0b4080ca550	t	2026-08-28 11:39:26.995	2026-08-28 11:39:40.018
4165ff03-a071-4825-ba67-d50cb3055bc7	8c2d09f5-f305-4b47-9eb5-c48ddca97552	PAYMENT_SUCCESS	Payment Completed Successfully! 💳	Your payment of 11,000 ETB for "house" has been processed automatically.	Payment	398089c9-0ace-4eee-bd28-9d6cd72423fc	t	2026-08-28 11:40:57.212	2026-08-28 11:42:34.873
0402bd1e-10c3-4e59-96cc-f91804f946a0	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	RENT_RECEIVED	Rent Payment Completed! 💰	Rent payment of 11,000 ETB has been settled for your property "house".	Payment	398089c9-0ace-4eee-bd28-9d6cd72423fc	t	2026-08-28 11:40:57.719	2026-08-28 11:47:13.86
8ad19c1e-394d-4bd6-a5cf-a03db060c1f8	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	6cd780a7-9697-4f7c-9d50-2a075000152f	f	2026-08-31 08:51:20.907	\N
67ecf5e3-da14-4430-9700-23dbd70bef55	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	6cd780a7-9697-4f7c-9d50-2a075000152f	f	2026-08-31 08:51:21.289	\N
8bac19fe-78d0-46e6-9194-14e99c0bec15	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	6cd780a7-9697-4f7c-9d50-2a075000152f	f	2026-08-31 08:51:21.474	\N
2548402c-c973-40a2-9eea-a7dcfcf0b0cf	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	6cd780a7-9697-4f7c-9d50-2a075000152f	f	2026-08-31 08:51:21.661	\N
5fca0b95-3781-45ba-9e1f-4454e679e464	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	2221fa27-79b7-41d4-b86a-ceb8fe485ce5	f	2026-08-31 12:09:07.123	\N
fb2b8283-b67c-467e-a4cd-b2fdfe588aba	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	2221fa27-79b7-41d4-b86a-ceb8fe485ce5	f	2026-08-31 12:09:07.781	\N
6ea178c1-1ab5-4409-b18f-294820aabba8	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	2221fa27-79b7-41d4-b86a-ceb8fe485ce5	f	2026-08-31 12:09:08.016	\N
e6f5afa9-c835-4357-92c4-d4deccae3a1e	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration	A new landlord (abyu eshetie) has registered on the platform.	User	2221fa27-79b7-41d4-b86a-ceb8fe485ce5	f	2026-08-31 12:09:08.204	\N
6247311e-904e-4f9a-862e-0bccea8d0d93	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	57b5d7b6-5ae3-42d5-bfd7-49483093e318	f	2026-09-01 11:04:35.077	\N
fed22aeb-4cde-4341-a6ed-ed62a643086a	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	57b5d7b6-5ae3-42d5-bfd7-49483093e318	f	2026-09-01 11:04:35.667	\N
97c67f89-dbf5-410b-8e7b-1ab09a2c6086	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	57b5d7b6-5ae3-42d5-bfd7-49483093e318	f	2026-09-01 11:04:35.978	\N
03bce96a-d96e-4f3d-a976-67c864005760	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration	A new tenant (man) has registered on the platform.	User	57b5d7b6-5ae3-42d5-bfd7-49483093e318	f	2026-09-01 11:04:36.295	\N
ad9c3507-c124-4c1e-8a6e-6c73f0179069	8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	NEW_USER_REGISTERED	New User Registration	A new admin (eyobe) has registered on the platform.	User	e9d80411-22a8-4af1-bd08-4f11aad0216f	f	2026-09-01 12:16:53.522	\N
3c3a28f4-134d-4e3b-8966-1fd3f6b2b257	b12b714a-9825-4f9e-96ad-b29a62067836	NEW_USER_REGISTERED	New User Registration	A new admin (eyobe) has registered on the platform.	User	e9d80411-22a8-4af1-bd08-4f11aad0216f	f	2026-09-01 12:16:54.059	\N
529ed4ed-2034-4265-bdf4-d1c26fee17ef	3a1c876f-2d31-4945-8c2b-66c19f9322d6	NEW_USER_REGISTERED	New User Registration	A new admin (eyobe) has registered on the platform.	User	e9d80411-22a8-4af1-bd08-4f11aad0216f	f	2026-09-01 12:16:54.262	\N
f7b09392-edfb-442b-9eb6-6b19a731f572	48acb94e-2b2b-446d-b3ec-e1d4d495f662	NEW_USER_REGISTERED	New User Registration	A new admin (eyobe) has registered on the platform.	User	e9d80411-22a8-4af1-bd08-4f11aad0216f	f	2026-09-01 12:16:54.467	\N
129bcfe6-d4fc-4c27-8742-9978a938973f	e9d80411-22a8-4af1-bd08-4f11aad0216f	NEW_USER_REGISTERED	New User Registration	A new admin (eyobe) has registered on the platform.	User	e9d80411-22a8-4af1-bd08-4f11aad0216f	t	2026-09-01 12:16:54.652	2026-09-01 12:17:21.194
6ee12ef5-61b2-4b1d-aebc-20d2bcf93d83	695621d0-0e35-45e7-8316-3a4daa468f6c	LISTING_APPROVED	Listing Approved ✅	Your listing "house" has been approved and is now live.	Property	c772f887-4abd-477b-8e40-16dca1349964	f	2026-09-01 12:17:40.959	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "leaseId", amount, "commissionAmount", "gatewayTransactionId", method, status, "paidAt", "createdAt") FROM stdin;
ef722cd0-ee26-4261-96ec-32b43b1dd909	512a3e4b-b241-4437-b83c-a2cddb62abfa	1100.00	100.00	TX-82C5D384-1787550362898	Telebirr	SUCCESS	\N	2026-08-24 05:46:11.807
b34b908a-156b-4fae-99c7-77dc3ef0295f	9758e7aa-4d29-4e94-aed5-1feb69877861	1100.00	100.00	TX-71B66273-1787550655776	Telebirr	SUCCESS	\N	2026-08-24 05:50:59.56
ca3e504f-04d2-4765-9f0c-83757bf28e80	57903093-e9f9-4b67-b66f-41c2cb8358cd	1100.00	100.00	TX-8272E898-1787550799205	Telebirr	SUCCESS	\N	2026-08-24 05:53:28.043
ad4f9d72-5669-4810-b8e6-8d34ac54e28a	2e0d60a8-033c-429a-9428-46ddfccc5ba3	1100.00	100.00	TX-034D5362-1787551003737	Telebirr	SUCCESS	\N	2026-08-24 05:56:52.014
d623a93a-2da2-4d23-818c-b249c176a79c	3c2899b9-9e6d-424e-ba97-a3cbeef95454	1100.00	100.00	TX-EB2D9ED1-1787551212735	Telebirr	SUCCESS	\N	2026-08-24 06:00:15.929
cbfccb07-8ee3-4a73-8d42-086c4a8c7e7f	367e1bac-fbde-47f9-abda-bcc247a62c0b	1100.00	100.00	TX-9828BC4B-1787551242327	Telebirr	SUCCESS	\N	2026-08-24 06:00:43.909
456da9d9-0681-4e8b-be29-595de5353d90	d580258a-bb66-4e30-a04f-e0c89f270f5f	1100.00	100.00	TX-CE3EB448-1787551540459	Telebirr	SUCCESS	\N	2026-08-24 06:05:45.922
694c6477-48bf-44c3-98ec-b38a20cac34e	ad15a1a4-cbe4-4e92-92b7-ae4f05c5e2e8	1100.00	100.00	TX-72359A67-1787551802190	Telebirr	SUCCESS	\N	2026-08-24 06:10:07.315
75edbad1-c318-43d5-a961-e16fdd630eca	a6c60fde-ffdb-4593-a38d-9cd9f37d3f1c	1100.00	100.00	TX-D5F0230B-1787551854634	Telebirr	SUCCESS	\N	2026-08-24 06:10:56.505
ba7a670e-e79f-4a65-963d-73f570ee09f0	036f6155-403c-4708-a0fd-de9a6893785a	1100.00	100.00	TX-42B9A779-1787552062695	Telebirr	SUCCESS	\N	2026-08-24 06:14:27.926
52e36a0f-bd86-4f70-948b-504f7b68c931	20cae39d-8a9a-4cc0-852b-c7fb44c0ffb5	1100.00	100.00	TX-605E186B-1787552173763	Telebirr	SUCCESS	\N	2026-08-24 06:16:15.813
2a178f66-560b-4e24-aa00-bd17dc1583ab	e63ba1ec-c6c6-496f-ae6a-401507af5477	1100.00	100.00	TX-605350BB-1787552448328	Telebirr	SUCCESS	\N	2026-08-24 06:20:52.189
6c980348-dffa-4a2b-9a2a-341022a2d1ba	b9401184-8583-481e-a2e3-626a6e069b08	1100.00	100.00	TX-F2AEE779-1787552679390	Telebirr	SUCCESS	\N	2026-08-24 06:24:41.608
561aa1ce-dc5e-4ffc-9706-896e3dcbaf42	83c3efb9-1312-486b-a44b-252dc00ffb8d	1100.00	100.00	TX-4CE7AAF3-1787559268856	Telebirr	PENDING	\N	2026-08-24 08:14:36.409
1002a62e-74f4-4a54-8792-0c7d05b28a47	bd5881bc-2c82-403a-93c4-f2e3d265f165	1100.00	100.00	TX-32164739-1787559482128	Telebirr	PENDING	\N	2026-08-24 08:18:09.612
786e0acf-2514-44d3-bebb-5e2063e839d4	fbec1012-43df-4c01-9c65-693efdaec7b7	880.00	80.00	TX-618AD2E6-1787560303395	Telebirr	PENDING	\N	2026-08-24 08:31:50.656
df62e9aa-fe8c-4d2d-b97d-a0b7693ee2c5	251f7a05-c9ec-496e-ac1b-4bee5adc23c2	660.00	60.00	TX-6A22A1C7-1787561172563	CBE Birr	PENDING	\N	2026-08-24 08:46:20.855
835b2b94-f941-43db-aaf1-bfbbfa7e5d2a	9ba4d263-3c08-4408-b988-dafdcb24ec11	1320.00	120.00	TX-FB4D9DD9-1787561659809	Telebirr	PENDING	\N	2026-08-24 08:54:26.943
0169bc8e-18ed-4f95-a3cb-3763f90a78c4	bdbe8ab1-934f-4643-9f24-49d502b9ff39	2200.00	200.00	TX-9A7598C9-1787569898590	Telebirr	PENDING	\N	2026-08-24 11:11:48.705
e6f8eb21-5f87-408e-8b47-a7a3a6971512	56560914-6f23-41ce-9566-45d05db82ea6	1320.00	120.00	TX-88AED6DC-1787569948092	Telebirr	PENDING	\N	2026-08-24 11:12:31.064
17c139a2-36bc-4c29-bcfc-5c84e423da8b	9966c22c-1898-4762-89d0-d65f1606590f	2200.00	200.00	TX-5350B6F4-1787570066433	CBE Birr	PENDING	\N	2026-08-24 11:14:29.433
b7b5bcf9-785a-417f-8c2a-85b6a5b5cb7e	90487799-312a-4f4b-b8ac-2a2b4944bfda	3300.00	300.00	TX-801D1752-1787578120205	CBE Birr	PENDING	\N	2026-08-24 13:28:45.323
b7b027cb-c3cf-48c1-8ba5-3e9168e2c40b	20989477-7219-43f7-a220-5871d130ce2d	3300.00	300.00	TX-8147B9E6-1787578428617	Telebirr	PENDING	\N	2026-08-24 13:33:57.757
2c36be3a-d798-4ed5-ba51-1a81acb89554	adc612eb-6b35-43d6-96fd-7f18726aca19	3300.00	300.00	TX-E18137BA-1787578616108	Telebirr	PENDING	\N	2026-08-24 13:37:07.734
d9be9bc7-7877-4833-b2c5-1c876218a10a	ae44727f-b800-4e5c-8bcc-954e57a0e664	3300.00	300.00	TX-5D1CA738-1787578818299	Telebirr	SUCCESS	2026-08-24 13:40:26.064	2026-08-24 13:40:26.067
787b3638-5bb4-44ea-854b-95c9ac51248a	b913543a-9abe-4d7e-a7cb-5acd32841db1	3300.00	300.00	TX-EF5EBDDC-1787578836608	Telebirr	SUCCESS	2026-08-24 13:40:37.889	2026-08-24 13:40:37.893
80f3a366-7c2d-466a-abe6-1ab090927a07	b2bc8b82-7b1d-47b3-84c8-77b0ee96c720	2750.00	250.00	TX-698B39E1-1787732715392	Telebirr	SUCCESS	2026-08-26 08:25:18.301	2026-08-26 08:25:18.303
7f79a91b-2c2c-4411-9d82-0f28d286c71c	4f7f6957-4a92-461c-81c7-ce3f1f289ce1	1100.00	100.00	TX-4ADBF54C-1787904148754	Telebirr	PENDING	\N	2026-08-28 08:02:33.51
bba1b175-9a2a-4c5c-89c0-ca9c32cd43e3	7053a218-8e77-4436-98cd-19172cf90c67	1100.00	100.00	TX-E08CEA3D-1787904429934	Telebirr	PENDING	\N	2026-08-28 08:07:15.958
f478edf6-3dcf-4e63-9a69-156463b4300d	c2c46429-2efe-434e-9145-85042314de4d	1100.00	100.00	TX-A4D37DD4-1787904497078	Telebirr	SUCCESS	2026-08-28 08:08:20.93	2026-08-28 08:08:20.935
a387c7a3-3351-4652-940f-846e1085e40e	e848ecca-cb47-43ea-977c-da5e1e8802f7	1100.00	100.00	TX-71685022-1787904875836	Telebirr	SUCCESS	2026-08-28 08:14:39.971	2026-08-28 08:14:39.974
07fa31da-823c-4b4a-a68f-6f8489d7bb95	3abe4769-2f71-41ce-8a39-4ed86a56af11	11000.00	1000.00	TX-27ED952F-1787905232228	Telebirr	SUCCESS	2026-08-28 08:20:37.388	2026-08-28 08:20:37.39
d6729e55-c881-4ac2-8ea9-b8fa5e819b90	77966734-ac3a-4eb4-8172-3f905f5e3ff0	11000.00	1000.00	TX-1B4BB15C-1787906101617	Telebirr	SUCCESS	2026-08-28 08:35:11.163	2026-08-28 08:35:11.165
aa4576ea-61f9-4931-a06b-8713d7470895	39a7ed76-5ef2-4ef2-807e-654003941c66	11000.00	1000.00	TX-F44C8E9D-1787906119588	Telebirr	SUCCESS	2026-08-28 08:35:21.504	2026-08-28 08:35:21.506
1184a294-b6bd-4f29-86b1-f683c8cde1e9	9f65ee80-6219-48e4-8968-e07f4df26247	50600.00	4600.00	TX-91538C93-1787915103590	CBE Birr	SUCCESS	2026-08-28 11:05:06.58	2026-08-28 11:05:06.583
398089c9-0ace-4eee-bd28-9d6cd72423fc	fc78cc18-d930-4265-9604-303dbdc0a2cd	11000.00	1000.00	TX-1DE9042D-1787917250767	Telebirr	SUCCESS	2026-08-28 11:40:54.233	2026-08-28 11:40:54.235
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Property" (id, "titleEn", "titleAm", "descriptionEn", "descriptionAm", price, rooms, furnished, "landmarkDescription", "gpsLat", "gpsLng", status, "publishedAt", "expiresAt", "createdAt", "updatedAt", "landlordId", "categoryId", "locationId", "rejectionReason") FROM stdin;
2ce73ad3-648c-4176-8f03-3cc4172fb1f3	house		sgdjsafgsajf		10000	5	t	bole	\N	\N	RENTED	2026-08-28 11:30:25.698	\N	2026-08-28 11:26:36.933	2026-08-28 11:40:56.694	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	arada	\N
c3e21d20-730b-42e5-9841-3c5bb2068c80	my	eeee	qqqqqqqqqq	dcvfghejngkml,.;dvfsdas,a	46000	5	t	w23e4r5t67	23.34	67.57	APPROVED	2026-08-28 10:57:10.531	\N	2026-08-28 10:55:27.79	2026-08-28 11:05:30.107	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	apartment	arada	\N
722333c9-0086-4dca-8642-ec62e34c193e	apartment		3 bed room		800	-5	f	neear bole	\N	\N	RENTED	2026-08-22 08:03:58.556	\N	2026-08-22 08:00:38.878	2026-08-22 14:32:53.566	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	nifassilklafto	\N
e1f367e4-6816-4f0e-b2ca-b6c5452f673f	property	eaefikosdalsak	my name is abyu	wedgwfhvegjkldfsdsm,	30000	3	t	nearto bole	9	5	RENTED	2026-08-27 10:40:01.959	\N	2026-08-27 10:36:59.387	2026-08-28 11:10:55.377	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	villa	yeka	\N
2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	house		new house		10000	-9	t	yeka	\N	\N	APPROVED	2026-08-28 08:17:03.251	\N	2026-08-28 08:16:44.361	2026-09-01 11:05:16.671	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	house	yeka	\N
c772f887-4abd-477b-8e40-16dca1349964	house		dfghj		100000	6	f		\N	\N	APPROVED	2026-09-01 12:17:40.52	\N	2026-08-28 09:23:18.838	2026-09-01 12:17:40.524	695621d0-0e35-45e7-8316-3a4daa468f6c	house	lemikura	\N
6a235e1f-a461-4f98-bacb-4153743d51cd	apartment		last test		3000	4	t	bole	\N	\N	REJECTED	\N	\N	2026-08-28 07:47:58.932	2026-08-28 07:50:28.716	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	arada	Incorrect pricing structure or currency format.
41af5363-15dc-4c75-afd6-a38f629f22b5	house		new		3000	5	t	aroun dembel	\N	\N	RENTED	2026-08-24 13:19:01.787	\N	2026-08-24 13:01:32.654	2026-08-28 07:52:51.36	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	house	lemikura	\N
8b6f85a2-d834-4049-be7a-79c437c3d549	Apartment		3 bed room		800	4	t	neear bole	\N	\N	RENTED	2026-08-22 14:43:05.703	\N	2026-08-22 07:59:45.934	2026-08-25 08:22:33.355	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	nifassilklafto	\N
6919c6ab-0ca7-4472-b705-1ef5825bbbdf	apartment		skjadgsjdgajs		2004	4	t	neear bole	\N	\N	RENTED	2026-08-24 11:06:49.559	\N	2026-08-24 11:05:34.715	2026-08-28 08:00:09.161	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	lideta	\N
a9ed883d-db91-4bd3-9c40-23e33fe76ea0	hose		dkjsadjhk		800	-26	t	akaki	\N	\N	REJECTED	\N	\N	2026-08-25 08:18:28.881	2026-08-25 15:57:18.975	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	villa	nifassilklafto	\N
e41cd36b-4763-4434-a8a7-d3395cc4e09a	apartment		iwq		800	-5	t	akaki	\N	\N	REJECTED	\N	\N	2026-08-25 16:01:24.022	2026-08-25 16:02:30.168	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	arada	\N
daecc830-469c-4f56-ac13-7a909a7c6bea	apartment		here is four bed room apartment		1000	4	f	neear bole	\N	\N	RENTED	2026-08-24 06:36:04.735	\N	2026-08-24 06:35:38.53	2026-08-28 08:08:23.706	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	nifassilklafto	\N
d0eeae65-1699-4f90-a649-a9f0ef87ada6	hose		jgjahf		1888	-10	t	bole 	\N	\N	REJECTED	\N	\N	2026-08-25 16:05:29.269	2026-08-25 16:06:40.784	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	house	lideta	\N
b521bb29-4b4c-443d-8a15-24707ac1a9b2	apartment		jdwgl		1000	4	f	neear bole	\N	\N	APPROVED	2026-08-22 15:50:04.79	\N	2026-08-22 15:37:09.005	2026-08-28 08:09:07.032	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	house	nifassilklafto	\N
17e41811-e855-4429-a2d6-7a52469d278b	hose		sjhdgha		1888	-8	f	bole 	-11	\N	REJECTED	\N	\N	2026-08-25 16:09:51.647	2026-08-25 16:11:53.886	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	villa	yeka	\N
fc2e9425-a5ec-4e7d-b7dc-67626691e242	villa		jksda		1000	2	f	ldeta	\N	\N	RENTED	2026-08-22 15:27:46.676	\N	2026-08-22 15:25:26.897	2026-08-28 08:11:44.452	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	villa	nifassilklafto	\N
592e0338-6f28-445f-8302-f5ce36b13c6b	villa		new villa		10000	-10	t	bole	\N	\N	RENTED	2026-08-28 08:17:02.094	\N	2026-08-28 08:15:59.865	2026-08-28 08:35:22.919	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	villa	lideta	\N
f9774764-1f8f-4347-b990-965e169b523a	house		new		2500	5	f	aroun dembel	\N	\N	RENTED	2026-08-24 13:06:45.299	\N	2026-08-24 13:05:58.146	2026-08-26 08:25:20.685	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	house	kirkos	\N
b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	apartment		new apartment		3000	4	t	bole	\N	\N	REJECTED	\N	\N	2026-08-28 07:39:17.688	2026-08-28 07:39:54.694	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	nifassilklafto	not suitable
5cc0f07a-7447-4127-b7b6-6c4c02755e89	villa		i want villa		1000	2	f	ldeta	\N	\N	APPROVED	2026-08-22 14:43:13.474	\N	2026-08-22 14:40:38.715	2026-08-28 08:17:13.168	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	villa	lideta	\N
b1ffb219-650f-40c4-90f2-84d88f964edc	house		new hohjgfd		10000	5	t	yeka	\N	\N	REJECTED	\N	\N	2026-08-28 08:29:56.659	2026-08-28 08:31:42.382	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	apartment	lideta	Missing or blurry property images.
10e56593-5517-496e-935f-0950f288b8d4	house		dfghj		100000	6	f		\N	\N	REJECTED	\N	\N	2026-08-28 09:23:12.597	2026-08-28 09:40:58.348	695621d0-0e35-45e7-8316-3a4daa468f6c	house	lemikura	\N
1e486f4b-70aa-4d6b-806d-036627fa49f0	house		dfghj		100000	6	f	bjlhi	\N	\N	APPROVED	2026-08-28 09:41:09.936	\N	2026-08-28 09:23:48.75	2026-08-28 09:41:09.938	695621d0-0e35-45e7-8316-3a4daa468f6c	house	lemikura	\N
6622acdb-d691-401c-9178-ee4af8c39431	aqwdgeywuhigjhkojl	avsgwdqefgj	asdq3w4fe5rt	4t5w6ye7uyio	5000	3	t	w23e4r5t6y7uyigfiuyterw	9.34	38.375	APPROVED	2026-08-28 10:57:25.049	\N	2026-08-28 09:37:27.118	2026-08-28 10:57:25.051	cc3ed5d4-79e8-45bc-a135-f84b0137c036	house	nifassilklafto	\N
7d93135d-1c10-4371-a598-5f99b2df57ad	house		dfghj		100000	6	f	bjlhi	89	88	APPROVED	2026-08-28 10:57:31.429	\N	2026-08-28 09:24:07.583	2026-08-28 10:57:31.431	695621d0-0e35-45e7-8316-3a4daa468f6c	house	lemikura	\N
\.


--
-- Data for Name: PropertyImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyImage" (id, url, "propertyId", "createdAt") FROM stdin;
3d8a9ddf-65b5-4bf3-a1a5-bca9b419e6c2	/uploads/1787385639795-624933605.jpg	722333c9-0086-4dca-8642-ec62e34c193e	2026-08-22 08:00:40.613
89866d91-fb0d-4eb3-ade2-f18e4caf3211	/uploads/1787409639814-323783506.jpg	5cc0f07a-7447-4127-b7b6-6c4c02755e89	2026-08-22 14:40:40.566
547b8ddb-9d2b-4aba-aa17-92504fca163d	/uploads/1787412327727-824606625.jpg	fc2e9425-a5ec-4e7d-b7dc-67626691e242	2026-08-22 15:25:28.485
7b7fd2e9-3e86-4448-8d91-09a5e43982ea	/uploads/1787413029798-486728697.jpg	b521bb29-4b4c-443d-8a15-24707ac1a9b2	2026-08-22 15:37:11.157
c802823b-c146-4313-b03c-c703b55d9aec	/uploads/1787553339088-521539395.jpg	daecc830-469c-4f56-ac13-7a909a7c6bea	2026-08-24 06:35:39.794
9738c5a7-e197-4981-876f-9bbee098fe65	/uploads/1787569535703-387237372.jpg	6919c6ab-0ca7-4472-b705-1ef5825bbbdf	2026-08-24 11:05:36.403
abe8120d-b88b-40b0-be49-127679969226	/uploads/1787576493222-64382901.jpg	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-24 13:01:33.681
7a5806c3-2aa0-4a93-923e-4ad51b7231b2	/uploads/1787576761222-117776475.jpg	f9774764-1f8f-4347-b990-965e169b523a	2026-08-24 13:06:01.794
ab665bf7-e64e-4d19-a401-41063c8cd790	/uploads/1787645911492-176370897.jpg	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	2026-08-25 08:18:32.165
4be60951-2faa-433e-84ad-0dacaa276a87	/uploads/1787646085600-929087896.jpg	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	2026-08-25 08:21:28.72
26371a43-c3dc-4e3b-9cbd-e8fb4fc82e3c	/uploads/1787646110080-203863541.jpg	8b6f85a2-d834-4049-be7a-79c437c3d549	2026-08-25 08:21:51.266
a6a69cfe-2788-439d-af6c-0c46e68fa7ce	/uploads/1787646132729-191607584.jpg	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	2026-08-25 08:22:13.993
ecb66e23-5dc5-4a6e-be12-e0f2f09b4567	/uploads/1787646151683-988652822.jpg	8b6f85a2-d834-4049-be7a-79c437c3d549	2026-08-25 08:22:34.131
f5373bcc-f492-49bd-a9e0-ca2b3c56edbd	/uploads/1787670123890-393826007.jpg	a9ed883d-db91-4bd3-9c40-23e33fe76ea0	2026-08-25 15:02:06.142
d8339e7f-0875-46cf-98da-1939017d5b27	/uploads/1787673686201-533830669.jpg	e41cd36b-4763-4434-a8a7-d3395cc4e09a	2026-08-25 16:01:26.783
c620ca50-739f-4568-9c8d-f976f2cc0dbb	/uploads/1787673931064-304079994.jpg	d0eeae65-1699-4f90-a649-a9f0ef87ada6	2026-08-25 16:05:31.547
896b65f4-ae86-4685-9287-c5b427303b79	/uploads/1787674193896-996408144.jpg	17e41811-e855-4429-a2d6-7a52469d278b	2026-08-25 16:09:54.41
9eed84fb-4345-43ff-89ae-342ec2fea08e	/uploads/1787674254031-504747202.jpg	17e41811-e855-4429-a2d6-7a52469d278b	2026-08-25 16:10:56.733
48b3d616-2412-4308-b021-24b7870c79a7	/uploads/1787674312451-904528570.jpg	17e41811-e855-4429-a2d6-7a52469d278b	2026-08-25 16:11:54.443
bc6036fc-69ac-4f73-9c9a-cda52d80412a	/uploads/1787731655714-570109511.jpg	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-26 08:07:37.013
5d68e595-e905-4833-868d-688938123ed0	/uploads/1787747676255-161352018.jpg	41af5363-15dc-4c75-afd6-a38f629f22b5	2026-08-26 12:34:37.955
d6b9be31-e190-4425-b2ca-c08a36c896bd	/uploads/fayda-f079ef92-23f3-4645-a9f7-ab7a2299ec2d-1787827021444.jpg	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	2026-08-27 10:37:01.939
cb341991-4075-4671-a545-2eab44342e4c	/uploads/1787902759530-141497756.jpg	b8bc4a3d-8bda-4ed9-a52b-486f9e9560d0	2026-08-28 07:39:19.932
1d9188c4-acc8-430d-8eb4-df68e9fb0536	/uploads/1787903280673-148483618.jpg	6a235e1f-a461-4f98-bacb-4153743d51cd	2026-08-28 07:48:01.048
afe100ca-90cc-4916-ad9a-89d2c073995c	/uploads/1787904961428-245127639.jpg	592e0338-6f28-445f-8302-f5ce36b13c6b	2026-08-28 08:16:01.814
92a4309d-fa63-4df0-b446-148c27c377cf	/uploads/1787905006390-933007580.jpg	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	2026-08-28 08:16:46.748
4b5fd967-259d-4d84-afc2-4350ac6b7341	/uploads/1787905798278-148084636.jpg	b1ffb219-650f-40c4-90f2-84d88f964edc	2026-08-28 08:29:58.636
495d73e4-e854-49ef-abcf-b282c054a9c5	/uploads/1787905820355-797028187.jpg	b1ffb219-650f-40c4-90f2-84d88f964edc	2026-08-28 08:30:21.635
c9b2f522-2e7f-4383-af5a-10e2f0922c18	/uploads/1787909850113-788690434.jpg	6622acdb-d691-401c-9178-ee4af8c39431	2026-08-28 09:37:30.617
160590ac-2dd9-477f-adb5-f8f30b4dfe9f	/uploads/1787914529750-246842987.jpg	c3e21d20-730b-42e5-9841-3c5bb2068c80	2026-08-28 10:55:30.13
7817de7b-d9c5-46f9-a96b-007b731cdedb	/uploads/1787915454806-513605497.jpg	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	2026-08-28 11:10:56.047
2d91a0a9-39e0-41e8-bd4d-d9e6f1c24f26	/uploads/1787916399523-839667929.jpg	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	2026-08-28 11:26:40.005
b1f49cac-05c9-47ac-9213-a6246c880818	/uploads/1787916417379-163716954.jpg	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	2026-08-28 11:26:58.646
\.


--
-- Data for Name: RentalRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RentalRequest" (id, "tenantId", "propertyId", message, status, "createdAt", "updatedAt", "endDate", "landlordId", "proposedPrice", "startDate") FROM stdin;
0a04fb86-6e7c-4ca1-a796-52ae1872b624	8c2d09f5-f305-4b47-9eb5-c48ddca97552	722333c9-0086-4dca-8642-ec62e34c193e	i want  to rent for two days	PENDING	2026-08-22 14:30:51.486	2026-08-22 14:30:51.486	2026-08-29 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	800	2026-08-23 00:00:00
01790f71-3377-4e80-8ac8-2c85cc93fc56	8c2d09f5-f305-4b47-9eb5-c48ddca97552	8b6f85a2-d834-4049-be7a-79c437c3d549	kadsh	PENDING	2026-08-22 14:50:54.526	2026-08-22 14:50:54.526	2026-08-28 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	800	2026-08-21 00:00:00
8a9b3af7-2ec5-4a13-a90e-c7614f414b3d	29f7e681-e9db-45e1-8b37-330acf4a92a8	1e486f4b-70aa-4d6b-806d-036627fa49f0	defrtghyujkil;klkjhg	PENDING	2026-08-28 09:43:37.712	2026-08-28 09:43:37.712	2019-12-20 00:00:00	695621d0-0e35-45e7-8316-3a4daa468f6c	30000	2018-12-02 00:00:00
09a781d8-132d-4ab6-a7a5-7c0cfa83f853	29f7e681-e9db-45e1-8b37-330acf4a92a8	c3e21d20-730b-42e5-9841-3c5bb2068c80	dkfrglbkfgldfd	APPROVED	2026-08-28 11:00:12.488	2026-08-28 11:01:32.924	2019-08-03 00:00:00	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	46000	2018-02-03 00:00:00
f21b19ff-8ba9-4c18-83ff-d055cc6300bf	8c2d09f5-f305-4b47-9eb5-c48ddca97552	b521bb29-4b4c-443d-8a15-24707ac1a9b2	djgfew	APPROVED	2026-08-24 05:29:27.576	2026-08-24 11:13:37.926	2026-08-27 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	1000	2026-08-25 00:00:00
968bd6c6-d60f-45e4-a656-272510ded7d5	8c2d09f5-f305-4b47-9eb5-c48ddca97552	f9774764-1f8f-4347-b990-965e169b523a	test	APPROVED	2026-08-24 13:08:21.26	2026-08-24 13:08:21.26	2026-09-03 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	2026-08-26 00:00:00
509a1de2-e756-4683-9547-75bb79c97152	29f7e681-e9db-45e1-8b37-330acf4a92a8	e1f367e4-6816-4f0e-b2ca-b6c5452f673f	regnt	APPROVED	2026-08-27 11:07:31.23	2026-08-27 11:10:25.049	2019-12-03 00:00:00	f079ef92-23f3-4645-a9f7-ab7a2299ec2d	30000	2018-02-02 00:00:00
bafc1460-231b-4c0e-89f5-9c7928ea0b30	8c2d09f5-f305-4b47-9eb5-c48ddca97552	41af5363-15dc-4c75-afd6-a38f629f22b5	new test	APPROVED	2026-08-24 13:19:54.47	2026-08-28 07:52:49.454	2026-09-04 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	3000	2026-08-29 00:00:00
ba7096fa-5851-4b3a-96f9-1c6aa39a87ab	8c2d09f5-f305-4b47-9eb5-c48ddca97552	6919c6ab-0ca7-4472-b705-1ef5825bbbdf	dja	APPROVED	2026-08-24 11:10:18.657	2026-08-28 08:00:06.594	2026-08-28 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	2026-08-28 00:00:00
fc93d74d-1173-4aa0-88f8-5f9ab59a465c	8c2d09f5-f305-4b47-9eb5-c48ddca97552	daecc830-469c-4f56-ac13-7a909a7c6bea	dgasj	APPROVED	2026-08-24 08:13:58.832	2026-08-28 08:01:53.889	2026-09-05 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	2026-08-28 00:00:00
9c662c13-00c7-408c-8afb-72e6055f73bf	329e810e-2f28-4600-b142-237c5e364918	fc2e9425-a5ec-4e7d-b7dc-67626691e242	asdfgjkkk	PENDING	2026-08-28 08:06:10.556	2026-08-28 08:06:10.556	2019-12-13 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	1000	2018-12-03 00:00:00
e78797d8-6ebf-4023-9344-cf71b47296cd	8c2d09f5-f305-4b47-9eb5-c48ddca97552	fc2e9425-a5ec-4e7d-b7dc-67626691e242	das	APPROVED	2026-08-22 15:28:43.464	2026-08-28 08:11:41.516	2026-09-04 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	5000	2026-08-29 00:00:00
4d389abd-0b9a-41cc-9f4f-19ecc7555354	8c2d09f5-f305-4b47-9eb5-c48ddca97552	5cc0f07a-7447-4127-b7b6-6c4c02755e89	i want this villa for 10 days	APPROVED	2026-08-22 14:44:49.438	2026-08-28 08:14:00	2026-08-28 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	1000	2026-08-22 00:00:00
f138879b-1827-4f67-9525-7dc03449471b	8c2d09f5-f305-4b47-9eb5-c48ddca97552	2d0a237d-6bf6-4fce-bdcf-d32fe5862cf9	payment test	APPROVED	2026-08-28 08:17:52.417	2026-08-28 08:20:06.181	2026-09-02 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	2026-08-29 00:00:00
6351a56a-15b1-42dd-b3db-82657863c740	8c2d09f5-f305-4b47-9eb5-c48ddca97552	592e0338-6f28-445f-8302-f5ce36b13c6b	new requast	APPROVED	2026-08-28 08:33:14.817	2026-08-28 08:33:51.887	2026-09-05 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	2026-08-28 00:00:00
586f4c43-32ea-4111-918f-b0b4080ca550	8c2d09f5-f305-4b47-9eb5-c48ddca97552	2ce73ad3-648c-4176-8f03-3cc4172fb1f3	gjskghfsd	APPROVED	2026-08-28 11:38:05.581	2026-08-28 11:39:23.097	2026-09-05 00:00:00	fa5146fb-c66b-4184-9d20-20a5cc6b57d3	\N	2026-08-29 00:00:00
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "fullName", email, "passwordHash", phone, role, "resetToken", "resetTokenExpiry", "createdAt", "updatedAt", "isActive", "familyNumber", "faydaNumber", gender, "maritalStatus", "otpCode", "otpExpiry", "faydaBackImage", "faydaFrontImage") FROM stdin;
8ac8e1c0-f2bf-44ec-b5f9-5548280f8260	Abdulbasit	abdulbasit@gmail.com	$2b$10$iT1QZg5P7pfxgsuNwqYgUuZ6wTQqP9OImGzjrnO7F6tyDqRQXWBzS		ADMIN	\N	\N	2026-08-24 11:29:17.184	2026-08-25 05:54:07.587	t	\N	\N	\N	\N	\N	\N	\N	\N
b12b714a-9825-4f9e-96ad-b29a62067836	man mortal	admin@gmail.com	$2b$10$QkMtA0OgU.HrCdHHm0GP/enDA1ksF8I/DUV097cJfAPkHuV7Hsj4O	\N	ADMIN	\N	\N	2026-08-27 07:36:04.365	2026-08-27 07:36:04.365	t	\N	\N	\N	\N	\N	\N	\N	\N
b599a318-2f48-4458-a4a6-3edf54e04895	yidu	yidu@gmail.com	$2b$10$SxtNoHo8KtzcWQ136HzmXOeiOHdprn6zjdrBkc68loJTdejg94MWO	\N	TENANT	\N	\N	2026-08-22 04:36:18.021	2026-08-24 11:23:34.21	t	\N	\N	\N	\N	\N	\N	\N	\N
329e810e-2f28-4600-b142-237c5e364918	abyu	ab@gmail.com	$2b$10$JjRWeNc9hK7nbM4wKSEhTeY2nIyTYqCarCfGumEITgXN/hr3oaTiu	\N	TENANT	\N	\N	2026-08-28 08:03:58.774	2026-08-28 08:03:58.774	t	\N	\N	\N	\N	\N	\N	\N	\N
cc3ed5d4-79e8-45bc-a135-f84b0137c036	abyu eshetie	waw@gmail.com	$2b$10$RthF0GNIkUGpYM8bkCifzumXbuNLP.wBEQcFodnrozl6P8XDd7NvW	\N	LANDLORD	\N	\N	2026-08-28 08:49:13.927	2026-08-28 09:32:24.596	t	\N	3333333333333333	\N	\N	\N	\N	/uploads/fayda/1787909544537-140508043.jpg	/uploads/fayda/1787909544530-45946711.jpg
3a1c876f-2d31-4945-8c2b-66c19f9322d6	Foziya	foziya@gmail.com	$2b$10$IOk/FqXi79pdwBRE4ZGVN.b45.qipHL8l4.RzMXpO/yvXu8zVGu5O		ADMIN	\N	\N	2026-08-22 04:41:39.261	2026-08-28 11:08:07.141	t	\N	\N	\N	\N	\N	\N	\N	\N
f079ef92-23f3-4645-a9f7-ab7a2299ec2d	eyob eshetie	eyobe@gmail.com	$2b$10$L8Mx13gS1CvVAYe3Ud4rROYJylVTE5hAgRo/UwHOdAcVG/PCnoi6u	\N	LANDLORD	\N	\N	2026-08-26 07:46:34.937	2026-08-28 11:26:31.276	t	\N	1234567812345678	\N	\N	\N	\N	/uploads/fayda/1787916391258-350006736.jpg	/uploads/fayda/1787916391255-941988495.jpg
fa5146fb-c66b-4184-9d20-20a5cc6b57d3	letif	letif@gmail.com	$2b$10$Od3PyntgaQ2myAvsokVdwej4YM2dYmjTeGLCj3vJu63qempg1Dafe		LANDLORD	\N	\N	2026-08-21 19:03:46.577	2026-08-28 11:28:22.814	t	\N	312234567889	\N	\N	\N	\N	\N	\N
29f7e681-e9db-45e1-8b37-330acf4a92a8	man	robi@gmail.com	$2b$10$nKqAJk38NwsBNOEqvjJJ8.i7RBSDTtDoN4IapTuJ6.TRTrzCnKrN2	+2510932266884	TENANT	\N	\N	2026-08-27 10:43:58.986	2026-08-28 11:30:59.182	f	\N	\N	\N	\N	\N	\N	\N	\N
001a5598-8635-47e1-b6d2-cb7d7f168466	ababe	aba@gmail.com	$2b$10$0j8N.ulfwnmNro5jQc/VYOeWBk6zy.XChxrQbYSZ.qYbHPTe728uO	\N	TENANT	\N	\N	2026-08-27 13:02:37.843	2026-08-28 11:31:04.336	f	\N	\N	\N	\N	\N	\N	\N	\N
bfc68357-b5b9-470a-82b3-2400ec845ff7	ase	asee@gmail.com	$2b$10$F6WwALcKapAX/qKNwgloj.Bjr5MdqvzoqSWKO0DHsF3mtGfQjbP5W	\N	LANDLORD	\N	\N	2026-08-24 13:46:40.412	2026-08-28 11:31:10.146	t	\N	\N	\N	\N	\N	\N	\N	\N
b16169bd-e380-4616-9e21-88e551724bf9	nath	nath@mail.com	$2b$10$YS8Olf0zk6D3H6uO.oBEh.PRFdNYYV5OP/COVqnFbBpiIMKEWA.zu	\N	TENANT	\N	\N	2026-08-28 09:16:22.883	2026-08-28 11:31:12.596	f	\N	\N	\N	\N	\N	\N	\N	\N
1dc4421a-e935-4523-82ef-e4b3c2cf5119	ase	ase@gmail.com	$2b$10$EpYxtHhR1vMqq3ba.oJtSOZn90l2FhaoIC.eZ2wUavLY9L9SCAASC	\N	TENANT	\N	\N	2026-08-24 13:43:40.345	2026-08-28 11:31:16.487	t	\N	\N	\N	\N	\N	\N	\N	\N
695621d0-0e35-45e7-8316-3a4daa468f6c	joy 	joy@mail.com	$2b$10$BqhD1x1C3aIdMG03zihRpuyWWOlzWCPtQWR.JSDQjydrivXe.eQeu	\N	LANDLORD	\N	\N	2026-08-28 09:20:42.985	2026-08-28 11:31:19.163	f	\N	123456789034567	\N	\N	\N	\N	\N	\N
48acb94e-2b2b-446d-b3ec-e1d4d495f662	abyu man	team@gmail.com	$2b$10$Wtxxe8G9ORuHSu4/X.0loO3tOb7CKgm/7cdkKuAutvVRc/jUnX1HO	\N	ADMIN	\N	\N	2026-08-28 06:13:13.87	2026-08-28 11:32:06.215	f	\N	\N	\N	\N	\N	\N	\N	\N
8c2d09f5-f305-4b47-9eb5-c48ddca97552	Fiker	fikiylkal@gmail.com	$2b$10$Nw3of1pqavPy8eqjw5K2/edTcVxz0AB9B4oAoTDE1jIVW9hOFmsT.	+251901072272	TENANT	\N	\N	2026-08-21 19:04:29.303	2026-08-28 11:36:23.185	t	4	1234567890123456	MALE	SINGLE	\N	\N	\N	\N
6cd780a7-9697-4f7c-9d50-2a075000152f	abyu eshetie	land@gmail.com	$2b$10$gNWONti/wcmOEpXL9k8nrejsBO550UfUTQp9BPbfUmxmW359V.PbK	\N	LANDLORD	\N	\N	2026-08-31 08:51:20.146	2026-08-31 08:51:20.146	t	\N	\N	\N	\N	\N	\N	\N	\N
2221fa27-79b7-41d4-b86a-ceb8fe485ce5	abyu eshetie	abe@gmail.com	$2b$10$G8vYA0PlDbXJVfoghnHLl.XBESttabdbtB/4CpEOO9yB9ce2rdeZu	\N	LANDLORD	\N	\N	2026-08-31 12:09:05.743	2026-08-31 12:09:05.743	t	\N	\N	\N	\N	\N	\N	\N	\N
57b5d7b6-5ae3-42d5-bfd7-49483093e318	man	man12@gmail.com	$2b$10$8iA0uL5lYvcBb5dsBiDEX.ek6/P92IiKu9rwkETa5BB2FtEhNEmqW	\N	TENANT	\N	\N	2026-09-01 11:04:33.995	2026-09-01 11:04:33.995	t	\N	\N	\N	\N	\N	\N	\N	\N
e9d80411-22a8-4af1-bd08-4f11aad0216f	eyobe	eyob12@gmail.com	$2b$10$0R5e0Py5OeTWL9klndlV/uVesdFDc8XYKeB/fp7N0GsY.Mn72J.UC	\N	ADMIN	\N	\N	2026-09-01 12:16:52.539	2026-09-01 12:16:52.539	t	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: CommissionSetting CommissionSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionSetting"
    ADD CONSTRAINT "CommissionSetting_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Lease Lease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lease"
    ADD CONSTRAINT "Lease_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PropertyImage PropertyImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyImage"
    ADD CONSTRAINT "PropertyImage_pkey" PRIMARY KEY (id);


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: RentalRequest RentalRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RentalRequest"
    ADD CONSTRAINT "RentalRequest_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Favorite_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Favorite_propertyId_idx" ON public."Favorite" USING btree ("propertyId");


--
-- Name: Favorite_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Favorite_userId_idx" ON public."Favorite" USING btree ("userId");


--
-- Name: Favorite_userId_propertyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Favorite_userId_propertyId_key" ON public."Favorite" USING btree ("userId", "propertyId");


--
-- Name: Lease_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_propertyId_idx" ON public."Lease" USING btree ("propertyId");


--
-- Name: Lease_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_status_idx" ON public."Lease" USING btree (status);


--
-- Name: Lease_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_tenantId_idx" ON public."Lease" USING btree ("tenantId");


--
-- Name: Message_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_createdAt_idx" ON public."Message" USING btree ("createdAt");


--
-- Name: Message_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_propertyId_idx" ON public."Message" USING btree ("propertyId");


--
-- Name: Message_receiverId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_receiverId_idx" ON public."Message" USING btree ("receiverId");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Payment_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payment_createdAt_idx" ON public."Payment" USING btree ("createdAt");


--
-- Name: Payment_gatewayTransactionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_gatewayTransactionId_key" ON public."Payment" USING btree ("gatewayTransactionId");


--
-- Name: Payment_leaseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_leaseId_key" ON public."Payment" USING btree ("leaseId");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: PropertyImage_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyImage_propertyId_idx" ON public."PropertyImage" USING btree ("propertyId");


--
-- Name: Property_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_categoryId_idx" ON public."Property" USING btree ("categoryId");


--
-- Name: Property_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_landlordId_idx" ON public."Property" USING btree ("landlordId");


--
-- Name: Property_locationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_locationId_idx" ON public."Property" USING btree ("locationId");


--
-- Name: Property_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_status_idx" ON public."Property" USING btree (status);


--
-- Name: RentalRequest_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentalRequest_landlordId_idx" ON public."RentalRequest" USING btree ("landlordId");


--
-- Name: RentalRequest_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentalRequest_propertyId_idx" ON public."RentalRequest" USING btree ("propertyId");


--
-- Name: RentalRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentalRequest_status_idx" ON public."RentalRequest" USING btree (status);


--
-- Name: RentalRequest_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentalRequest_tenantId_idx" ON public."RentalRequest" USING btree ("tenantId");


--
-- Name: RentalRequest_tenantId_propertyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RentalRequest_tenantId_propertyId_key" ON public."RentalRequest" USING btree ("tenantId", "propertyId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: idx_property_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_category ON public."Property" USING btree ("categoryId");


--
-- Name: idx_property_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_location ON public."Property" USING btree ("locationId");


--
-- Name: idx_property_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_search ON public."Property" USING gin (to_tsvector('english'::regconfig, ((COALESCE("titleEn", ''::text) || ' '::text) || COALESCE("descriptionEn", ''::text))));


--
-- Name: Favorite Favorite_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lease Lease_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lease"
    ADD CONSTRAINT "Lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lease Lease_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lease"
    ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyImage PropertyImage_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyImage"
    ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Property Property_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Property Property_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Property Property_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RentalRequest RentalRequest_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RentalRequest"
    ADD CONSTRAINT "RentalRequest_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RentalRequest RentalRequest_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RentalRequest"
    ADD CONSTRAINT "RentalRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RentalRequest RentalRequest_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RentalRequest"
    ADD CONSTRAINT "RentalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cukXLWi5qlCG35W56b1E82VGxZWcIJlWooSyAe5DmuqMRFW2VyaelklI8aSykld

