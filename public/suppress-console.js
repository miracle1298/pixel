(function() {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  const originalInfo = console.info;

  // Suppress console.error - catch all variations
  console.error = function(...args) {
    const message = String(args[0] || '');
    const fullMessage = args.map(a => String(a)).join(' ');
    if (
      message.includes('runtime.lastError') ||
      message.includes('Receiving end') ||
      message.includes('Backpack') ||
      message.includes('injected.js') ||
      message.includes('Could not establish') ||
      message.includes('Unchecked runtime') ||
      message.includes('favicon') ||
      fullMessage.includes('runtime.lastError') ||
      fullMessage.includes('Receiving end') ||
      (message.includes('404') && (message.includes('favicon') || message.includes('_next'))) ||
      message.includes('webpack.js') ||
      message.includes('main-app.js') ||
      message.includes('app-pages-internals.js') ||
      message.includes('app/layout.js')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress console.warn - catch all variations
  console.warn = function(...args) {
    const message = String(args[0] || '');
    const fullMessage = args.map(a => String(a)).join(' ');
    if (
      message.includes('React DevTools') ||
      message.includes('reactjs.org/link/react-devtools') ||
      message.includes('react-devtools') ||
      message.includes('Download the React DevTools') ||
      fullMessage.includes('React DevTools') ||
      message.includes('Backpack') ||
      message.includes('dispatchMessage') ||
      message.includes('channel-secure-background') ||
      fullMessage.includes('dispatchMessage') ||
      fullMessage.includes('channel-secure-background')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Suppress console.log - catch all variations
  console.log = function(...args) {
    const message = String(args[0] || '');
    const fullMessage = args.map(a => String(a)).join(' ');
    if (
      message.includes('dispatchMessage') ||
      message.includes('channel-secure-background') ||
      message.includes('message.js') ||
      message.includes('channel-secure-background-request') ||
      message.includes('channel-secure-background-response') ||
      fullMessage.includes('dispatchMessage') ||
      fullMessage.includes('channel-secure-background')
    ) {
      return;
    }
    originalLog.apply(console, args);
  };

  // Suppress console.info
  console.info = function(...args) {
    const message = String(args[0] || '');
    if (
      message.includes('dispatchMessage') ||
      message.includes('channel-secure-background') ||
      message.includes('React DevTools')
    ) {
      return;
    }
    originalInfo.apply(console, args);
  };
})();

