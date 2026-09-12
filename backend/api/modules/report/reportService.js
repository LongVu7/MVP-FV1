const reportRepository = require('./reportRepository');
const { getIctDateBoundaries, BUSINESS_TZ } = require('./reportDateUtils');
const { buildReportScope } = require('../../../authorization/scope/reportScope');
const { REGION_LABELS } = require('./reportConstants');

function calcRate(num, den) {
  if (!den || den === 0) return 0;
  return Number(((num / den) * 100).toFixed(2));
}

function getMonthsArray(from, to) {
  const months = [];
  let current = new Date(from);
  current.setUTCDate(1); 
  const end = new Date(to);
  const endCompare = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  
  while (current <= endCompare) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
    current.setUTCMonth(current.getUTCMonth() + 1);
  }
  return months;
}

async function getDashboard(query, user) {
  const { from, to, sourceIds, sourceDetailIds, majorInterestTypes, regionGroups, oldProvinceIds } = query;
  const { fromInstant, toExclusiveInstant } = getIctDateBoundaries(from, to);
  
  const scope = await buildReportScope(user);
  const dateRange = { fromInstant, toExclusiveInstant };
  const filters = { sourceIds, sourceDetailIds, majorInterestTypes, regionGroups, oldProvinceIds };

  const [
    summaryRaw,
    timelineRaw,
    staffCountsRaw,
    majorCountsRaw,
    sourceCountsRaw,
    regionCountsRaw
  ] = await Promise.all([
    reportRepository.getSummaryCounts(scope, dateRange, filters),
    reportRepository.getTimelineCounts(scope, dateRange, filters),
    reportRepository.getStaffCounts(scope, dateRange, filters),
    reportRepository.getMajorCounts(scope, dateRange, filters),
    reportRepository.getSourceCounts(scope, dateRange, filters),
    reportRepository.getRegionCounts(scope, dateRange, filters),
  ]);

  const summary = {
    total: summaryRaw.total,
    processed: summaryRaw.processed,
    interacted: summaryRaw.interacted,
    interactionRate: calcRate(summaryRaw.interacted, summaryRaw.processed),
    nb: summaryRaw.nb,
    nbRate: calcRate(summaryRaw.nb, summaryRaw.interacted)
  };

  const statusByAdvisor = staffCountsRaw.map(s => ({
    advisorId: s.advisorId,
    advisorName: s.advisorName,
    paymentCompletedNb: s.paymentCompletedNb,
    applicationSubmitted: s.applicationSubmitted,
    considering: s.considering,
    interested: s.interested,
    scheduledCallback: s.scheduledCallback,
    noAnswer: s.noAnswer,
    unreachable: s.unreachable,
    notInterested: s.notInterested,
    wrongNumber: s.wrongNumber
  }));

  const ratesByAdvisor = staffCountsRaw.map(s => ({
    advisorId: s.advisorId,
    advisorName: s.advisorName,
    processed: s.processed,
    interacted: s.interacted,
    nb: s.nb,
    interactionRate: calcRate(s.interacted, s.processed),
    nbRate: calcRate(s.nb, s.interacted),
    wrongNumberRate: calcRate(s.wrongNumber, s.processed),
    notInterestedRate: calcRate(s.notInterested, s.processed)
  }));

  const byMajor = majorCountsRaw.map(m => ({
    majorKey: m.majorKey,
    majorLabel: m.majorLabel || m.majorKey,
    total: m.total,
    processed: m.processed,
    interacted: m.interacted,
    interactionRate: calcRate(m.interacted, m.processed),
    nb: m.nb,
    nbRate: calcRate(m.nb, m.interacted)
  }));

  const byRegion = regionCountsRaw.map(r => ({
    regionGroup: r.regionGroup,
    regionLabel: REGION_LABELS[r.regionGroup] || r.regionGroup,
    total: r.total,
    processed: r.processed,
    interacted: r.interacted,
    interactionRate: calcRate(r.interacted, r.processed),
    nb: r.nb,
    nbRate: calcRate(r.nb, r.interacted)
  }));

  const sourceMap = new Map();
  sourceCountsRaw.forEach(row => {
    if (!sourceMap.has(row.sourceId)) {
      sourceMap.set(row.sourceId, {
        sourceKey: row.sourceKey,
        sourceLabel: row.sourceLabel || row.sourceKey, 
        total: 0, processed: 0, interacted: 0, nb: 0,
        details: []
      });
    }
    const src = sourceMap.get(row.sourceId);
    src.total += row.total;
    src.processed += row.processed;
    src.interacted += row.interacted;
    src.nb += row.nb;

    if (row.sourceDetailId) {
      src.details.push({
        sourceDetailKey: row.sourceDetailKey,
        sourceDetailLabel: row.sourceDetailLabel || row.sourceDetailKey,
        total: row.total,
        processed: row.processed,
        interacted: row.interacted,
        interactionRate: calcRate(row.interacted, row.processed),
        nb: row.nb,
        nbRate: calcRate(row.nb, row.interacted)
      });
    }
  });

  const bySource = Array.from(sourceMap.values()).map(s => {
    s.interactionRate = calcRate(s.interacted, s.processed);
    s.nbRate = calcRate(s.nb, s.interacted);
    return s;
  });

  const allMonths = getMonthsArray(from, to);
  
  const mapTimeline = (rawArr) => {
    const m = new Map();
    rawArr.forEach(item => m.set(item.month_val, item.count_val));
    return m;
  };

  const pMap = mapTimeline(timelineRaw.processedTimeline);
  const iMap = mapTimeline(timelineRaw.interactedTimeline);
  const nMap = mapTimeline(timelineRaw.nbTimeline);

  const timeline = allMonths.map(month => ({
    month,
    processed: pMap.get(month) || 0,
    interacted: iMap.get(month) || 0,
    nb: nMap.get(month) || 0
  }));

  return {
    summary,
    statusByAdvisor,
    ratesByAdvisor,
    byMajor,
    bySource,
    byRegion,
    timeline,
    meta: {
      from,
      to,
      timezone: BUSINESS_TZ
    }
  };
}

module.exports = {
  getDashboard
};
