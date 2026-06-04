export default function getVisiblePagination(
  current: number,
  total: number
): (number | string)[] {
  const delta = 2;
  const range: (number | string)[] = [];
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  range.push(1);

  if (start > 2) range.push('...');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
}