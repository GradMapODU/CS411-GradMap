// evaluateRequirements.js

function statusRank(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("completed")) return 3;
  if (s.includes("enrolled") || s.includes("progress")) return 2;
  if (s.includes("planned")) return 1;
  return 0;
}

function bucketForRank(rank) {
  if (rank >= 3) return "completed";
  if (rank >= 1) return "planned";
  return "notCompleted";
}

function normalizeCodeKey(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim().toUpperCase();
}

function lookupStatus(code, statusMap) {
  const raw = String(code || "");
  if (!raw) return null;

  const tokens = raw.split("/").map((s) => s.trim()).filter(Boolean);
  const variants = [];
  let lastPrefix = "";
  for (const t of tokens) {
    const pm = t.match(/^([A-Za-z]+)\s*/);
    if (pm) {
      lastPrefix = pm[1].toUpperCase();
      variants.push(normalizeCodeKey(t));
    } else if (lastPrefix) {
      variants.push(normalizeCodeKey(`${lastPrefix} ${t}`));
    } else {
      variants.push(normalizeCodeKey(t));
    }
  }

  let best = null;
  for (const v of variants) {
    const m = statusMap.get(v);
    if (!m) continue;
    if (!best || statusRank(m.status) > statusRank(best.status)) best = m;
  }
  return best;
}

function evalSingle(req, statusMap) {
  const match = lookupStatus(req.code, statusMap);
  const rank = match ? statusRank(match.status) : 0;
  return {
    label: req.code + (req.name ? ` - ${req.name}` : ""),
    kind: "single",
    bucket: bucketForRank(rank),
    satisfyingCourses: match ? [{ code: match.code, status: match.status }] : [],
  };
}

function evalChooseOne(req, statusMap) {
  let bestMatch = null;
  let bestRank = 0;
  for (const opt of req.options || []) {
    const m = lookupStatus(opt.code, statusMap);
    if (!m) continue;
    const r = statusRank(m.status);
    if (r > bestRank) {
      bestRank = r;
      bestMatch = m;
    }
  }
  return {
    label: req.name,
    kind: "chooseOne",
    bucket: bucketForRank(bestRank),
    satisfyingCourses: bestMatch ? [{ code: bestMatch.code, status: bestMatch.status }] : [],
    options: req.options || [],
  };
}

function evalChooseOneGroup(req, statusMap) {
  const annotated = (req.groups || []).map((g, idx) => {
    const codeStatuses = (g.codes || []).map((code) => {
      const m = lookupStatus(code, statusMap);
      return {
        code,
        status: m ? m.status : null,
        rank: m ? statusRank(m.status) : 0,
      };
    });
    const completedCount = codeStatuses.filter((c) => c.rank >= 3).length;
    const plannedCount = codeStatuses.filter((c) => c.rank >= 1 && c.rank < 3).length;
    const totalCount = codeStatuses.length;
    let groupBucket;
    if (totalCount > 0 && completedCount === totalCount) groupBucket = "completed";
    else if (totalCount > 0 && codeStatuses.every((c) => c.rank >= 1)) groupBucket = "planned";
    else groupBucket = "notCompleted";
    return {
      ...g,
      index: idx,
      codeStatuses,
      completedCount,
      plannedCount,
      totalCount,
      groupBucket,
    };
  });

  if (annotated.length === 0) {
    return {
      label: req.name,
      kind: "chooseOneGroup",
      bucket: "notCompleted",
      satisfyingCourses: [],
      groups: [],
    };
  }

  annotated.sort((a, b) => {
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    if (b.plannedCount !== a.plannedCount) return b.plannedCount - a.plannedCount;
    if (a.totalCount !== b.totalCount) return a.totalCount - b.totalCount;
    return a.index - b.index;
  });

  const best = annotated[0];
  const bucket = best.groupBucket;
  const satisfyingCourses = best.codeStatuses
    .filter((c) => c.rank > 0)
    .map((c) => ({ code: c.code, status: c.status }));

  return {
    label: req.name,
    kind: "chooseOneGroup",
    bucket,
    satisfyingCourses,
    groups: annotated,
    bestGroupIndex: best.index,
  };
}

function evalChooseN(req, statusMap) {
  const target = Number(req.count) || 0;
  const matches = [];
  for (const opt of req.options || []) {
    const m = lookupStatus(opt.code, statusMap);
    if (!m) continue;
    matches.push({ code: m.code, status: m.status, rank: statusRank(m.status) });
  }

  matches.sort((a, b) => {
    if (b.rank !== a.rank) return b.rank - a.rank;
    return a.code.localeCompare(b.code);
  });

  const completedCount = matches.filter((m) => m.rank >= 3).length;
  const plannedCount = matches.filter((m) => m.rank >= 1 && m.rank < 3).length;

  let bucket;
  if (completedCount >= target) bucket = "completed";
  else if (completedCount + plannedCount >= target) bucket = "planned";
  else bucket = "notCompleted";

  const satisfyingCourses = matches.slice(0, Math.max(target, matches.length)).map(
    (m) => ({ code: m.code, status: m.status })
  );

  return {
    label: req.name,
    kind: "chooseN",
    bucket,
    satisfyingCourses,
    progress: { completedCount, plannedCount, target },
    options: req.options || [],
  };
}

function evalCrossSatisfied(req, statusMap) {
  const ranks = (req.satisfiedBy || []).map((code) => {
    const m = lookupStatus(code, statusMap);
    return { code, match: m, rank: m ? statusRank(m.status) : 0 };
  });
  const all = ranks.length > 0;
  const allCompleted = all && ranks.every((r) => r.rank >= 3);
  const allAtLeastPlanned = all && ranks.every((r) => r.rank >= 1);
  let bucket;
  if (allCompleted) bucket = "completed";
  else if (allAtLeastPlanned) bucket = "planned";
  else bucket = "notCompleted";
  const satisfyingCourses = ranks
    .filter((r) => r.match)
    .map((r) => ({ code: r.match.code, status: r.match.status }));
  return {
    label: req.name,
    kind: "crossSatisfied",
    bucket,
    satisfyingCourses,
    note: req.note || "",
    satisfiedBy: req.satisfiedBy || [],
  };
}

export function evaluateRequirement(req, statusMap) {
  switch (req.kind) {
    case "single":           return evalSingle(req, statusMap);
    case "chooseOne":        return evalChooseOne(req, statusMap);
    case "chooseOneGroup":   return evalChooseOneGroup(req, statusMap);
    case "chooseN":          return evalChooseN(req, statusMap);
    case "crossSatisfied":   return evalCrossSatisfied(req, statusMap);
    default:
      return {
        label: req?.name || "(unknown requirement)",
        kind: req?.kind || "unknown",
        bucket: "notCompleted",
        satisfyingCourses: [],
      };
  }
}

export function evaluateProgram(program, statusMap) {
  if (!program || !Array.isArray(program.sections)) {
    return { sections: [] };
  }
  const sections = program.sections.map((section) => ({
    key: section.key,
    title: section.title,
    entries: (section.requirements || []).map((r) => evaluateRequirement(r, statusMap)),
  }));
  return { sections };
}