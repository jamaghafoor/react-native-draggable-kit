import {
  getAccessibilityActions,
  getPositionAccessibilityHint,
} from '../../src/utils/accessibility';

describe('getAccessibilityActions', () => {
  it('should include all actions for middle items', () => {
    const actions = getAccessibilityActions(2, 5);
    const names = actions.map((a) => a.name);
    expect(names).toContain('moveUp');
    expect(names).toContain('moveDown');
    expect(names).toContain('moveToTop');
    expect(names).toContain('moveToBottom');
  });

  it('should exclude moveUp/moveToTop for first item', () => {
    const actions = getAccessibilityActions(0, 5);
    const names = actions.map((a) => a.name);
    expect(names).not.toContain('moveUp');
    expect(names).not.toContain('moveToTop');
    expect(names).toContain('moveDown');
    expect(names).toContain('moveToBottom');
  });

  it('should exclude moveDown/moveToBottom for last item', () => {
    const actions = getAccessibilityActions(4, 5);
    const names = actions.map((a) => a.name);
    expect(names).toContain('moveUp');
    expect(names).toContain('moveToTop');
    expect(names).not.toContain('moveDown');
    expect(names).not.toContain('moveToBottom');
  });

  it('should return empty for single-item list', () => {
    const actions = getAccessibilityActions(0, 1);
    expect(actions).toHaveLength(0);
  });

  it('should return both directions for two-item list, first item', () => {
    const actions = getAccessibilityActions(0, 2);
    const names = actions.map((a) => a.name);
    expect(names).toContain('moveDown');
    expect(names).toContain('moveToBottom');
    expect(names).not.toContain('moveUp');
  });

  it('should return both directions for two-item list, second item', () => {
    const actions = getAccessibilityActions(1, 2);
    const names = actions.map((a) => a.name);
    expect(names).toContain('moveUp');
    expect(names).toContain('moveToTop');
    expect(names).not.toContain('moveDown');
  });

  it('should include labels for all actions', () => {
    const actions = getAccessibilityActions(1, 3);
    actions.forEach((action) => {
      expect(action.label).toBeTruthy();
      expect(typeof action.label).toBe('string');
    });
  });
});

describe('getPositionAccessibilityHint', () => {
  it('should return correct hint for first item', () => {
    const hint = getPositionAccessibilityHint(0, 5);
    expect(hint).toBe(
      'Item 1 of 5. Use accessibility actions to reorder.',
    );
  });

  it('should return correct hint for last item', () => {
    const hint = getPositionAccessibilityHint(4, 5);
    expect(hint).toBe(
      'Item 5 of 5. Use accessibility actions to reorder.',
    );
  });

  it('should use 1-based indexing', () => {
    const hint = getPositionAccessibilityHint(0, 1);
    expect(hint).toContain('Item 1 of 1');
  });
});
