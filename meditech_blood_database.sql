-- BloodBridge / MedTech Blood & Platelet Rapid Response System
-- Supabase-ready database script
-- Run this entire file in Supabase -> SQL Editor -> New query -> Run

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. BLOOD BANKS
-- =========================================================
create table if not exists public.blood_banks (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text,
    city text,
    state text default 'Maharashtra',
    phone text,
    email text,
    latitude numeric,
    longitude numeric,
    created_at timestamptz default now()
);

-- =========================================================
-- 2. HOSPITALS
-- =========================================================
create table if not exists public.hospitals (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text,
    city text,
    state text default 'Maharashtra',
    phone text,
    email text,
    emergency_contact text,
    latitude numeric,
    longitude numeric,
    created_at timestamptz default now()
);

-- =========================================================
-- 3. DONORS
-- =========================================================
create table if not exists public.donors (
    id uuid primary key default gen_random_uuid(),
    donor_name text not null,
    age integer,
    gender text,
    blood_group text not null,
    phone text,
    email text,
    city text,
    address text,
    donation_type text default 'Blood',
    availability text default 'Available',
    last_donation_date date,
    eligible boolean default true,
    created_at timestamptz default now()
);

-- =========================================================
-- 4. BLOOD INVENTORY
-- =========================================================
create table if not exists public.blood_inventory (
    id uuid primary key default gen_random_uuid(),
    blood_bank_id uuid references public.blood_banks(id) on delete cascade,
    blood_group text not null,
    component text not null default 'Whole Blood',
    units integer not null default 0,
    expiry_date date,
    status text default 'Available',
    updated_at timestamptz default now()
);

