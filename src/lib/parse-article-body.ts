export interface ArticleSection {
  title: string;
  body: string;
}

export interface ParsedArticleBody {
  intro: string;
  sections: ArticleSection[];
}

const HEADING_MD = /^#{1,6}\s+(.+?)\s*#*$/;
const HEADING_BOLD = /^\*\*(.+?)\*\*:?$/;
const HEADING_COLON = /^([A-Za-z][^.!?:]{1,58}):$/;

function cleanInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .trim();
}

function matchHeading(line: string): string | null {
  const m =
    line.match(HEADING_MD) ?? line.match(HEADING_BOLD) ?? line.match(HEADING_COLON);
  return m ? cleanInline(m[1]).replace(/:$/, "") : null;
}

/**
 * Splits an article body into an optional lead-in paragraph plus
 * "## Heading" sections, each holding the paragraph(s) under it as one block
 * (unlike parse-guide-body, lines under a heading are NOT turned into a list).
 *
 * Also understands "**Heading**" and "Heading:" lines, and literal "\n"
 * sequences from seed scripts. If no headings are found, `sections` is empty
 * and everything lands in `intro`, so the caller can render the raw body once.
 */
export function parseArticleBody(body: string): ParsedArticleBody {
  const introLines: string[] = [];
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;

  const lines = (body ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const heading = matchHeading(line);
    if (heading) {
      current = { title: heading, body: "" };
      sections.push(current);
      continue;
    }

    const text = cleanInline(line);
    if (!text) continue;

    if (current) {
      current.body = current.body ? `${current.body} ${text}` : text;
    } else {
      introLines.push(text);
    }
  }

  return {
    intro: introLines.join(" "),
    sections: sections.filter((s) => s.body.length > 0),
  };
}