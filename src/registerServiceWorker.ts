/**
 * Service Worker Registration
 * Registers the service worker that excludes tracking scripts from caching
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.info('✅ Service Worker registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.info('🔄 New service worker available. Refresh to update.');
                  
                  // Optionally show a notification to user
                  if (confirm('A new version is available. Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.warn('❌ Service Worker registration failed:', error);
        });
    });

    // Clean up old service workers on activation
    navigator.serviceWorker.ready.then(registration => {
      console.info('✅ Service Worker ready');
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
        console.info('Service Worker unregistered');
      })
      .catch(error => {
        console.error('Error unregistering service worker:', error);
      });
  }
}
