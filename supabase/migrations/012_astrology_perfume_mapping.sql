-- Deterministic astrology -> perfume relational mapping schema.

create table if not exists public.perfumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.planets (
  id integer primary key,
  name text not null unique,
  sanskrit_name text not null unique
);

insert into public.planets (id, name, sanskrit_name)
values
  (1, 'Sun', 'Surya'),
  (2, 'Moon', 'Chandra'),
  (3, 'Mars', 'Mangal'),
  (4, 'Mercury', 'Budh'),
  (5, 'Jupiter', 'Guru'),
  (6, 'Venus', 'Shukra'),
  (7, 'Saturn', 'Shani')
on conflict (id) do update set
  name = excluded.name,
  sanskrit_name = excluded.sanskrit_name;

create table if not exists public.zodiac_signs (
  id integer primary key,
  name text not null unique,
  start_degree numeric not null,
  end_degree numeric not null
);

insert into public.zodiac_signs (id, name, start_degree, end_degree)
values
  (1, 'Aries', 0, 30),
  (2, 'Taurus', 30, 60),
  (3, 'Gemini', 60, 90),
  (4, 'Cancer', 90, 120),
  (5, 'Leo', 120, 150),
  (6, 'Virgo', 150, 180),
  (7, 'Libra', 180, 210),
  (8, 'Scorpio', 210, 240),
  (9, 'Sagittarius', 240, 270),
  (10, 'Capricorn', 270, 300),
  (11, 'Aquarius', 300, 330),
  (12, 'Pisces', 330, 360)
on conflict (id) do update set
  name = excluded.name,
  start_degree = excluded.start_degree,
  end_degree = excluded.end_degree;

create table if not exists public.nakshatras (
  id integer primary key,
  name text not null unique,
  planet_id integer not null references public.planets(id),
  start_degree numeric not null,
  end_degree numeric not null
);

insert into public.nakshatras (id, name, planet_id, start_degree, end_degree)
values
  (1, 'Ashwini', 7, 0, 13.333333),
  (2, 'Bharani', 6, 13.333333, 26.666667),
  (3, 'Krittika', 1, 26.666667, 40),
  (4, 'Rohini', 2, 40, 53.333333),
  (5, 'Mrigashira', 3, 53.333333, 66.666667),
  (6, 'Ardra', 4, 66.666667, 80),
  (7, 'Punarvasu', 5, 80, 93.333333),
  (8, 'Pushya', 7, 93.333333, 106.666667),
  (9, 'Ashlesha', 4, 106.666667, 120),
  (10, 'Magha', 7, 120, 133.333333),
  (11, 'Purva Phalguni', 6, 133.333333, 146.666667),
  (12, 'Uttara Phalguni', 1, 146.666667, 160),
  (13, 'Hasta', 2, 160, 173.333333),
  (14, 'Chitra', 3, 173.333333, 186.666667),
  (15, 'Swati', 7, 186.666667, 200),
  (16, 'Vishakha', 5, 200, 213.333333),
  (17, 'Anuradha', 7, 213.333333, 226.666667),
  (18, 'Jyeshtha', 4, 226.666667, 240),
  (19, 'Mula', 7, 240, 253.333333),
  (20, 'Purva Ashadha', 6, 253.333333, 266.666667),
  (21, 'Uttara Ashadha', 1, 266.666667, 280),
  (22, 'Shravana', 2, 280, 293.333333),
  (23, 'Dhanishta', 3, 293.333333, 306.666667),
  (24, 'Shatabhisha', 7, 306.666667, 320),
  (25, 'Purva Bhadrapada', 5, 320, 333.333333),
  (26, 'Uttara Bhadrapada', 7, 333.333333, 346.666667),
  (27, 'Revati', 4, 346.666667, 360)
on conflict (id) do update set
  name = excluded.name,
  planet_id = excluded.planet_id,
  start_degree = excluded.start_degree,
  end_degree = excluded.end_degree;

create table if not exists public.perfume_planet_mapping (
  planet_id integer not null references public.planets(id) on delete cascade,
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  primary key (planet_id, perfume_id)
);

create table if not exists public.perfume_nakshatra_mapping (
  nakshatra_id integer not null references public.nakshatras(id) on delete cascade,
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  primary key (nakshatra_id, perfume_id)
);

create table if not exists public.perfume_zodiac_mapping (
  zodiac_id integer not null references public.zodiac_signs(id) on delete cascade,
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  primary key (zodiac_id, perfume_id)
);

create index if not exists idx_perfume_planet_mapping_planet on public.perfume_planet_mapping(planet_id);
create index if not exists idx_perfume_nakshatra_mapping_nakshatra on public.perfume_nakshatra_mapping(nakshatra_id);
create index if not exists idx_perfume_zodiac_mapping_zodiac on public.perfume_zodiac_mapping(zodiac_id);
