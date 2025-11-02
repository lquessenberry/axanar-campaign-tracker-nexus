import React from 'react';

/**
 * Parses @mentions in text and converts them to clickable profile links
 * @param text - The text content to parse
 * @returns HTML string with mentions converted to links
 */
export const parseMentions = (text: string): string => {
  // Match @username patterns (alphanumeric and underscores)
  return text.replace(
    /@(\w+)/g, 
    '<a href="/u/$1" class="mention-link font-semibold text-axanar-teal hover:underline" data-username="$1">@$1</a>'
  );
};

/**
 * Extracts all @mentions from text
 * @param text - The text content to parse
 * @returns Array of usernames mentioned (without @)
 */
export const extractMentions = (text: string): string[] => {
  const matches = text.match(/@(\w+)/g);
  if (!matches) return [];
  return matches.map(mention => mention.slice(1)); // Remove @ symbol
};
