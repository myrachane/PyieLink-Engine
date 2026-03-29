module.exports = {
  id: 'intelligence',
  name: 'Intelligence',
  icon: 'search',
  tools: [
    {
      id: 'whois_lookup',
      name: 'Whois Lookup',
      script: 'scripts/intelligence/whois_lookup.py',
      schema: {
        target: { type: 'string', required: true, label: 'Domain or IP' }
      }
    },
    {
      id: 'ip_info',
      name: 'IP Info',
      script: 'scripts/intelligence/ip_info.py',
      schema: {
        ip: { type: 'string', required: true, label: 'IP address' }
      }
    }
  ]
}
