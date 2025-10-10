/**
 * 🖖 Axanar Forum Emoji System
 * Star Trek themed emojis for retro forum experience
 * MySpace meets phpBB meets Starfleet Academy!
 */

export interface ForumEmoji {
  code: string;
  emoji: string;
  category: 'starfleet' | 'ships' | 'alien' | 'reactions' | 'tech' | 'action' | 'classic';
  description: string;
  shortcode: string;
}

export const FORUM_EMOJIS: ForumEmoji[] = [
  // 🖖 Starfleet & Crew
  { code: ':vulcan:', emoji: '🖖', category: 'starfleet', description: 'Vulcan Salute', shortcode: 'vulcan' },
  { code: ':captain:', emoji: '👨‍✈️', category: 'starfleet', description: 'Captain', shortcode: 'captain' },
  { code: ':officer:', emoji: '👮', category: 'starfleet', description: 'Officer', shortcode: 'officer' },
  { code: ':ensign:', emoji: '👤', category: 'starfleet', description: 'Ensign', shortcode: 'ensign' },
  { code: ':admiral:', emoji: '⭐', category: 'starfleet', description: 'Admiral', shortcode: 'admiral' },
  { code: ':comm_badge:', emoji: '📛', category: 'starfleet', description: 'Comm Badge', shortcode: 'badge' },
  
  // 🚀 Ships & Space
  { code: ':enterprise:', emoji: '🚀', category: 'ships', description: 'Starship', shortcode: 'ship' },
  { code: ':shuttle:', emoji: '🛸', category: 'ships', description: 'Shuttle', shortcode: 'shuttle' },
  { code: ':rocket:', emoji: '🚀', category: 'ships', description: 'Rocket', shortcode: 'rocket' },
  { code: ':orbit:', emoji: '🛰️', category: 'ships', description: 'Satellite', shortcode: 'orbit' },
  { code: ':warp:', emoji: '✨', category: 'ships', description: 'Warp Speed', shortcode: 'warp' },
  { code: ':asteroid:', emoji: '☄️', category: 'ships', description: 'Asteroid', shortcode: 'asteroid' },
  { code: ':planet:', emoji: '🪐', category: 'ships', description: 'Planet', shortcode: 'planet' },
  { code: ':moon:', emoji: '🌙', category: 'ships', description: 'Moon', shortcode: 'moon' },
  { code: ':earth:', emoji: '🌍', category: 'ships', description: 'Earth', shortcode: 'earth' },
  { code: ':mars:', emoji: '🔴', category: 'ships', description: 'Mars', shortcode: 'mars' },
  
  // 👽 Aliens & Species
  { code: ':alien:', emoji: '👽', category: 'alien', description: 'Alien', shortcode: 'alien' },
  { code: ':klingon:', emoji: '⚔️', category: 'alien', description: 'Klingon', shortcode: 'klingon' },
  { code: ':vulcan_hand:', emoji: '🖖', category: 'alien', description: 'Vulcan', shortcode: 'llap' },
  { code: ':robot:', emoji: '🤖', category: 'alien', description: 'Android', shortcode: 'android' },
  { code: ':borg:', emoji: '🦾', category: 'alien', description: 'Borg', shortcode: 'borg' },
  
  // 😊 Reactions & Emotions
  { code: ':engage:', emoji: '🎯', category: 'reactions', description: 'Engage!', shortcode: 'engage' },
  { code: ':love:', emoji: '❤️', category: 'reactions', description: 'Love', shortcode: 'love' },
  { code: ':wow:', emoji: '😮', category: 'reactions', description: 'Wow', shortcode: 'wow' },
  { code: ':laugh:', emoji: '😂', category: 'reactions', description: 'Laugh', shortcode: 'lol' },
  { code: ':cool:', emoji: '😎', category: 'reactions', description: 'Cool', shortcode: 'cool' },
  { code: ':think:', emoji: '🤔', category: 'reactions', description: 'Thinking', shortcode: 'think' },
  { code: ':yes:', emoji: '👍', category: 'reactions', description: 'Thumbs Up', shortcode: 'yes' },
  { code: ':no:', emoji: '👎', category: 'reactions', description: 'Thumbs Down', shortcode: 'no' },
  { code: ':clap:', emoji: '👏', category: 'reactions', description: 'Applause', shortcode: 'clap' },
  { code: ':fire:', emoji: '🔥', category: 'reactions', description: 'Fire/Hot Take', shortcode: 'fire' },
  { code: ':100:', emoji: '💯', category: 'reactions', description: '100%', shortcode: '100' },
  { code: ':trophy:', emoji: '🏆', category: 'reactions', description: 'Trophy', shortcode: 'trophy' },
  { code: ':medal:', emoji: '🏅', category: 'reactions', description: 'Medal', shortcode: 'medal' },
  { code: ':star:', emoji: '⭐', category: 'reactions', description: 'Star', shortcode: 'star' },
  
  // ⚡ Tech & Equipment
  { code: ':phaser:', emoji: '🔫', category: 'tech', description: 'Phaser', shortcode: 'phaser' },
  { code: ':tricorder:', emoji: '📱', category: 'tech', description: 'Tricorder', shortcode: 'tricorder' },
  { code: ':computer:', emoji: '💻', category: 'tech', description: 'Computer', shortcode: 'computer' },
  { code: ':screen:', emoji: '🖥️', category: 'tech', description: 'Viewscreen', shortcode: 'viewscreen' },
  { code: ':energy:', emoji: '⚡', category: 'tech', description: 'Energy', shortcode: 'energy' },
  { code: ':power:', emoji: '🔋', category: 'tech', description: 'Power', shortcode: 'power' },
  { code: ':shield:', emoji: '🛡️', category: 'tech', description: 'Shields', shortcode: 'shields' },
  { code: ':torpedo:', emoji: '💥', category: 'tech', description: 'Torpedo', shortcode: 'torpedo' },
  { code: ':beam:', emoji: '✨', category: 'tech', description: 'Transport Beam', shortcode: 'beam' },
  { code: ':science:', emoji: '🔬', category: 'tech', description: 'Science', shortcode: 'science' },
  { code: ':medical:', emoji: '⚕️', category: 'tech', description: 'Medical', shortcode: 'medical' },
  
  // 🎬 Action & Status
  { code: ':red_alert:', emoji: '🚨', category: 'action', description: 'Red Alert', shortcode: 'alert' },
  { code: ':warning:', emoji: '⚠️', category: 'action', description: 'Warning', shortcode: 'warning' },
  { code: ':peace:', emoji: '☮️', category: 'action', description: 'Peace', shortcode: 'peace' },
  { code: ':battle:', emoji: '⚔️', category: 'action', description: 'Battle', shortcode: 'battle' },
  { code: ':explore:', emoji: '🗺️', category: 'action', description: 'Explore', shortcode: 'explore' },
  { code: ':mission:', emoji: '🎯', category: 'action', description: 'Mission', shortcode: 'mission' },
  { code: ':check:', emoji: '✅', category: 'action', description: 'Check/Done', shortcode: 'check' },
  { code: ':x:', emoji: '❌', category: 'action', description: 'X/No', shortcode: 'x' },
  { code: ':boom:', emoji: '💥', category: 'action', description: 'Explosion', shortcode: 'boom' },
  { code: ':sparkle:', emoji: '✨', category: 'action', description: 'Sparkle', shortcode: 'sparkle' },
  
  // 🎮 Classic Internet/MySpace Era
  { code: ':heart:', emoji: '💖', category: 'classic', description: 'Sparkle Heart', shortcode: 'heart' },
  { code: ':music:', emoji: '🎵', category: 'classic', description: 'Music', shortcode: 'music' },
  { code: ':camera:', emoji: '📷', category: 'classic', description: 'Camera', shortcode: 'camera' },
  { code: ':phone:', emoji: '📞', category: 'classic', description: 'Phone', shortcode: 'phone' },
  { code: ':mail:', emoji: '✉️', category: 'classic', description: 'Mail', shortcode: 'mail' },
  { code: ':gift:', emoji: '🎁', category: 'classic', description: 'Gift', shortcode: 'gift' },
  { code: ':cake:', emoji: '🎂', category: 'classic', description: 'Cake', shortcode: 'cake' },
  { code: ':pizza:', emoji: '🍕', category: 'classic', description: 'Pizza', shortcode: 'pizza' },
  { code: ':coffee:', emoji: '☕', category: 'classic', description: 'Coffee', shortcode: 'coffee' },
  { code: ':beer:', emoji: '🍺', category: 'classic', description: 'Romulan Ale', shortcode: 'ale' },
  { code: ':book:', emoji: '📚', category: 'classic', description: 'PADD/Books', shortcode: 'book' },
  { code: ':pencil:', emoji: '✏️', category: 'classic', description: 'Pencil', shortcode: 'edit' },
  { code: ':flag:', emoji: '🚩', category: 'classic', description: 'Flag', shortcode: 'flag' },
  { code: ':time:', emoji: '⏰', category: 'classic', description: 'Time', shortcode: 'time' },
  { code: ':calendar:', emoji: '📅', category: 'classic', description: 'Calendar', shortcode: 'cal' },
  { code: ':pin:', emoji: '📌', category: 'classic', description: 'Pin', shortcode: 'pin' },
];

