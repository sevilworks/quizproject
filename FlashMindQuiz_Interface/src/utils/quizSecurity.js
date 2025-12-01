// Quiz Security Utilities - Non-Intrusive Fraud Detection
// Tracks violations without blocking browser functionality

export class QuizSecurityManager {
  constructor(options = {}) {
    this.options = {
      maxViolations: options.maxViolations || 3,
      warningTimeout: options.warningTimeout || 5000,
      activityThreshold: options.activityThreshold || 30000, // 30 seconds
      showDevToolsWarning: options.showDevToolsWarning !== false,
      ...options
    };
    
    this.violations = [];
    this.isActive = false;
    this.lastActivity = Date.now();
    this.violationCallbacks = [];
    this.activityCallbacks = [];
    this.devToolsDetected = false;
    
    // Bind methods to preserve context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleCut = this.handleCut.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleActivityCheck = this.handleActivityCheck.bind(this);
    this.detectDevTools = this.detectDevTools.bind(this);
  }

  // Register callbacks for violations and activity
  onViolation(callback) {
    this.violationCallbacks.push(callback);
    return () => {
      const index = this.violationCallbacks.indexOf(callback);
      if (index > -1) {
        this.violationCallbacks.splice(index, 1);
      }
    };
  }

  onActivity(callback) {
    this.activityCallbacks.push(callback);
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  // Start security monitoring (non-intrusive)
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.lastActivity = Date.now();
    
    // Listen for events but DON'T prevent default behavior
    document.addEventListener('keydown', this.handleKeyDown, true);
    document.addEventListener('keyup', this.handleKeyUp, true);
    
    // Context menu, copy, cut, paste events (non-blocking)
    document.addEventListener('contextmenu', this.handleContextMenu, true);
    document.addEventListener('copy', this.handleCopy, true);
    document.addEventListener('cut', this.handleCut, true);
    document.addEventListener('paste', this.handlePaste, true);
    
    // Window events (non-blocking)
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('focus', this.handleFocus);
    
    // Activity monitoring
    document.addEventListener('mousemove', this.handleMouseMove, true);
    document.addEventListener('scroll', this.handleScroll, true);
    document.addEventListener('click', this.handleActivityCheck, true);
    document.addEventListener('touchstart', this.handleActivityCheck, true);
    
    // Activity check interval
    this.activityInterval = setInterval(() => {
      this.handleActivityCheck();
    }, 5000);
    
    // Developer tools detection
    if (this.options.showDevToolsWarning) {
      this.devToolsInterval = setInterval(this.detectDevTools, 2000);
    }
    
    console.log('🛡️ Quiz security monitoring activated (non-intrusive)');
  }

  // Stop security monitoring
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Remove all event listeners
    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.removeEventListener('keyup', this.handleKeyUp, true);
    document.removeEventListener('contextmenu', this.handleContextMenu, true);
    document.removeEventListener('copy', this.handleCopy, true);
    document.removeEventListener('cut', this.handleCut, true);
    document.removeEventListener('paste', this.handlePaste, true);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    document.removeEventListener('scroll', this.handleScroll, true);
    document.removeEventListener('click', this.handleActivityCheck, true);
    document.removeEventListener('touchstart', this.handleActivityCheck, true);
    
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    
    if (this.devToolsInterval) {
      clearInterval(this.devToolsInterval);
    }
    
