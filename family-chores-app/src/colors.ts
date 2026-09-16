export const MEMBER_COLORS = [
  '#E15554',
  '#3BB273',
  '#4D9DE0',
  '#E1A02A',
  '#7768AE',
  '#E56399',
  '#2E86AB',
  '#8FB339',
];

export function nextColor(usedCount: number): string {
  return MEMBER_COLORS[usedCount % MEMBER_COLORS.length];
}