-- =========================================================
-- 5. BLOOD REQUESTS
-- Matches the type of data shown in the Supabase screenshot
-- =========================================================
create table if not exists public.blood_requests (
    id text primary key,
    patient_name text not null,
    patient_age integer,
    patient_gender text,
    patient_condition text,
    blood_group text not null,
    component text default 'Blood',
    units_required integer default 1,
    hospital_id uuid references public.hospitals(id) on delete set null,
    hospital_name text,
    contact_number text,
    urgency text default 'High',
    status text default 'Pending',
    city text,
    request_notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =========================================================
-- 6. ALERTS
-- =========================================================
create table if not exists public.alerts (
    id uuid primary key default gen_random_uuid(),
    request_id text references public.blood_requests(id) on delete cascade,
    title text not null,
    message text not null,
    alert_type text default 'Emergency',
    recipient_type text,
    recipient_id text,
    status text default 'Unread',
    created_at timestamptz default now()
);

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_donors_blood_group
    on public.donors(blood_group);

create index if not exists idx_donors_availability
    on public.donors(availability);

create index if not exists idx_inventory_blood_group
    on public.blood_inventory(blood_group);

create index if not exists idx_requests_blood_group
    on public.blood_requests(blood_group);

create index if not exists idx_requests_status
    on public.blood_requests(status);

create index if not exists idx_requests_urgency
    on public.blood_requests(urgency);

create index if not exists idx_alerts_request_id
    on public.alerts(request_id);

-- =========================================================
-- SAMPLE BLOOD BANKS
-- =========================================================
insert into public.blood_banks
(name, address, city, state, phone, email)
select * from (values
('City Blood Bank', 'Main Road', 'Kolhapur', 'Maharashtra', '9876543210', 'cityblood@example.com'),
('LifeCare Blood Bank', 'Station Road', 'Sangli', 'Maharashtra', '9876543211', 'lifecare@example.com'),
('Hope Blood Centre', 'Central Hospital Road', 'Pune', 'Maharashtra', '9876543212', 'hopeblood@example.com')
) as v(name,address,city,state,phone,email)
where not exists (select 1 from public.blood_banks b where b.name = v.name);

-- =========================================================
-- SAMPLE HOSPITALS
-- =========================================================
insert into public.hospitals
(name, address, city, state, phone, email, emergency_contact)
select * from (values
('City General Hospital', 'Main Road', 'Kolhapur', 'Maharashtra', '9876500010', 'cityhospital@example.com', '108'),
('LifeCare Hospital', 'Station Road', 'Sangli', 'Maharashtra', '9876500011', 'lifecarehospital@example.com', '108'),
('Metro Emergency Hospital', 'Central Road', 'Pune', 'Maharashtra', '9876500012', 'metrohospital@example.com', '108')
) as v(name,address,city,state,phone,email,emergency_contact)
where not exists (select 1 from public.hospitals h where h.name = v.name);

-- =========================================================
-- SAMPLE DONORS
-- =========================================================
insert into public.donors
(donor_name, age, gender, blood_group, phone, email, city, donation_type, availability, eligible)
select * from (values
('Rahul Patil', 24, 'Male', 'O+', '9000000001', 'rahul@example.com', 'Kolhapur', 'Blood', 'Available', true),
('Sneha Joshi', 22, 'Female', 'A+', '9000000002', 'sneha@example.com', 'Kolhapur', 'Blood', 'Available', true),
('Amit Shah', 29, 'Male', 'B+', '9000000003', 'amit@example.com', 'Sangli', 'Blood', 'Available', true),
('Priya Kulkarni', 26, 'Female', 'AB+', '9000000004', 'priya@example.com', 'Pune', 'Platelets', 'Available', true),
('Rohan Desai', 31, 'Male', 'O-', '9000000005', 'rohan@example.com', 'Kolhapur', 'Blood', 'Available', true)
) as v(donor_name,age,gender,blood_group,phone,email,city,donation_type,availability,eligible)
where not exists (select 1 from public.donors d where d.phone = v.phone);

-- =========================================================
-- SAMPLE INVENTORY
-- =========================================================
insert into public.blood_inventory
(blood_bank_id, blood_group, component, units, expiry_date, status)
select b.id, v.blood_group, v.component, v.units, v.expiry_date::date, 'Available'
from public.blood_banks b
cross join (values
    ('O+', 'Whole Blood', 12, current_date + 25),
    ('A+', 'Whole Blood', 8, current_date + 20),
    ('B+', 'Whole Blood', 10, current_date + 18),
    ('AB+', 'Whole Blood', 5, current_date + 15),
    ('O-', 'Whole Blood', 3, current_date + 12),
    ('A+', 'Platelets', 6, current_date + 5),
    ('O+', 'Platelets', 4, current_date + 4)
) as v(blood_group,component,units,expiry_date)
where b.name = 'City Blood Bank'
and not exists (
    select 1 from public.blood_inventory bi
    where bi.blood_bank_id = b.id
      and bi.blood_group = v.blood_group
      and bi.component = v.component
);

-- =========================================================
-- SAMPLE EMERGENCY REQUESTS
-- =========================================================
insert into public.blood_requests
(id, patient_name, patient_age, patient_gender, patient_condition,
 blood_group, component, units_required, hospital_name,
 contact_number, urgency, status, city, request_notes)
values
('REQ-2026-2381', 'Ankit Sharma', 34, 'Male', 'Accident',
 'O+', 'Blood', 2, 'City General Hospital', '9000010001',
 'Critical', 'Pending', 'Kolhapur', 'Immediate requirement'),

('REQ-2026-2571', 'Akanksha Kurundwade', 25, 'Female', 'Surgery',
 'A+', 'Blood', 1, 'LifeCare Hospital', '9000010002',
 'High', 'Pending', 'Kolhapur', 'Required urgently'),

('REQ-2026-3111', 'Riya Patil', 22, 'Female', 'Emergency',
 'B+', 'Blood', 2, 'Metro Emergency Hospital', '9000010003',
 'High', 'Pending', 'Pune', 'Emergency requirement'),

('REQ-2026-3521', 'Shreya Patil', 19, 'Female', 'Platelet deficiency',
 'A+', 'Platelets', 2, 'City General Hospital', '9000010004',
 'Critical', 'Pending', 'Kolhapur', 'Platelets needed urgently')
on conflict (id) do nothing;

-- =========================================================
-- SAMPLE ALERTS
-- =========================================================
insert into public.alerts
(request_id, title, message, alert_type, recipient_type, status)
select
    r.id,
    'Emergency Blood Request',
    'Urgent ' || r.blood_group || ' ' || r.component ||
    ' request for ' || r.patient_name ||
    '. Units required: ' || r.units_required,
    'Emergency',
    'Donors',
    'Unread'
from public.blood_requests r
where r.status = 'Pending'
and not exists (
    select 1 from public.alerts a where a.request_id = r.id
);

-- =========================================================
-- AUTO UPDATE updated_at FOR BLOOD REQUESTS
-- =========================================================
create or replace function public.update_blood_request_timestamp()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists blood_request_updated_at on public.blood_requests;

create trigger blood_request_updated_at
before update on public.blood_requests
for each row
execute function public.update_blood_request_timestamp();

-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================
alter table public.blood_banks enable row level security;
alter table public.hospitals enable row level security;
alter table public.donors enable row level security;
alter table public.blood_inventory enable row level security;
alter table public.blood_requests enable row level security;
alter table public.alerts enable row level security;

-- =========================================================
-- DEMO / HACKATHON POLICIES
-- These allow the hosted MVP frontend to read and write data.
-- For a production medical system, replace these with
-- authenticated role-based policies.
-- =========================================================
drop policy if exists "demo blood banks access" on public.blood_banks;
create policy "demo blood banks access"
on public.blood_banks for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "demo hospitals access" on public.hospitals;
create policy "demo hospitals access"
on public.hospitals for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "demo donors access" on public.donors;
create policy "demo donors access"
on public.donors for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "demo inventory access" on public.blood_inventory;
create policy "demo inventory access"
on public.blood_inventory for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "demo blood requests access" on public.blood_requests;
create policy "demo blood requests access"
on public.blood_requests for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "demo alerts access" on public.alerts;
create policy "demo alerts access"
on public.alerts for all
to anon, authenticated
using (true)
with check (true);

-- =========================================================
-- DONE
-- =========================================================
-- Tables created:
-- blood_banks
-- hospitals
-- donors
-- blood_inventory
-- blood_requests
-- alerts
