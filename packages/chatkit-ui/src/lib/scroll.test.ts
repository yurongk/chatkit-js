import { describe, expect, it } from 'vitest';

import {
  BOTTOM_FOLLOW_THRESHOLD_PX,
  getDistanceFromBottom,
  isNearBottom,
} from './scroll';

describe('scroll helpers', () => {
  it('calculates distance from the bottom of a scroll container', () => {
    expect(
      getDistanceFromBottom({
        clientHeight: 400,
        scrollHeight: 900,
        scrollTop: 420,
      }),
    ).toBe(80);
  });

  it('treats positions within the threshold as near the bottom', () => {
    expect(
      isNearBottom({
        clientHeight: 400,
        scrollHeight: 900,
        scrollTop: 900 - 400 - BOTTOM_FOLLOW_THRESHOLD_PX + 1,
      }),
    ).toBe(true);
  });

  it('treats positions above the threshold as away from the bottom', () => {
    expect(
      isNearBottom({
        clientHeight: 400,
        scrollHeight: 900,
        scrollTop: 900 - 400 - BOTTOM_FOLLOW_THRESHOLD_PX - 1,
      }),
    ).toBe(false);
  });
});
