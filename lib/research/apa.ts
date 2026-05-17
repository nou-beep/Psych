// APA 7 reference formatting.
//
// Realistic, deterministic algorithm: in/out is pure string manipulation
// of values the user has supplied. We never invent metadata — if a piece
// of information is missing, the rendered citation omits it or marks the
// gap with a "(n.d.)"-style placeholder per APA convention.

export type ArticleType =
  | "journal-article"
  | "book"
  | "book-chapter"
  | "edited-book"
  | "thesis"
  | "report"
  | "conference-paper"
  | "webpage";

export interface AuthorName {
  family: string;
  given: string; // can be "Mary L." or "Mary Louise"
}

export interface ApaCitationInput {
  type: ArticleType;
  authors: AuthorName[];
  year?: number | string;
  title: string;
  // Journal name (for journal articles).
  journal?: string;
  volume?: string | number;
  issue?: string | number;
  pages?: string;
  doi?: string;
  url?: string;
  // Book / chapter fields.
  publisher?: string;
  editors?: AuthorName[];
  bookTitle?: string;
  edition?: string;
  // Thesis fields.
  thesisInstitution?: string;
  // Report fields.
  reportNumber?: string;
  // Webpage / conference.
  retrievedDate?: string; // optional retrieval date for webpages
  conferenceName?: string;
  conferenceLocation?: string;
}

// ─── Author formatting ────────────────────────────────────────

export function formatAuthor(a: AuthorName): string {
  const family = a.family.trim();
  if (!family) return "";
  const given = a.given.trim();
  if (!given) return family;
  // Convert each given name token to initial + period.
  const initials = given
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      // Already an initial like "M." or "M.L." — keep as-is, ensuring
      // each capital is followed by a period and tokens are joined with
      // a space (APA style).
      const compact = token.replace(/\./g, "");
      if (compact.length <= 2) {
        return compact
          .split("")
          .map((c) => `${c.toUpperCase()}.`)
          .join("");
      }
      // Full first name → reduce to first letter + period.
      return `${compact[0]!.toUpperCase()}.`;
    })
    .join(" ");
  return `${family}, ${initials}`;
}

// APA 7: list up to 20 authors. With 21+, list first 19, an ellipsis,
// then the final author.
export function formatAuthorList(authors: AuthorName[]): string {
  const valid = authors.filter((a) => a.family.trim());
  if (valid.length === 0) return "";
  if (valid.length === 1) return formatAuthor(valid[0]);
  if (valid.length === 2)
    return `${formatAuthor(valid[0])}, & ${formatAuthor(valid[1])}`;
  if (valid.length <= 20) {
    const head = valid.slice(0, -1).map(formatAuthor).join(", ");
    const tail = formatAuthor(valid[valid.length - 1]);
    return `${head}, & ${tail}`;
  }
  const head = valid.slice(0, 19).map(formatAuthor).join(", ");
  const tail = formatAuthor(valid[valid.length - 1]);
  return `${head}, … ${tail}`;
}

// ─── In-text citations ────────────────────────────────────────

export function inTextParenthetical(
  authors: AuthorName[],
  year?: number | string
): string {
  const yr = year ? String(year) : "n.d.";
  const valid = authors.filter((a) => a.family.trim());
  if (valid.length === 0) return `(Anon., ${yr})`;
  if (valid.length === 1) return `(${valid[0].family}, ${yr})`;
  if (valid.length === 2)
    return `(${valid[0].family} & ${valid[1].family}, ${yr})`;
  return `(${valid[0].family} et al., ${yr})`;
}

export function inTextNarrative(
  authors: AuthorName[],
  year?: number | string
): string {
  const yr = year ? String(year) : "n.d.";
  const valid = authors.filter((a) => a.family.trim());
  if (valid.length === 0) return `Anon. (${yr})`;
  if (valid.length === 1) return `${valid[0].family} (${yr})`;
  if (valid.length === 2)
    return `${valid[0].family} and ${valid[1].family} (${yr})`;
  return `${valid[0].family} et al. (${yr})`;
}

// ─── Bibliography entry ───────────────────────────────────────

function yearPart(y: number | string | undefined): string {
  return y ? `(${y}).` : "(n.d.).";
}

function trimDot(s: string): string {
  return s.replace(/\.+\s*$/, "").trim();
}

function joinWithDot(parts: string[]): string {
  return parts.map((p) => trimDot(p)).filter(Boolean).join(". ") + ".";
}

function locator(
  volume?: string | number,
  issue?: string | number,
  pages?: string
): string {
  const v = volume ? String(volume).trim() : "";
  const i = issue ? String(issue).trim() : "";
  const p = pages ? String(pages).trim() : "";
  let head = "";
  if (v && i) head = `${v}(${i})`;
  else if (v) head = v;
  if (head && p) return `${head}, ${p}`;
  if (head) return head;
  return p;
}

function doiOrUrl(input: ApaCitationInput): string {
  if (input.doi && input.doi.trim()) {
    const d = input.doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
    return `https://doi.org/${d}`;
  }
  if (input.url && input.url.trim()) return input.url.trim();
  return "";
}