    console.log('🛡️ Quiz security monitoring deactivated');
  }

  // Handle different types of violations (non-blocking)
  reportViolation(type, details = {}) {
    const violation = {
      type,
      timestamp: Date.now(),
      details,
      id: Date.now() + Math.random()
    };
    
    this.violations.push(violation);
    
    // Trigger violation callbacks
    this.violationCallbacks.forEach(callback => {
      try {
        callback(violation, this.violations.length);
      } catch (error) {
        console.error('Error in violation callback:', error);
      }
    });
    
    console.warn(`🚨 Quiz security violation: ${type}`, details);
    
    // Check if max violations reached
    if (this.violations.length >= this.options.maxViolations) {
      this.reportViolation('MAX_VIOLATIONS_REACHED', {
        violations: this.violations,
        count: this.violations.length
      });
    }
    
    return violation;
  }

  // Keyboard event handlers (non-blocking)
  handleKeyDown(event) {
    if (!this.isActive) return;
    
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const alt = event.altKey;
    const shift = event.shiftKey;
    
    // Track but don't block copy shortcuts
    if (ctrl && key === 'c') {
      this.reportViolation('COPY_SHORTCUT_BLOCKED', { key: 'Ctrl+C' });
      return;
    }
    
    // Track but don't block paste shortcuts
    if (ctrl && key === 'v') {
      this.reportViolation('PASTE_SHORTCUT_BLOCKED', { key: 'Ctrl+V' });
      return;
    }
    
    // Track but don't block cut shortcuts
    if (ctrl && key === 'x') {
      this.reportViolation('CUT_SHORTCUT_BLOCKED', { key: 'Ctrl+X' });
      return;
    }
    
    // Track but don't block select all
    if (ctrl && key === 'a') {
      this.reportViolation('SELECT_ALL_BLOCKED', { key: 'Ctrl+A' });
      return;
    }
    
    // Track but don't block print
    if (ctrl && key === 'p') {
      this.reportViolation('PRINT_BLOCKED', { key: 'Ctrl+P' });
      return;
    }
    
    // Track but don't block developer tools
    if ((ctrl && shift && (key === 'i' || key === 'j' || key === 'c')) || 
        (key === 'f12')) {
      this.reportViolation('DEV_TOOLS_BLOCKED', { key: event.key });
      return;
    }
    
    // Track but don't block refresh
    if ((ctrl && key === 'r') || key === 'f5') {
      this.reportViolation('REFRESH_BLOCKED', { key: event.key });
      return;
    }
    
    this.handleActivity();
  }

  handleKeyUp(event) {
    if (!this.isActive) return;
    this.handleActivity();
  }

  // Mouse and context menu handlers (non-blocking)
  handleContextMenu(event) {
    if (!this.isActive) return;
    // Allow context menu but report violation
    this.reportViolation('CONTEXT_MENU_BLOCKED');
  }

  handleCopy(event) {
    if (!this.isActive) return;
    // Allow copy but report violation
    this.reportViolation('COPY_EVENT_BLOCKED');
  }

  handleCut(event) {
    if (!this.isActive) return;
    // Allow cut but report violation
    this.reportViolation('CUT_EVENT_BLOCKED');
  }

  handlePaste(event) {
    if (!this.isActive) return;
    // Allow paste but report violation
    this.reportViolation('PASTE_EVENT_BLOCKED');
  }

  // Window event handlers (non-blocking)
  handleBeforeUnload(event) {
    if (!this.isActive) return;
    // Allow navigation but report violation
    this.reportViolation('WINDOW_CLOSE_ATTEMPT');
  }

  handleVisibilityChange() {
    if (!this.isActive) return;
    
    if (document.hidden) {
      this.reportViolation('TAB_SWITCH_DETECTED', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    } else {
      this.handleActivity();
    }
  }

  handleBlur() {
    if (!this.isActive) return;
    this.reportViolation('WINDOW_BLUR_DETECTED');
  }

  handleFocus() {
    if (!this.isActive) return;
    this.handleActivity();
  }

  // Activity monitoring
  handleMouseMove() {
    if (!this.isActive) return;
    this.handleActivity();
  }

  handleScroll() {
    if (!this.isActive) return;
    this.handleActivity();
  }

  handleActivityCheck() {
    if (!this.isActive) return;
    this.handleActivity();
  }

  handleActivity() {
    this.lastActivity = Date.now();
    
    // Trigger activity callbacks
    this.activityCallbacks.forEach(callback => {
      try {
        callback(this.lastActivity);
      } catch (error) {
        console.error('Error in activity callback:', error);
      }
    });
  }

  // Developer tools detection
  detectDevTools() {
    if (!this.isActive) return;
    
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      if (!this.devToolsDetected) {
        this.devToolsDetected = true;
        this.reportViolation('DEV_TOOLS_DETECTED', {
          widthDiff: window.outerWidth - window.innerWidth,
          heightDiff: window.outerHeight - window.innerHeight
        });
      }
    } else {
      this.devToolsDetected = false;
    }
  }

  // Get violation statistics
  getViolationStats() {
    const violationTypes = {};
    this.violations.forEach(violation => {
      violationTypes[violation.type] = (violationTypes[violation.type] || 0) + 1;
    });
    
    return {
      total: this.violations.length,
      types: violationTypes,
      recent: this.violations.slice(-5), // Last 5 violations
      isActive: this.isActive,
      lastActivity: this.lastActivity
    };
  }

  // Reset violations (for testing or quiz restart)
  resetViolations() {
    this.violations = [];
    console.log('🔄 Quiz security violations reset');
  }

  // Force trigger a violation (for testing)
  testViolation(type = 'TEST_VIOLATION', details = {}) {
    return this.reportViolation(type, { ...details, test: true });
  }
}

// Utility functions for security operations
export const securityUtils = {
  // Apply text selection prevention to specific elements only
  preventTextSelectionOnQuestions(questionElements) {
    questionElements.forEach(element => {
      element.style.userSelect = 'none';
      element.style.webkitUserSelect = 'none';
      element.style.mozUserSelect = 'none';
      element.style.msUserSelect = 'none';
    });
  },

  // Enable text selection on elements
  enableTextSelection(elements) {
    elements.forEach(element => {
      element.style.userSelect = '';
      element.style.webkitUserSelect = '';
      element.style.mozUserSelect = '';
      element.style.msUserSelect = '';
    });
  },

  // Remove all blocking overlays
  removeAllOverlays() {
    const overlays = document.querySelectorAll('[data-security-overlay]');
    overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
  }
};

export default QuizSecurityManager;