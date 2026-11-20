export type EditableNodeType = 'dialogue' | 'argument' | 'participant';

export const NODE_COLOR_PRESETS = [
  { name: 'White', color: '#ffffff' },
  { name: 'Light blue', color: '#d8eefd' },
  { name: 'Light green', color: '#beeeb8' },
  { name: 'Light yellow', color: '#fff2cc' },
  { name: 'Light pink', color: '#f4cccc' },
  { name: 'Lavender', color: '#d9d2e9' },
] as const;

export const DEFAULT_NODE_BACKGROUND_COLORS: Record<EditableNodeType, string> = {
  dialogue: '#ffffff',
  argument: '#d8eefd',
  participant: '#beeeb8',
};

export function getNodeBackgroundColor(nodeType: unknown, backgroundColor: unknown): string {
  if (typeof backgroundColor === 'string' && /^#[\da-f]{6}$/i.test(backgroundColor)) {
    return backgroundColor.toLowerCase();
  }

  if (nodeType === 'argument' || nodeType === 'participant') {
    return DEFAULT_NODE_BACKGROUND_COLORS[nodeType];
  }

  return DEFAULT_NODE_BACKGROUND_COLORS.dialogue;
}