export function formatBibliography(input: ApaCitationInput): string {
  const authors = formatAuthorList(input.authors) || "Anon.";
  const year = yearPart(input.year);
  const title = input.title.trim();
  const tail = doiOrUrl(input);

  switch (input.type) {
    case "journal-article": {
      const loc = locator(input.volume, input.issue, input.pages);
      const journal = input.journal ? italic(input.journal.trim()) : "";
      const journalLoc = [journal, loc].filter(Boolean).join(", ");
      const body = joinWithDot([
        `${authors}`,
        year.replace(/\.$/, ""),
        title,
        journalLoc,
      ]);
      return tail ? `${body} ${tail}` : body;
    }
    case "book": {
      const editionPart = input.edition ? ` (${input.edition})` : "";
      const titleBook = italic(`${title}${editionPart}`);
      const pub = input.publisher ?? "";
      const body = joinWithDot([
        authors,
        year.replace(/\.$/, ""),
        titleBook,
        pub,
      ]);
      return tail ? `${body} ${tail}` : body;
    }
    case "edited-book": {
      const a =
        authors.length > 0 && input.authors.length > 0
          ? `${authors} (Eds.).`
          : "";
      const titleBook = italic(title);
      const body = [
        trimDot(a),
        year,
        trimDot(titleBook) + ".",
        trimDot(input.publisher ?? "") + ".",
      ]
        .filter(Boolean)
        .join(" ");
      return tail ? `${body} ${tail}` : body;
    }
    case "book-chapter": {
      const editorsList = input.editors
        ? formatAuthorList(input.editors)
        : "";
      const editorsPart = editorsList ? `In ${editorsList} (Eds.), ` : "";
      const bookT = input.bookTitle ? italic(input.bookTitle.trim()) : "";
      const pages = input.pages ? ` (pp. ${input.pages.trim()})` : "";
      const pub = input.publisher ? `. ${input.publisher.trim()}` : "";
      const body = `${authors} ${year} ${trimDot(
        title
      )}. ${editorsPart}${bookT}${pages}${pub}.`;
      return tail ? `${body} ${tail}` : body;
    }
    case "thesis": {
      const inst = input.thesisInstitution
        ? ` ${input.thesisInstitution.trim()}`
        : "";
      const body = `${authors} ${year} ${italic(title)} [Doctoral dissertation,${inst}].`;
      return tail ? `${body} ${tail}` : body;
    }
    case "report": {
      const num = input.reportNumber ? ` (No. ${input.reportNumber})` : "";
      const pub = input.publisher ? ` ${input.publisher}.` : "";
      const body = `${authors} ${year} ${italic(title)}${num}.${pub}`;
      return tail ? `${body} ${tail}` : body;
    }
    case "conference-paper": {
      const confName = input.conferenceName ?? "";
      const confLoc = input.conferenceLocation ?? "";
      const conf = [confName, confLoc].filter(Boolean).join(", ");
      const body = `${authors} ${year} ${title} [Conference paper]. ${conf}.`;
      return tail ? `${body} ${tail}` : body;
    }
    case "webpage": {
      const site = input.publisher ?? "";
      const retrieved = input.retrievedDate
        ? ` Retrieved ${input.retrievedDate}, from `
        : " ";
      const body = `${authors} ${year} ${italic(title)}.${site ? ` ${site}.` : ""}${retrieved}`;
      return tail ? `${body}${tail}` : body.trim();
    }
  }
}

function italic(s: string): string {
  // We emit Unicode-italic markers as a lightweight HTML-ready hint
  // the UI can swap for <em>. Keeping the marker explicit keeps the
  // function pure and testable.
  return `*${s.trim()}*`;
}

// ─── Validation ───────────────────────────────────────────────

export interface ApaIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export function validateApaInput(input: ApaCitationInput): ApaIssue[] {
  const issues: ApaIssue[] = [];
  if (!input.title || !input.title.trim()) {
    issues.push({
      field: "title",
      message: "Title is required.",
      severity: "error",
    });
  }
  const valid = input.authors.filter((a) => a.family.trim());
  if (valid.length === 0) {
    issues.push({
      field: "authors",
      message: "At least one author with a family name is required.",
      severity: "warning",
    });
  }
  if (!input.year) {
    issues.push({
      field: "year",
      message: "No year — citation will use “n.d.” per APA convention.",
      severity: "warning",
    });
  }
  if (input.type === "journal-article") {
    if (!input.journal)
      issues.push({
        field: "journal",
        message: "Journal name is required for journal-article type.",
        severity: "error",
      });
    if (!input.doi && !input.url)
      issues.push({
        field: "doi",
        message: "DOI not provided — APA 7 recommends DOIs when available.",
        severity: "warning",
      });
  }
  if (input.type === "book" && !input.publisher) {
    issues.push({
      field: "publisher",
      message: "Publisher is required for books.",
      severity: "warning",
    });
  }
  return issues;
}

// Parse a simple "Last, First M." or "Last, F. M." string into AuthorName[].
// The UI uses this for quick paste-in.
export function parseAuthorString(raw: string): AuthorName[] {
  const text = raw.trim();
  if (!text) return [];
  // Split on "&" or "and" then on commas IF the part contains a comma.
  const parts = text
    .split(/\s*(?:&|,\s+and\s+|;\s+|\s+and\s+)\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: AuthorName[] = [];
  for (const p of parts) {
    if (p.includes(",")) {
      const [family, given] = p.split(",").map((s) => s.trim());
      out.push({ family, given: given ?? "" });
    } else {
      // "Mary Sierra" → assume last token is family.
      const tokens = p.split(/\s+/);
      const family = tokens[tokens.length - 1] ?? "";
      const given = tokens.slice(0, -1).join(" ");
      out.push({ family, given });
    }
  }
  return out;
}
