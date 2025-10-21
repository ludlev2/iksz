#!/usr/bin/env ts-node
// @ts-nocheck

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const SHEET_RANGE = 'Sheet1!A2:AC';

const REQUIRED_COLUMNS = [
  'Opportunity External ID',
  'Organization Name',
  'Opportunity Title',
  'Category Slug',
  'Shift External ID',
  'Shift Start (ISO)',
  'Shift End (ISO)',
  'Capacity',
];

function getEnv(name: string, required = true) {
  const value = process.env[name];
  if (required && (!value || value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadEnvFiles() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const [key, ...rest] = trimmed.split('=');
      if (!key) {
        continue;
      }
      if (process.env[key] !== undefined) {
        continue;
      }
      const value = rest.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      process.env[key] = value;
    }
  }
}

loadEnvFiles();

async function getGoogleSheetsClient() {
  const auth = new google.auth.JWT({
    email: getEnv('GOOGLE_SHEETS_CLIENT_EMAIL'),
    key: getEnv('GOOGLE_SHEETS_PRIVATE_KEY').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

function getSupabaseClient() {
  return createClient(
    getEnv('SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  );
}

function validateHeader(header) {
  for (const requiredColumn of REQUIRED_COLUMNS) {
    if (!header.includes(requiredColumn)) {
      throw new Error(`Missing required column "${requiredColumn}" in the sheet header`);
    }
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function parseRow(header, row) {
  const map = {};
  header.forEach((key, index) => {
    map[key] = row[index]?.trim() ?? '';
  });

  if (
    !map['Opportunity External ID'] ||
    !map['Opportunity Title'] ||
    !map['Organization Name'] ||
    !map['Category Slug'] ||
    !map['Shift External ID'] ||
    !map['Shift Start (ISO)'] ||
    !map['Shift End (ISO)'] ||
    !map['Capacity']
  ) {
    return null;
  }

  const hoursAwarded = map['Hours Awarded']
    ? Number(map['Hours Awarded'])
    : (new Date(map['Shift End (ISO)']).getTime() - new Date(map['Shift Start (ISO)']).getTime()) /
      3_600_000;

  return {
    opportunityExternalId: map['Opportunity External ID'],
    organizationName: map['Organization Name'],
    organizationSlug: map['Organization Slug'] || undefined,
    organizationEmail: map['Organization Email'] || undefined,
    organizationPhone: map['Organization Phone'] || undefined,
    opportunityTitle: map['Opportunity Title'],
    shortDescription: map['Short Description'] || undefined,
    longDescription: map['Long Description'] || undefined,
    categorySlug: map['Category Slug'],
    tags: map['Tags (comma separated)']
      ? map['Tags (comma separated)']
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    address: map['Address'] || undefined,
    city: map['City'] || undefined,
    latitude: map['Latitude'] ? Number(map['Latitude']) : undefined,
    longitude: map['Longitude'] ? Number(map['Longitude']) : undefined,
    minGrade: map['Minimum Grade'] ? Number(map['Minimum Grade']) : undefined,
    maxGrade: map['Maximum Grade'] ? Number(map['Maximum Grade']) : undefined,
    published: map['Published?']?.toLowerCase() === 'true',
    publishedAt: map['Published At (ISO)'] || undefined,
    shiftExternalId: map['Shift External ID'],
    shiftTitle: map['Shift Title'] || undefined,
    shiftStart: map['Shift Start (ISO)'],
    shiftEnd: map['Shift End (ISO)'],
    shiftHoursAwarded: Number.isFinite(hoursAwarded) ? Number(hoursAwarded.toFixed(2)) : 0,
    shiftCapacity: Number(map['Capacity']),
    shiftNotes: map['Shift Notes'] || undefined,
    shiftStatus: map['Shift Status'] || 'draft',
  };
}

const categoryCache = new Map();

async function resolveCategoryId(supabase, slug) {
  if (categoryCache.has(slug)) {
    return categoryCache.get(slug);
  }

  const { data, error } = await supabase
    .from('opportunity_categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to load category "${slug}": ${error.message}`);
  }
  if (!data) {
    throw new Error(`Category slug "${slug}" not found in opportunity_categories`);
  }

  categoryCache.set(slug, data.id);
  return data.id;
}

async function upsertOrganization(supabase, payload) {
  const slug = payload.organizationSlug || slugify(payload.organizationName);

  const { data, error } = await supabase
    .from('organization_profiles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to load organization "${payload.organizationName}": ${error.message}`);
  }

  if (data) {
    await supabase
      .from('organization_profiles')
      .update({
        name: payload.organizationName,
        email: payload.organizationEmail || null,
        phone: payload.organizationPhone || null,
      })
      .eq('id', data.id);
    return data.id;
  }

  const insertPayload = {
    slug,
    name: payload.organizationName,
    email: payload.organizationEmail || null,
    phone: payload.organizationPhone || null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('organization_profiles')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create organization "${payload.organizationName}": ${insertError.message}`);
  }

  return inserted.id;
}

async function upsertOpportunity(supabase, payload, organizationId, createdByProfileId) {
  const categoryId = await resolveCategoryId(supabase, payload.categorySlug);

  const { data: existing, error } = await supabase
    .from('opportunities')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('title', payload.opportunityTitle)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to lookup opportunity "${payload.opportunityTitle}": ${error.message}`);
  }

  const updatePayload = {
    short_description: payload.shortDescription || null,
    description: payload.longDescription || null,
    category_id: categoryId,
    tags: payload.tags.length > 0 ? payload.tags : null,
    address: payload.address || null,
    city: payload.city || null,
    lat: payload.latitude ?? null,
    lng: payload.longitude ?? null,
    min_grade: payload.minGrade ?? null,
    max_grade: payload.maxGrade ?? null,
    published: payload.published,
    published_at: payload.publishedAt || null,
  };

  if (existing) {
    await supabase.from('opportunities').update(updatePayload).eq('id', existing.id);
    return existing.id;
  }

  const insertPayload = {
    organization_id: organizationId,
    title: payload.opportunityTitle,
    created_by: createdByProfileId,
    ...updatePayload,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('opportunities')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create opportunity "${payload.opportunityTitle}": ${insertError.message}`);
  }

  return inserted.id;
}

async function upsertShift(supabase, payload, opportunityId) {
  const { data: existing, error } = await supabase
    .from('opportunity_shifts')
    .select('id')
    .eq('opportunity_id', opportunityId)
    .eq('start_at', payload.shiftStart)
    .eq('end_at', payload.shiftEnd)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to lookup shift "${payload.shiftExternalId}": ${error.message}`);
  }

  const basePayload = {
    opportunity_id: opportunityId,
    title: payload.shiftTitle || null,
    start_at: payload.shiftStart,
    end_at: payload.shiftEnd,
    hours_awarded: payload.shiftHoursAwarded,
    capacity: payload.shiftCapacity,
    status: payload.shiftStatus ?? 'draft',
    notes: payload.shiftNotes || null,
  };

  if (existing) {
    await supabase.from('opportunity_shifts').update(basePayload).eq('id', existing.id);
    return existing.id;
  }

  const { error: insertError } = await supabase.from('opportunity_shifts').insert(basePayload);

  if (insertError) {
    throw new Error(`Failed to create shift "${payload.shiftExternalId}": ${insertError.message}`);
  }
}

async function main() {
  const sheetId = getEnv('GOOGLE_SHEET_ID');
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID must be set');
  }

  const sheets = await getGoogleSheetsClient();
  const supabase = getSupabaseClient();
  const createdByProfileId = getEnv('SYNC_CREATED_BY_PROFILE_ID');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: SHEET_RANGE,
  });

  const rows = response.data.values ?? [];
  if (rows.length === 0) {
    console.info('No rows found in the sheet.');
    return;
  }

  const headerRow = (await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1:AC1',
  })).data.values?.[0];

  if (!headerRow) {
    throw new Error('Could not read header row from the sheet.');
  }

  validateHeader(headerRow);

  const successes: string[] = [];
  const skips: string[] = [];
  const errors: Array<{ id: string; message: string }> = [];

  for (const row of rows) {
    const parsed = parseRow(headerRow, row);
    if (!parsed) {
      skips.push(`Skipped: missing required fields => ${row.join(' | ')}`);
      continue;
    }

    try {
      const organizationId = await upsertOrganization(supabase, parsed);
      const opportunityId = await upsertOpportunity(
        supabase,
        parsed,
        organizationId,
        createdByProfileId,
      );
      await upsertShift(supabase, parsed, opportunityId);
      successes.push(parsed.opportunityExternalId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ id: parsed.opportunityExternalId, message });
    }
  }

  console.info(`✅ Imported or updated ${successes.length} opportunities.`);
  if (skips.length > 0) {
    console.info(`⏭️ Skipped ${skips.length} row(s):`);
    skips.forEach((skip) => console.info(`   - ${skip}`));
  }
  if (errors.length > 0) {
    console.error(`❌ Encountered ${errors.length} error(s):`);
    errors.forEach((item) => console.error(`   - ${item.id}: ${item.message}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Unexpected error during sync:', error);
  process.exit(1);
});