// Quick lookup by shortcode
export const EMOJI_MAP = FORUM_EMOJIS.reduce((acc, emoji) => {
  acc[emoji.shortcode] = emoji;
  acc[emoji.code] = emoji;
  return acc;
}, {} as Record<string, ForumEmoji>);

// Get emojis by category
export const getEmojisByCategory = (category: ForumEmoji['category']) => {
  return FORUM_EMOJIS.filter(e => e.category === category);
};

// Convert text with :shortcode: to emojis
export const parseEmojis = (text: string): string => {
  return text.replace(/:(\w+):/g, (match, code) => {
    const emoji = EMOJI_MAP[code];
    return emoji ? emoji.emoji : match;
  });
};

// Get random emoji from category
export const getRandomEmoji = (category?: ForumEmoji['category']): string => {
  const pool = category ? getEmojisByCategory(category) : FORUM_EMOJIS;
  return pool[Math.floor(Math.random() * pool.length)].emoji;
};

// Emoji categories for picker
export const EMOJI_CATEGORIES = [
  { id: 'starfleet', label: '🖖 Starfleet', icon: '🖖' },
  { id: 'ships', label: '🚀 Ships', icon: '🚀' },
  { id: 'alien', label: '👽 Aliens', icon: '👽' },
  { id: 'reactions', label: '😊 Reactions', icon: '😊' },
  { id: 'tech', label: '⚡ Tech', icon: '⚡' },
  { id: 'action', label: '🎬 Action', icon: '🎬' },
  { id: 'classic', label: '💖 Classic', icon: '💖' },
] as const;

// Popular emoji shortcuts
export const QUICK_EMOJIS = [
  '🖖', '🚀', '❤️', '😂', '👍', '🔥', '✨', '💯', '🏆', '⭐',
  '👽', '⚔️', '🎯', '💥', '🛡️', '🔫', '🚨', '☕', '🍕', '💖'
];
