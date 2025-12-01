// Test file for Quiz Security Manager
// This file can be used to test the security functionality

import { QuizSecurityManager, securityUtils } from './quizSecurity';

describe('QuizSecurityManager', () => {
  let securityManager;

  beforeEach(() => {
    securityManager = new QuizSecurityManager({
      maxViolations: 3,
      warningTimeout: 5000
    });
  });

  afterEach(() => {
    if (securityManager) {
      securityManager.stop();
    }
  });

  test('should initialize security manager', () => {
    expect(securityManager.isActive).toBe(false);
    securityManager.start();
    expect(securityManager.isActive).toBe(true);
  });

  test('should stop security monitoring', () => {
    securityManager.start();
    expect(securityManager.isActive).toBe(true);
    securityManager.stop();
    expect(securityManager.isActive).toBe(false);
  });

  test('should report violations', () => {
    securityManager.start();
    const violation = securityManager.reportViolation('TEST_VIOLATION', { test: true });
    expect(violation.type).toBe('TEST_VIOLATION');
    expect(securityManager.violations).toHaveLength(1);
  });

  test('should track violation count', () => {
    securityManager.start();
    securityManager.reportViolation('COPY_EVENT_BLOCKED');
    securityManager.reportViolation('TAB_SWITCH_DETECTED');
    expect(securityManager.violations).toHaveLength(2);
  });

  test('should not exceed max violations', () => {
    securityManager = new QuizSecurityManager({ maxViolations: 2 });
    securityManager.start();
    
    securityManager.reportViolation('COPY_EVENT_BLOCKED');
    securityManager.reportViolation('TAB_SWITCH_DETECTED');
    securityManager.reportViolation('DEV_TOOLS_DETECTED');
    
    expect(securityManager.violations).toHaveLength(3);
  });

  test('should provide violation statistics', () => {
    securityManager.start();
    securityManager.reportViolation('COPY_EVENT_BLOCKED');
    securityManager.reportViolation('TAB_SWITCH_DETECTED');
    securityManager.reportViolation('COPY_EVENT_BLOCKED');
    
    const stats = securityManager.getViolationStats();
    expect(stats.total).toBe(3);
    expect(stats.types.COPY_EVENT_BLOCKED).toBe(2);
    expect(stats.types.TAB_SWITCH_DETECTED).toBe(1);
    expect(stats.isActive).toBe(true);
  });

  test('should reset violations', () => {
    securityManager.start();
    securityManager.reportViolation('COPY_EVENT_BLOCKED');
    securityManager.reportViolation('TAB_SWITCH_DETECTED');
    expect(securityManager.violations).toHaveLength(2);
    
    securityManager.resetViolations();
    expect(securityManager.violations).toHaveLength(0);
  });

  test('should register violation callbacks', () => {
    const callback = jest.fn();
    const unsubscribe = securityManager.onViolation(callback);
    
    securityManager.start();
    securityManager.reportViolation('TEST_VIOLATION');
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TEST_VIOLATION' }),
      1
    );
    
    unsubscribe();
    securityManager.reportViolation('TEST_VIOLATION_2');
    expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
  });

  test('should register activity callbacks', () => {
    const callback = jest.fn();
    const unsubscribe = securityManager.onActivity(callback);
    
    securityManager.start();
    securityManager.handleActivity();
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(typeof callback.mock.calls[0][0]).toBe('number');
    
    unsubscribe();
  });
});

describe('Security Utils', () => {
  beforeEach(() => {
    // Mock document.body
    document.body = {
      style: {}
    };
  });

  test('should disable text selection', () => {
    securityUtils.disableTextSelection();
    expect(document.body.style.userSelect).toBe('none');
    expect(document.body.style.webkitUserSelect).toBe('none');
  });

  test('should enable text selection', () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    securityUtils.enableTextSelection();
    expect(document.body.style.userSelect).toBe('');
    expect(document.body.style.webkitUserSelect).toBe('');
  });

  test('should create blocking overlay', () => {
    const overlay = securityUtils.createBlockingOverlay({
      message: 'Test message'
    });
    
    expect(overlay).toBeInstanceOf(HTMLElement);
    expect(overlay.style.position).toBe('fixed');
    expect(overlay.textContent).toContain('Test message');
    
    // Clean up
    securityUtils.removeBlockingOverlay(overlay);
  });

  test('should remove blocking overlay', () => {
    const overlay = securityUtils.createBlockingOverlay();
    document.body.appendChild(overlay);
    
    expect(document.body.contains(overlay)).toBe(true);
    
    securityUtils.removeBlockingOverlay(overlay);
    expect(document.body.contains(overlay)).toBe(false);
  });
});

// Manual testing instructions:
console.log(`
🧪 Manual Security Testing Instructions:

1. Start a quiz and open browser console to see security events
2. Try these actions to test blocking:
   - Ctrl+C / Ctrl+V (copy/paste)
   - Right-click (context menu)
   - Ctrl+Shift+I (developer tools)
   - F12 (developer tools)
   - Alt+Tab (window switching)
   - Try to close the window
   - Ctrl+R (refresh)

3. Check console for security violation logs
4. Verify warning messages appear
5. Test that violations are tracked correctly
6. Test that max violations terminate the quiz

Expected console output:
- "🛡️ Quiz security monitoring activated"
- "🚨 Security violation detected: [VIOLATION_TYPE]"
- "User activity detected: [TIMESTAMP]"
- "🛡️ Quiz security monitoring deactivated"
`);

// Integration test for Quiz.jsx
console.log(`
🔗 Integration Test for Quiz.jsx:

1. Navigate to a quiz
2. Start the quiz
3. Verify:
   - Security monitoring starts
   - Violation counter initializes at 0
   - Security status indicator shows "🛡️ Surveillance active"
   - Security warnings appear for violations
   - Quiz terminates after 3 violations
   - Security violations are included in results

4. Check network requests for securityViolations parameter
5. Verify cleanup when quiz finishes normally
`);

export default {};