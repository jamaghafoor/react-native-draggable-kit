import {
  reorderArray,
  clamp,
  getCumulativeOffset,
  findSwapIndex,
  swapPositions,
  getVisualPosition,
  buildInitialPositions,
  lerp,
} from '../../src/utils/reorder';

describe('reorderArray', () => {
  it('should move an item from one position to another', () => {
    const data = ['a', 'b', 'c', 'd', 'e'];
    const result = reorderArray(data, 1, 3);
    expect(result).toEqual(['a', 'c', 'd', 'b', 'e']);
  });

  it('should move item forward', () => {
    const data = [1, 2, 3, 4, 5];
    expect(reorderArray(data, 0, 4)).toEqual([2, 3, 4, 5, 1]);
  });

  it('should move item backward', () => {
    const data = [1, 2, 3, 4, 5];
    expect(reorderArray(data, 4, 0)).toEqual([5, 1, 2, 3, 4]);
  });

  it('should return a copy when from === to', () => {
    const data = [1, 2, 3];
    const result = reorderArray(data, 1, 1);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(data); // new array instance
  });

  it('should not mutate the original array', () => {
    const data = ['a', 'b', 'c'];
    reorderArray(data, 0, 2);
    expect(data).toEqual(['a', 'b', 'c']);
  });

  it('should handle empty array', () => {
    const data: string[] = [];
    const result = reorderArray(data, 0, 0);
    expect(result).toEqual([]);
  });

  it('should handle single-item array', () => {
    const data = ['only'];
    const result = reorderArray(data, 0, 0);
    expect(result).toEqual(['only']);
  });

  it('should handle adjacent swap forward', () => {
    const data = [1, 2, 3];
    expect(reorderArray(data, 0, 1)).toEqual([2, 1, 3]);
  });

  it('should handle adjacent swap backward', () => {
    const data = [1, 2, 3];
    expect(reorderArray(data, 1, 0)).toEqual([2, 1, 3]);
  });

  it('should handle moving last item to first', () => {
    const data = [1, 2, 3, 4];
    expect(reorderArray(data, 3, 0)).toEqual([4, 1, 2, 3]);
  });

  it('should handle moving first item to last', () => {
    const data = [1, 2, 3, 4];
    expect(reorderArray(data, 0, 3)).toEqual([2, 3, 4, 1]);
  });
});

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should clamp to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should clamp to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle min === max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('should handle zero range at zero', () => {
    expect(clamp(0, 0, 0)).toBe(0);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('getCumulativeOffset', () => {
  it('should return 0 for index 0', () => {
    expect(getCumulativeOffset([50, 60, 70], 0)).toBe(0);
  });

  it('should sum sizes before the given index', () => {
    expect(getCumulativeOffset([50, 60, 70], 1)).toBe(50);
    expect(getCumulativeOffset([50, 60, 70], 2)).toBe(110);
    expect(getCumulativeOffset([50, 60, 70], 3)).toBe(180);
  });

  it('should handle empty sizes array', () => {
    expect(getCumulativeOffset([], 0)).toBe(0);
  });

  it('should handle index beyond array length', () => {
    expect(getCumulativeOffset([10, 20], 5)).toBe(30);
  });

  it('should handle variable heights', () => {
    expect(getCumulativeOffset([100, 50, 200, 75], 3)).toBe(350);
  });
});

describe('findSwapIndex', () => {
  it('should return currentIndex when no swap needed', () => {
    const positions = [0, 1, 2];
    const sizes = [50, 50, 50];
    const offsets = [0, 50, 100];
    // Active center at 25 (middle of item 0) - no swap needed
    expect(findSwapIndex(25, 0, sizes, offsets, positions, 3)).toBe(0);
  });

  it('should detect swap when moving down', () => {
    const positions = [0, 1, 2];
    const sizes = [50, 50, 50];
    const offsets = [0, 50, 100];
    // Active item 0 center moved to 80 (past item 1's midpoint of 75)
    expect(findSwapIndex(80, 0, sizes, offsets, positions, 3)).toBe(1);
  });

  it('should detect swap when moving up', () => {
    const positions = [0, 1, 2];
    const sizes = [50, 50, 50];
    const offsets = [0, 50, 100];
    // Active item 2 center moved to 60 (above item 1's midpoint of 75, swap needed)
    expect(findSwapIndex(60, 2, sizes, offsets, positions, 3)).toBe(1);
  });

  it('should return currentIndex for single item', () => {
    expect(findSwapIndex(25, 0, [50], [0], [0], 1)).toBe(0);
  });
});

describe('swapPositions', () => {
  it('should swap two positions', () => {
    const positions = [0, 1, 2, 3];
    expect(swapPositions(positions, 1, 3)).toEqual([0, 3, 2, 1]);
  });

  it('should not mutate original array', () => {
    const positions = [0, 1, 2];
    swapPositions(positions, 0, 2);
    expect(positions).toEqual([0, 1, 2]);
  });

  it('should handle same index', () => {
    const positions = [0, 1, 2];
    expect(swapPositions(positions, 1, 1)).toEqual([0, 1, 2]);
  });
});

describe('getVisualPosition', () => {
  it('should find the visual position of a data index', () => {
    const positions = [2, 0, 1]; // visual[0]=data[2], visual[1]=data[0], visual[2]=data[1]
    expect(getVisualPosition(positions, 0)).toBe(1);
    expect(getVisualPosition(positions, 1)).toBe(2);
    expect(getVisualPosition(positions, 2)).toBe(0);
  });

  it('should return dataIndex as fallback', () => {
    const positions = [0, 1, 2];
    expect(getVisualPosition(positions, 5)).toBe(5);
  });

  it('should handle identity mapping', () => {
    const positions = [0, 1, 2, 3];
    expect(getVisualPosition(positions, 2)).toBe(2);
  });
});

describe('buildInitialPositions', () => {
  it('should create identity array', () => {
    expect(buildInitialPositions(4)).toEqual([0, 1, 2, 3]);
  });

  it('should handle zero length', () => {
    expect(buildInitialPositions(0)).toEqual([]);
  });

  it('should handle length 1', () => {
    expect(buildInitialPositions(1)).toEqual([0]);
  });
});

describe('lerp', () => {
  it('should interpolate at t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('should interpolate at t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('should interpolate at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('should handle negative values', () => {
    expect(lerp(-100, 100, 0.5)).toBe(0);
  });
});
