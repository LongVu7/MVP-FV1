const { Prisma } = require('@prisma/client');
const prisma = require('../../../config/db');
const { getIctDateBoundaries } = require('./reportDateUtils');
const { buildReportScope } = require('../../../authorization/scope/reportScope');

async function getDashboardReport(user, params) {
  const { fromDate, toDate, sourceIds, sourceDetailIds, majorIds, regionIds } = params;
  const { fromInclusiveIct, toExclusiveIct } = getIctDateBoundaries(fromDate, toDate);
  const scopeSql = await buildReportScope(user);

  let sourceFilter = Prisma.empty;
  if (sourceIds && sourceIds.length > 0) {
    sourceFilter = Prisma.sql`AND resolved_source_id IN (${Prisma.join(sourceIds)})`;
  }
  let sourceDetailFilter = Prisma.empty;
  if (sourceDetailIds && sourceDetailIds.length > 0) {
    sourceDetailFilter = Prisma.sql`AND resolved_source_detail_id IN (${Prisma.join(sourceDetailIds)})`;
  }
  let majorFilter = Prisma.empty;
  if (majorIds && majorIds.length > 0) {
    majorFilter = Prisma.sql`AND COALESCE(sr.interested_major_id, sr.specific_major_id) IN (${Prisma.join(majorIds)})`;
  }
  let regionFilter = Prisma.empty;
  if (regionIds && regionIds.length > 0) {
    regionFilter = Prisma.sql`AND se.new_province_id IN (${Prisma.join(regionIds)})`;
  }

  const baseCte = Prisma.sql`
    WITH RECURSIVE
    StatusHierarchy AS (
      SELECT id, name, level, parent_id, id AS base_id
      FROM status_data
      UNION ALL
      SELECT s.id, s.name, s.level, s.parent_id, h.base_id
      FROM status_data s
      INNER JOIN StatusHierarchy h ON h.parent_id = s.id
    ),
    SourceHierarchy AS (
      SELECT id, name, level, parent_id, id AS base_id
      FROM source_data
      UNION ALL
      SELECT s.id, s.name, s.level, s.parent_id, h.base_id
      FROM source_data s
      INNER JOIN SourceHierarchy h ON h.parent_id = s.id
    ),
    InquiryBase AS (
      SELECT 
        i.id,
        i.created_at,
        i.first_processed_at,
        i.first_interacted_at,
        i.nb_at,
        i.status_data_id,
        i.source_data_id,
        COALESCE(sr.interested_major_id, sr.specific_major_id) AS resolved_major_id,
        se.new_province_id AS resolved_region_id,
        (SELECT id FROM SourceHierarchy WHERE base_id = i.source_data_id AND level = 'source' LIMIT 1) AS resolved_source_id,
        (SELECT id FROM SourceHierarchy WHERE base_id = i.source_data_id AND level = 'source_detail' LIMIT 1) AS resolved_source_detail_id
      FROM inquiry i
      LEFT JOIN student st ON i.student_id = st.id
      LEFT JOIN specialized_register sr ON st.specialized_register_id = sr.id
      LEFT JOIN student_education se ON st.id = se.student_id
      WHERE 1=1
        ${scopeSql}
    ),
    FilteredInquiry AS (
      SELECT *
      FROM InquiryBase
      WHERE 1=1
        ${sourceFilter}
        ${sourceDetailFilter}
        ${majorFilter}
        ${regionFilter}
    )
  `;

  const getGeneralQuery = () => Prisma.sql`
    ${baseCte}
    SELECT
      COUNT(*) FILTER (
        WHERE created_at >= ${fromInclusiveIct}::timestamptz 
          AND created_at < ${toExclusiveIct}::timestamptz
      )::int AS total,
      
      COUNT(*) FILTER (
        WHERE first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND first_processed_at < ${toExclusiveIct}::timestamptz
      )::int AS processed,
      
      COUNT(*) FILTER (
        WHERE first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND first_processed_at < ${toExclusiveIct}::timestamptz
          AND first_interacted_at IS NOT NULL
          AND first_interacted_at < ${toExclusiveIct}::timestamptz
      )::int AS interacted,
      
      COUNT(*) FILTER (
        WHERE first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND first_processed_at < ${toExclusiveIct}::timestamptz
          AND nb_at IS NOT NULL
          AND nb_at < ${toExclusiveIct}::timestamptz
      )::int AS nb
    FROM FilteredInquiry;
  `;

  const getMajorQuery = () => Prisma.sql`
    ${baseCte}
    SELECT
      m.id AS "majorId",
      m.name AS "majorName",
      COUNT(fi.id) FILTER (
        WHERE fi.created_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.created_at < ${toExclusiveIct}::timestamptz
      )::int AS total,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
      )::int AS processed,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
          AND fi.first_interacted_at IS NOT NULL
          AND fi.first_interacted_at < ${toExclusiveIct}::timestamptz
      )::int AS interacted,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
          AND fi.nb_at IS NOT NULL
          AND fi.nb_at < ${toExclusiveIct}::timestamptz
      )::int AS nb
    FROM major_data m
    LEFT JOIN FilteredInquiry fi ON fi.resolved_major_id = m.id
    WHERE m.level = 'interested_major' AND m.is_active = true
    GROUP BY m.id, m.name, m.sort_order
    ORDER BY m.sort_order ASC;
  `;

  const getRegionQuery = () => Prisma.sql`
    ${baseCte}
    SELECT
      p.id AS "regionId",
      p.name AS "regionName",
      COUNT(fi.id) FILTER (
        WHERE fi.created_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.created_at < ${toExclusiveIct}::timestamptz
      )::int AS total,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
      )::int AS processed,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
          AND fi.first_interacted_at IS NOT NULL
          AND fi.first_interacted_at < ${toExclusiveIct}::timestamptz
      )::int AS interacted,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
          AND fi.nb_at IS NOT NULL
          AND fi.nb_at < ${toExclusiveIct}::timestamptz
      )::int AS nb
    FROM new_province p
    LEFT JOIN FilteredInquiry fi ON fi.resolved_region_id = p.id
    GROUP BY p.id, p.name
    ORDER BY p.name ASC;
  `;

  const getSourceQuery = () => Prisma.sql`
    ${baseCte}
    SELECT
      s.id AS "sourceDetailId",
      s.name AS "sourceDetailName",
      p.id AS "sourceId",
      p.name AS "sourceName",
      COUNT(fi.id) FILTER (
        WHERE fi.created_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.created_at < ${toExclusiveIct}::timestamptz
      )::int AS total,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
      )::int AS processed,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
          AND fi.first_interacted_at IS NOT NULL
          AND fi.first_interacted_at < ${toExclusiveIct}::timestamptz
      )::int AS interacted,
      
      COUNT(fi.id) FILTER (
        WHERE fi.first_processed_at >= ${fromInclusiveIct}::timestamptz 
          AND fi.first_processed_at < ${toExclusiveIct}::timestamptz
          AND fi.nb_at IS NOT NULL
          AND fi.nb_at < ${toExclusiveIct}::timestamptz
      )::int AS nb
    FROM source_data s
    LEFT JOIN source_data p ON s.parent_id = p.id
    LEFT JOIN FilteredInquiry fi ON fi.resolved_source_detail_id = s.id
    WHERE s.level = 'source_detail' AND s.is_active = true
    GROUP BY s.id, s.name, s.sort_order, p.id, p.name, p.sort_order
    ORDER BY p.sort_order ASC, s.sort_order ASC;
  `;

  const [generalRes, majorRes, regionRes, sourceRes] = await prisma.$transaction([
    prisma.$queryRaw(getGeneralQuery()),
    prisma.$queryRaw(getMajorQuery()),
    prisma.$queryRaw(getRegionQuery()),
    prisma.$queryRaw(getSourceQuery()),
  ]);

  return {
    general: generalRes[0] || { total: 0, processed: 0, interacted: 0, nb: 0 },
    byMajor: majorRes,
    byRegion: regionRes,
    bySource: sourceRes,
  };
}

module.exports = {
  getDashboardReport
};
