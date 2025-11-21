/**
 * Daystrom Design System - Spring Presets
 * Real physical springs for all motion (Proponent #5)
 */

export const DAYSTROM_SPRINGS = {
  default: { stiffness: 350, damping: 30 },
  snappy: { stiffness: 450, damping: 28 },
  gentle: { stiffness: 300, damping: 36 },
} as const;

export type DaystromSpring = keyof typeof DAYSTROM_SPRINGS;
