export const BOTTOM_FOLLOW_THRESHOLD_PX = 48;

type ScrollMetrics = Pick<HTMLElement, 'clientHeight' | 'scrollHeight' | 'scrollTop'>;

export function getDistanceFromBottom(element: ScrollMetrics): number {
  return Math.max(0, element.scrollHeight - element.clientHeight - element.scrollTop);
}

export function isNearBottom(
  element: ScrollMetrics,
  threshold = BOTTOM_FOLLOW_THRESHOLD_PX,
): boolean {
  return getDistanceFromBottom(element) <= threshold;
}
