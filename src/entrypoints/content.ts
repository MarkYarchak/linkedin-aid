export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  runAt: 'document_idle',
  main() {
    console.log('Hello content!')
  },
});
