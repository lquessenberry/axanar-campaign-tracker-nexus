import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseEmojis } from '@/lib/forum-emojis';

/**
 * Renders markdown content with emoji and mention support
 */
export const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  // First parse emojis
  const contentWithEmojis = parseEmojis(content);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom link renderer for mentions
          a: ({ href, children, ...props }) => {
            // Check if it's a mention (starts with @)
            const text = String(children);
            if (text.startsWith('@')) {
              const username = text.slice(1);
              return (
                <a
                  href={`/u/${username}`}
                  className="mention-link font-semibold text-axanar-teal hover:underline"
                  data-username={username}
                  {...props}
                >
                  {text}
                </a>
              );
            }
            // Regular link
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-axanar-teal hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Style code blocks
          code: ({ children, ...props }) => {
            const className = (props as any).className || '';
            const isInline = !className.includes('language-');
            
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-3 rounded text-sm font-mono overflow-x-auto" {...props}>
                {children}
              </code>
            );
          },
          // Style blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-axanar-teal pl-4 italic text-muted-foreground my-2" {...props}>
              {children}
            </blockquote>
          ),
          // Style tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-border" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted px-3 py-2 font-semibold text-left" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-2" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {contentWithEmojis}
      </ReactMarkdown>
    </div>
  );
};
