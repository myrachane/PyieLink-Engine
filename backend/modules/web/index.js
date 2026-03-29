module.exports = {
  id: 'web',
  name: 'Web',
  icon: 'globe',
  tools: [
    {
      id: 'http_scanner',
      name: 'HTTP Scanner',
      script: 'scripts/web/http_scanner.py',
      schema: {
        url:     { type: 'string', required: true,  label: 'Target URL' },
        timeout: { type: 'number', required: false, label: 'Timeout (s)', default: 5 }
      }
    },
    {
      id: 'dir_bruteforce',
      name: 'Dir Bruteforce',
      script: 'scripts/web/dir_bruteforce.py',
      schema: {
        url:        { type: 'string', required: true,  label: 'Base URL' },
        wordlist:   { type: 'string', required: false, label: 'Wordlist (comma-sep)', default: 'admin,login,api,backup,config,uploads,static' },
        timeout:    { type: 'number', required: false, label: 'Timeout (s)', default: 3 }
      }
    },
    {
      id: 'cors_checker',
      name: 'CORS Checker',
      script: 'scripts/web/cors_checker.py',
      schema: {
        url:    { type: 'string', required: true, label: 'Target URL' },
        origin: { type: 'string', required: false, label: 'Test origin', default: 'https://evil.com' }
      }
    }
  ]
}
