// export interface GuideSection {
//   title: string;
//   tone: "do" | "avoid";
//   items: string[];
// }

// export interface ParsedGuide {
//   intro: string[];
//   sections: GuideSection[];
// }

// const LIST_MARKER = /^(?:\d+[.)]|[-*•])\s+/;
// const AVOID_WORDS = /avoid|don'?t|do not|never|mistake|not to/i;

// function cleanHeading(line: string): string {
//   return line
//     .replace(/^#{1,6}\s*/, "")
//     .replace(/^\*\*(.*?)\*\*:?$/, "$1")
//     .replace(/:$/, "")
//     .trim();
// }

// function isHeading(line: string, next?: string): boolean {
//   if (LIST_MARKER.test(line)) return false;
//   if (/^#{1,6}\s/.test(line)) return true;
//   if (/^\*\*.*\*\*:?$/.test(line)) return true;
//   if (line.endsWith(":")) return true;
//   return Boolean(next) && LIST_MARKER.test(next as string) && line.length <= 60;
// }

// export function parseGuideBody(body: string): ParsedGuide {
//   const result: ParsedGuide = { intro: [], sections: [] };
//   let current: GuideSection | null = null;

//   const blocks = body.replace(/\r/g, "").split(/\n\s*\n/);

//   for (const block of blocks) {
//     const lines = block
//       .split("\n")
//       .map((l) => l.trim())
//       .filter(Boolean);

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const next = lines[i + 1];

//       // A short first line in a multi-line block is treated as a heading
//       const blockHeading =
//         i === 0 &&
//         lines.length > 1 &&
//         line.length <= 40 &&
//         !LIST_MARKER.test(line) &&
//         !/[.!?]$/.test(line);

//       if (isHeading(line, next) || blockHeading) {
//         current = {
//           title: cleanHeading(line),
//           tone: AVOID_WORDS.test(line) ? "avoid" : "do",
//           items: [],
//         };
//         result.sections.push(current);
//         continue;
//       }

//       const text = line.replace(LIST_MARKER, "").trim();
//       if (current) current.items.push(text);
//       else result.intro.push(text);
//     }
//   }

//   result.sections = result.sections.filter((s) => s.items.length > 0);
//   return result;
// }


export type GuideTone = "do" | "avoid";

export interface GuideSection {
  title: string;
  tone: GuideTone;
  items: string[];
}

export interface ParsedGuideBody {
  intro: string[];
  sections: GuideSection[];
}

/**
 * Expected body format (markdown-ish, all parts optional):
 *
 *   Optional intro paragraph.
 *
 *   ## What You Should Do
 *   1. First step
 *   2. Second step
 *
 *   ## What To Avoid
 *   - First thing to avoid
 *   - Second thing to avoid
 *
 * Also understood: "**Title**", "Title:" headings, and "-", "*", "•", "1." or "1)" list markers.
 * If no headings are found, `sections` is empty and everything lands in `intro`
 * so the caller can fall back to showing the raw body once.
 */

const HEADING_MD = /^#{1,6}\s+(.+?)\s*#*$/;
const HEADING_BOLD = /^\*\*(.+?)\*\*:?$/;
const HEADING_COLON = /^([A-Za-z][^.!?:]{1,58}):$/;
const LIST_ITEM = /^(?:[-*•–]|\d+[.)])\s+(.+)$/;
const AVOID_TITLE =
  /\b(avoid|never|don['’]?ts?|do not|not to|mistakes?|pitfalls?)\b/i;

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

export function parseGuideBody(body: string): ParsedGuideBody {
  const intro: string[] = [];
  const sections: GuideSection[] = [];

  // Some seed scripts store literal "\n" sequences instead of real newlines.
  const lines = (body ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let current: GuideSection | null = null;

  for (const line of lines) {
    const heading = matchHeading(line);
    if (heading) {
      current = {
        title: heading,
        tone: AVOID_TITLE.test(heading) ? "avoid" : "do",
        items: [],
      };
      sections.push(current);
      continue;
    }

    const item = line.match(LIST_ITEM);
    const text = cleanInline(item ? item[1] : line);
    if (!text) continue;

    if (current) current.items.push(text);
    else intro.push(text);
  }

  return {
    intro,
    // A heading with nothing under it is not worth a card.
    sections: sections.filter((s) => s.items.length > 0),
  };
}