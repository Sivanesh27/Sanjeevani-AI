/* ---------- Fuzzy matching (Levenshtein-based) for noisy OCR / typed input ---------- */
function levenshtein(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return 1 - dist / maxLen;
}

/**
 * Search the drug catalog for the best fuzzy matches to a noisy query
 * (typed name, OCR text, or misspelling). Matches generic name, brand
 * names, and localized names.
 */
function fuzzySearchDrugs(query, catalog, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const drug of catalog) {
    const candidates = [drug.generic, ...(drug.brands || []), drug.hi, drug.ta];
    let best = 0;
    for (const c of candidates) {
      if (!c) continue;
      const cLower = c.toLowerCase();
      // exact substring match gets a strong boost
      if (cLower.includes(q) || q.includes(cLower)) {
        best = Math.max(best, 0.92);
      }
      best = Math.max(best, similarity(q, cLower));
    }
    if (best > 0.45) scored.push({ drug, score: best });
  }
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map(s => s.drug);
}

/* ---------- Interaction rule engine ---------- */
function checkInteractions(selectedIds, interactionRules) {
  const found = [];
  for (const rule of interactionRules) {
    const [a, b] = rule.pair;
    if (selectedIds.includes(a) && selectedIds.includes(b)) {
      found.push(rule);
    }
  }
  // Severe first, then moderate, then mild
  const order = { severe: 0, moderate: 1, mild: 2 };
  found.sort((x, y) => order[x.severity] - order[y.severity]);
  return found;
}

function overallRisk(flagged) {
  if (flagged.some(f => f.severity === "severe")) return "severe";
  if (flagged.some(f => f.severity === "moderate")) return "moderate";
  if (flagged.length) return "mild";
  return "none";
}
