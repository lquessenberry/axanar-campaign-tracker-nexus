/**
 * Parses text content and highlights @mentions
 * Returns HTML with mentions wrapped in styled spans
 */
export const parseMentions = (content: string): string => {
  // Match @username patterns (alphanumeric and underscores)
  const mentionRegex = /@(\w+)/g;
  
  return content.replace(
    mentionRegex,
    '<span class="text-primary font-semibold bg-primary/10 px-1 rounded">@$1</span>'
  );
};

/**
 * Extracts all @mentions from text content
 * Returns array of usernames (without the @ symbol)
 */
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
};
