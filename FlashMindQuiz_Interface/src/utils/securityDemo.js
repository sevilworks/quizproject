// Security Demo Script
// This demonstrates the security mechanisms in action

import { QuizSecurityManager } from './quizSecurity';

const demo = {
  // Initialize and run a demo of security features
  runDemo() {
    console.log('🛡️ Quiz Security Manager Demo Starting...\n');

    // Create security manager
    const securityManager = new QuizSecurityManager({
      maxViolations: 3,
      warningTimeout: 3000,
      showDevToolsWarning: true
    });

    // Set up callbacks
    securityManager.onViolation((violation, count) => {
      console.log(`🚨 Violation #${count}: ${violation.type}`);
      console.log(`   Details:`, violation.details);
      console.log(`   Timestamp: ${new Date(violation.timestamp).toLocaleTimeString()}\n`);
    });

    securityManager.onActivity((lastActivity) => {
      console.log(`👤 User activity detected at ${new Date(lastActivity).toLocaleTimeString()}`);
    });

    // Start monitoring
    securityManager.start();
    console.log('✅ Security monitoring started\n');

    // Simulate various violations
    setTimeout(() => {
      console.log('--- Simulating violations ---\n');
      securityManager.testViolation('COPY_EVENT_BLOCKED');
    }, 1000);

    setTimeout(() => {
      securityManager.testViolation('TAB_SWITCH_DETECTED');
    }, 2000);

    setTimeout(() => {
      securityManager.testViolation('DEV_TOOLS_DETECTED', {
        widthDiff: 200,
        heightDiff: 100
      });
    }, 3000);

    // Show statistics
    setTimeout(() => {
      console.log('--- Security Statistics ---');
      const stats = securityManager.getViolationStats();
      console.log(`Total violations: ${stats.total}`);
      console.log('Violation types:', stats.types);
      console.log('Recent violations:', stats.recent);
      console.log('Active status:', stats.isActive ? '🟢 Active' : '🔴 Inactive');
      console.log('Last activity:', new Date(stats.lastActivity).toLocaleTimeString());
      console.log('');
    }, 4000);

    // Stop monitoring
    setTimeout(() => {
      console.log('--- Stopping security monitoring ---');
      securityManager.stop();
      console.log('✅ Security monitoring stopped\n');
      
      // Final statistics
      console.log('--- Final Statistics ---');
      const finalStats = securityManager.getViolationStats();
      console.log(`Total violations recorded: ${finalStats.total}`);
      console.log('Demo completed successfully! 🎉');
    }, 6000);

    return securityManager;
  },

  // Interactive demo that allows manual testing
  interactiveDemo() {
    console.log(`
🛡️ Interactive Security Demo

This demo allows you to manually test the security features.

Instructions:
1. The security manager will start monitoring
2. Try various actions that should be blocked:
   - Right-click anywhere
   - Press Ctrl+C, Ctrl+V, Ctrl+X
   - Press F12 or Ctrl+Shift+I
   - Try to select text
   - Try to close this tab

3. Open the browser console to see violation logs
4. Watch for warning messages

Type 'start' to begin, or 'stop' to stop the demo.
`);

    let securityManager = null;
    let isRunning = false;

    // Simple command interface
    const commands = {
      start: () => {
        if (!isRunning) {
          securityManager = this.runDemo();
          isRunning = true;
        } else {
          console.log('Demo is already running!');
        }
      },
      stop: () => {
        if (securityManager && isRunning) {
          securityManager.stop();
          isRunning = false;
          console.log('Demo stopped.');
        } else {
          console.log('No demo is currently running.');
        }
      },
      stats: () => {
        if (securityManager) {
          const stats = securityManager.getViolationStats();
          console.log('Current statistics:', stats);
        } else {
          console.log('No security manager is active.');
        }
      },
      help: () => {
        console.log(`
Available commands:
- start: Start the security demo
- stop: Stop the security demo  
- stats: Show current statistics
- help: Show this help message
        `);
      }
    };

    // Make commands available globally for testing
    window.securityDemo = commands;
    
    return commands;
  },

  // Demo specifically for Quiz.jsx integration
  quizIntegrationDemo() {
    console.log(`
🎯 Quiz.jsx Integration Demo

This demonstrates how the security features integrate with the Quiz component:

1. Quiz Loading Phase:
   - Security manager is NOT active
   - Normal quiz browsing allowed
   - No restrictions on interactions

2. Quiz Start Phase:
   - Security monitoring activates
   - All security features enabled
   - Visual indicators appear

3. Active Quiz Phase:
   - Continuous monitoring
   - Violations tracked and displayed
   - Warnings shown to user
   - Violation counter visible

4. Quiz End Phase:
   - Security monitoring stops
   - Violations included in results
   - Cleanup performed

To test in Quiz.jsx:
1. Start any quiz
2. Monitor console for security logs
3. Try prohibited actions
4. Observe violation tracking
5. Check that violations appear in results
    `);

    // Create a mock quiz session
    const mockQuizSession = {
      quizStarted: false,
      securityManager: null,
      violations: [],

      startQuiz() {
        console.log('🚀 Starting quiz session...');
        this.quizStarted = true;
        
        this.securityManager = new QuizSecurityManager();
        this.securityManager.onViolation((violation, count) => {
          this.violations.push(violation);
          console.log(`🚨 Quiz violation #${count}: ${violation.type}`);
        });
        
        this.securityManager.start();
        console.log('🛡️ Security monitoring activated for quiz');
      },

      endQuiz() {
        console.log('🏁 Ending quiz session...');
        
        if (this.securityManager) {
          this.securityManager.stop();
          console.log(`📊 Quiz completed with ${this.violations.length} security violations`);
          console.log('Violations:', this.violations.map(v => v.type));
        }
        
        this.quizStarted = false;
        return this.violations;
      },

      simulateViolation(type) {
        if (this.securityManager && this.quizStarted) {
          this.securityManager.testViolation(type);
        }
      }
    };

    // Make available for testing
    window.mockQuizSession = mockQuizSession;
    
    return mockQuizSession;
  }
};

export default demo;

// Auto-run basic demo if in browser environment
if (typeof window !== 'undefined') {
  console.log(`
🛡️ Quiz Security System Loaded

Available demo functions:
- demo.runDemo() - Run automated demo
- demo.interactiveDemo() - Interactive testing
- demo.quizIntegrationDemo() - Quiz integration demo

Try: demo.runDemo()
  `);
}