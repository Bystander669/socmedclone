/**
 * Escapes HTML and converts **bold** and *italic* to HTML tags.
 * Returns safe HTML string for use with dangerouslySetInnerHTML.
 */
export function formatPostContentToHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"font-semibold\">$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em class=\"italic\">$1</em>");
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}
