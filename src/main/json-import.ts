import Database from 'better-sqlite3'

export type JsonImportError = {
  index: number
  field?: string
  message: string
}

export type JsonImportResult = {
  ok: boolean
  propertiesImported: number
  leasesImported: number
  errors: JsonImportError[]
}

type PropertyInput = {
  id?: unknown
  name?: unknown
  address?: unknown
  submarket?: unknown
  propertyClass?: unknown
  rsf?: unknown
  floors?: unknown
  yearBuilt?: unknown
}

type LeaseInput = {
  propertyId?: unknown
  tenant?: unknown
  suite?: unknown
  floor?: unknown
  rsf?: unknown
  leaseType?: unknown
  startDate?: unknown
  expirationDate?: unknown
  rent_dollarsSF?: unknown
  status?: unknown
}

function asString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value.trim() || null
  return String(value)
}

function asNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

function asInteger(value: unknown): number | null {
  const num = asNumber(value)
  return num === null ? null : Math.round(num)
}

export function importPropertyAndLeaseData(
  db: Database.Database,
  jsonContent: string
): JsonImportResult {
  const errors: JsonImportError[] = []
  let parsed: { properties?: unknown; leases?: unknown }

  try {
    parsed = JSON.parse(jsonContent)
  } catch (err) {
    return {
      ok: false,
      propertiesImported: 0,
      leasesImported: 0,
      errors: [
        {
          index: -1,
          message: err instanceof Error ? err.message : 'Invalid JSON'
        }
      ]
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      propertiesImported: 0,
      leasesImported: 0,
      errors: [
        {
          index: -1,
          message: 'Top-level JSON must be an object with "properties" and/or "leases" arrays'
        }
      ]
    }
  }

  const propertiesRaw = parsed.properties
  const leasesRaw = parsed.leases

  if (propertiesRaw !== undefined && !Array.isArray(propertiesRaw)) {
    errors.push({ index: -1, field: 'properties', message: '"properties" must be an array' })
  }
  if (leasesRaw !== undefined && !Array.isArray(leasesRaw)) {
    errors.push({ index: -1, field: 'leases', message: '"leases" must be an array' })
  }
  if (errors.length > 0) {
    return { ok: false, propertiesImported: 0, leasesImported: 0, errors }
  }

  const properties = (propertiesRaw as PropertyInput[]) ?? []
  const leases = (leasesRaw as LeaseInput[]) ?? []

  const propertyRows = properties.map((input, index) => {
    const id = asString(input.id)
    const name = asString(input.name)
    if (!id) errors.push({ index, field: 'id', message: 'property "id" is required' })
    if (!name) errors.push({ index, field: 'name', message: 'property "name" is required' })
    return {
      id: id ?? '',
      name: name ?? '',
      address: asString(input.address),
      submarket: asString(input.submarket),
      property_class: asString(input.propertyClass),
      rsf: asInteger(input.rsf),
      floors: asInteger(input.floors),
      year_built: asInteger(input.yearBuilt)
    }
  })

  const leaseRows = leases.map((input, index) => {
    const propertyId = asString(input.propertyId)
    const tenant = asString(input.tenant)
    if (!propertyId) {
      errors.push({ index, field: 'propertyId', message: 'lease "propertyId" is required' })
    }
    if (!tenant) {
      errors.push({ index, field: 'tenant', message: 'lease "tenant" is required' })
    }
    return {
      property_id: propertyId ?? '',
      tenant: tenant ?? '',
      suite: asString(input.suite),
      floor: asInteger(input.floor),
      rsf: asInteger(input.rsf),
      lease_type: asString(input.leaseType),
      start_date: asString(input.startDate),
      expiration_date: asString(input.expirationDate),
      rent_dollars_sf: asNumber(input.rent_dollarsSF),
      status: asString(input.status)
    }
  })

  if (errors.length > 0) {
    return { ok: false, propertiesImported: 0, leasesImported: 0, errors }
  }

  const validPropertyIds = new Set<string>(propertyRows.map((row) => row.id))
  for (const existing of db.prepare('SELECT id FROM property').all()) {
    validPropertyIds.add((existing as { id: string }).id)
  }

  for (let i = 0; i < leaseRows.length; i++) {
    if (!validPropertyIds.has(leaseRows[i].property_id)) {
      errors.push({
        index: i,
        field: 'propertyId',
        message: `references unknown property "${leaseRows[i].property_id}"`
      })
    }
  }

  if (errors.length > 0) {
    return { ok: false, propertiesImported: 0, leasesImported: 0, errors }
  }

  const importedAt = new Date().toISOString()
  const upsertProperty = db.prepare(`
    INSERT INTO property
      (id, name, address, submarket, property_class, rsf, floors, year_built, imported_at)
    VALUES
      (@id, @name, @address, @submarket, @property_class, @rsf, @floors, @year_built, @imported_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      address = excluded.address,
      submarket = excluded.submarket,
      property_class = excluded.property_class,
      rsf = excluded.rsf,
      floors = excluded.floors,
      year_built = excluded.year_built,
      imported_at = excluded.imported_at
  `)
  const insertLease = db.prepare(`
    INSERT INTO lease
      (property_id, tenant, suite, floor, rsf, lease_type, start_date,
       expiration_date, rent_dollars_sf, status, imported_at)
    VALUES
      (@property_id, @tenant, @suite, @floor, @rsf, @lease_type, @start_date,
       @expiration_date, @rent_dollars_sf, @status, @imported_at)
  `)

  db.transaction(() => {
    for (const row of propertyRows) {
      upsertProperty.run({ ...row, imported_at: importedAt })
    }
    if (leaseRows.length > 0) {
      db.prepare('DELETE FROM lease').run()
      for (const row of leaseRows) {
        insertLease.run({ ...row, imported_at: importedAt })
      }
    }
  })()

  return {
    ok: true,
    propertiesImported: propertyRows.length,
    leasesImported: leaseRows.length,
    errors: []
  }
}
