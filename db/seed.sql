-- Seed alapadatok az IKSZ Finder alkalmazáshoz

-- Profilok (admin / szervezet képviselői)
INSERT INTO profiles (id, role, full_name, phone, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'organization_admin', 'IKSZ Admin', '+36 30 123 4567', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'organization_admin', 'Segítő Kéz Koordinátor', '+36 30 234 5678', now(), now())
ON CONFLICT (id) DO UPDATE
SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  updated_at = now();

-- Kategóriák
INSERT INTO opportunity_categories (id, slug, label_hu)
VALUES
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'environment', 'Környezetvédelem'),
  ('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'elderly', 'Idősek segítése'),
  ('33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'animals', 'Állatvédelem'),
  ('44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'children', 'Gyermekek'),
  ('55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'social', 'Szociális'),
  ('66666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'education', 'Oktatás')
ON CONFLICT (slug) DO UPDATE
SET label_hu = EXCLUDED.label_hu;

-- Szervezetek
INSERT INTO organization_profiles (id, name, slug, description, website, email, phone, address, city, lat, lng, created_at, updated_at)
VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Zöld Budapest Egyesület', 'zold-budapest', 'Környezettudatos projektek Budapesten', 'https://zoldbudapest.hu', 'info@zoldbudapest.hu', '+36 1 234 5678', 'Városliget', 'Budapest', 47.5186, 19.0823, now(), now()),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Napfény Idősek Otthona', 'napfeny-otthon', 'Támogatás és programok budapesti időseknek', null, 'kapcsolat@napfenyotthon.hu', '+36 1 345 6789', 'Margit körút 45.', 'Budapest', 47.5125, 19.0364, now(), now()),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Budapest Állatmenhely', 'bp-allatmenhely', 'Gazdikereső állatok támogatása', 'https://allatmenhely.hu', 'info@allatmenhely.hu', '+36 1 456 7890', 'Üllői út 200.', 'Budapest', 47.4563, 19.1234, now(), now()),
  ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Remény Gyermekotthon', 'remeny-gyermekotthon', 'Gyermekek támogatása kreatív programokkal', null, 'info@remenyotthon.hu', '+36 1 567 8901', 'Váci út 150.', 'Budapest', 47.5567, 19.0678, now(), now()),
  ('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Máltai Szeretetszolgálat', 'maltai-szeretetszolgalat', 'Szociális segítség a rászorulóknak', 'https://maltai.hu', 'budapest@maltai.hu', '+36 1 678 9012', 'Keleti pályaudvar', 'Budapest', 47.5, 19.0833, now(), now()),
  ('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'FSZEK Könyvtár', 'fszek-konyvtar', 'Digitalizálási projektek könyvtáraknak', 'https://fszek.hu', 'onkentes@fszek.hu', '+36 1 789 0123', 'Szabó Ervin tér 1.', 'Budapest', 47.4925, 19.0613, now(), now())
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  updated_at = now();

-- Szervezet tagok
INSERT INTO organization_members (profile_id, organization_id, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'organization_admin', now()),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'organization_admin', now())
ON CONFLICT (profile_id, organization_id) DO NOTHING;

-- Lehetőségek
INSERT INTO opportunities (
  id,
  organization_id,
  title,
  short_description,
  description,
  category_id,
  tags,
  address,
  city,
  lat,
  lng,
  min_grade,
  max_grade,
  published,
  published_at,
  created_by
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Környezetvédelmi akció a Városligetben',
    'Szemétszedés és virágültetés Budapest szívében.',
    'Csatlakozz hozzánk egy környezetvédelmi akcióhoz! Szemetet szedünk és virágokat ültetünk a Városligetben. Minden eszközt biztosítunk, csak jó kedvet hozz magaddal!',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['környezettudatosság', 'csapatmunka'],
    'Városliget',
    'Budapest',
    47.5186,
    19.0823,
    9,
    12,
    true,
    now(),
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Idősek otthonában segítségnyújtás',
    'Beszélgetés, társasjátékok, séta az idősekkel.',
    'Segíts az idős lakóknak a mindennapi tevékenységekben. Beszélgetés, társasjátékok, séta a kertben. Egy mosolygós délután garantált!',
    '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['empátia', 'kommunikáció'],
    'Margit körút 45.',
    'Budapest',
    47.5125,
    19.0364,
    9,
    12,
    true,
    now(),
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Állatmenhely önkéntes nap',
    'Sétáltasd és gondozd a menhelyi kutyákat!',
    'Segíts a menhelyi kutyák gondozásában! Sétáltatás, etetés, kenneltakarítás. Az állatszeretet itt elengedhetetlen!',
    '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['állatszeretet', 'aktív'],
    'Üllői út 200.',
    'Budapest',
    47.4563,
    19.1234,
    9,
    12,
    true,
    now(),
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Gyermekotthon kreatív délután',
    'Kézműves programok és játék a gyermekotthon lakóival.',
    'Kreatív foglalkozások szervezése gyermekotthonban élő gyerekeknek. Kézműves tevékenységek, játékok, sport.',
    '44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['kreativitás', 'gyermekek'],
    'Váci út 150.',
    'Budapest',
    47.5567,
    19.0678,
    9,
    12,
    true,
    now(),
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Hajléktalan ellátás téli esték',
    'Meleg ital és ételosztás a Keleti pályaudvarnál.',
    'Meleg étel osztása és alapvető szükségletek biztosítása hajléktalan embereknek a téli időszakban.',
    '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['szociális', 'segítség'],
    'Keleti pályaudvar',
    'Budapest',
    47.5,
    19.0833,
    9,
    12,
    true,
    now(),
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Könyvtári digitalizálás',
    'Régi dokumentumok digitalizálása a FSZEK-ben.',
    'Segítség régi könyvek és dokumentumok digitalizálásában. Számítógépes ismeretek szükségesek.',
    '66666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['digitalizálás', 'informatika'],
    'Szabó Ervin tér 1.',
    'Budapest',
    47.4925,
    19.0613,
    9,
    12,
    true,
    now(),
    '11111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  tags = EXCLUDED.tags,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  min_grade = EXCLUDED.min_grade,
  max_grade = EXCLUDED.max_grade,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- Időpontok
INSERT INTO opportunity_shifts (
  id,
  opportunity_id,
  title,
  start_at,
  end_at,
  hours_awarded,
  capacity,
  status,
  notes,
  created_at
) VALUES
  (
    '10000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000101',
    'Szombati műszak',
    '2024-10-05T09:00:00+02:00',
    '2024-10-05T13:00:00+02:00',
    4,
    20,
    'published',
    'Találkozó a Hősök terénél 8:45-kor.',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000102',
    'Délutáni műszak',
    '2024-10-08T14:00:00+02:00',
    '2024-10-08T17:00:00+02:00',
    3,
    8,
    'published',
    'Kérjük, érkezz 10 perccel korábban.',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000103',
    'Délelőtti műszak',
    '2024-10-12T10:00:00+02:00',
    '2024-10-12T15:00:00+02:00',
    5,
    15,
    'published',
    'Vigyél váltóruhát és kényelmes cipőt.',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000104',
    'Kreatív délután',
    '2024-10-15T15:00:00+02:00',
    '2024-10-15T18:00:00+02:00',
    3,
    6,
    'published',
    'Foglalkozásvezető biztosított.',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000105',
    'Esti műszak',
    '2024-10-18T18:00:00+02:00',
    '2024-10-18T22:00:00+02:00',
    4,
    12,
    'published',
    'Öltözz melegen, a helyszín kültéri.',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000106',
    'Digitalizáló műszak',
    '2024-10-22T13:00:00+02:00',
    '2024-10-22T17:00:00+02:00',
    4,
    10,
    'published',
    'Kérjük, hozz saját fejhallgatót.',
    now()
  )
ON CONFLICT (id) DO UPDATE
SET
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at,
  hours_awarded = EXCLUDED.hours_awarded,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;
