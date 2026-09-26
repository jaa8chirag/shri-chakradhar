/**
 * IGNOU course codes: 2-6 letters, optional space/hyphen, 1-3 digits (e.g. "MMPC 001", "BEGC-134", "bevae 181").
 * Normalized form is LETTERS-DIGITS, uppercased, with IGNOU's conventional zero-padding preserved as found
 * (we don't invent padding since IGNOU codes like "MEG 1" and "MMPC 001" are both real and distinct).
 */
const CODE_RE = /\b([A-Za-z]{2,6})[\s-]?(\d{1,3})\b/g;

const STOPWORDS = new Set(["PDF", "IN", "OF", "TO", "AND", "OR", "THE", "FOR"]);

export function extractCourseCodes(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const matches = text.matchAll(CODE_RE);
  for (const m of matches) {
    const letters = m[1].toUpperCase();
    const digits = m[2];
    if (STOPWORDS.has(letters)) continue;
    if (letters.length < 2 || letters.length > 6) continue;
    found.add(`${letters}-${digits}`);
  }
  return Array.from(found);
}

const PROGRAMME_RE = /\b(MBA|MCOM|MCA|MSW|MAPC|MEG|MAH|MPS|MSO|MEC|MAPY|MARD|BAG|BAECH|BAEGH|BAHDH|BAPSH|BAPCH|BSCG|BCOMG|BCA|BSW|BLIS|MLIS|PGDIBO|PGDCA|CTE|CIC|DNHE|ADCFN)\b/i;

export function extractProgramme(text: string): string | null {
  if (!text) return null;
  const m = text.match(PROGRAMME_RE);
  return m ? m[1].toUpperCase() : null;
}

export function extractLevel(text: string): "Masters" | "Bachelors" | "Diploma" | "Certificate" | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/\bmaster|\bmba\b|\bmca\b|\bmcom\b|\bpost[\s-]?graduate\b|\bpg\b/.test(t)) return "Masters";
  if (/\bbachelor|\bbag\b|\bbcom\b|\bbca\b|\bundergraduate\b|\bug\b/.test(t)) return "Bachelors";
  if (/\bdiploma\b/.test(t)) return "Diploma";
  if (/\bcertificate\b/.test(t)) return "Certificate";
  return null;
}

export function extractLanguage(text: string): "English" | "Hindi" | "Both" | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const hasHindi = /hindi/.test(t) || /[ऀ-ॿ]/.test(text);
  const hasEnglish = /english/.test(t);
  if (hasHindi && hasEnglish) return "Both";
  if (hasHindi) return "Hindi";
  if (hasEnglish) return "English";
  return null;
}

export function extractFormat(text: string): "SoftCopy" | "HardCopy" | "Both" {
  if (!text) return "SoftCopy";
  const t = text.toLowerCase();
  const hasSoft = /\bpdf\b|soft\s?copy|e-?book|digital|download/.test(t);
  const hasHard = /hard\s?copy|printed|book\s?form|physical/.test(t);
  if (hasSoft && hasHard) return "Both";
  if (hasHard) return "HardCopy";
  return "SoftCopy";
}

type ProductTypeValue = "HelpBook" | "SolvedAssignment" | "GuessPaper" | "QuestionPaper" | "Project" | "Combo" | "Other";

function matchType(t: string): ProductTypeValue | null {
  if (/combo|bundle|set of/.test(t)) return "Combo";
  if (/solved assignment/.test(t)) return "SolvedAssignment";
  if (/guess paper/.test(t)) return "GuessPaper";
  if (/question paper|previous year/.test(t)) return "QuestionPaper";
  if (/project|synopsis/.test(t)) return "Project";
  if (/help ?book|study material|guide ?book|\bbook\b|\bguide\b/.test(t)) return "HelpBook";
  return null;
}

/**
 * `categories` (curated WooCommerce category names, e.g. "IGNOU Solved Guess Papers") is checked
 * first since it's a much cleaner signal than free-text descriptions — many product short
 * descriptions carry generic cross-sell copy ("also check our guess papers...") that would
 * otherwise misclassify unrelated products if description text were weighted equally.
 */
export function extractType(fullText: string, categories?: string): ProductTypeValue {
  if (categories) {
    const fromCategory = matchType(categories.toLowerCase());
    if (fromCategory) return fromCategory;
  }
  if (!fullText) return "Other";
  return matchType(fullText.toLowerCase()) ?? "Other";
}

export function extractSession(text: string): string | null {
  if (!text) return null;
  const m = text.match(/\b(20\d{2})[\s-]?(20\d{2}|\d{2})\b/);
  if (!m) return null;
  const end = m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2];
  return `${m[1]}-${m[2].length === 2 ? m[2] : end.slice(-2)}`;
}
