module.exports = {
  id: 'network',
  name: 'Network',
  icon: 'radar',
  tools: [
    {
      id: 'port_scanner',
      name: 'Port Scanner',
      script: 'scripts/network/port_scanner.py',
      schema: {
        target:  { type: 'string', required: true,  label: 'Target host' },
        ports:   { type: 'string', required: false, label: 'Port range', default: '1-1024' },
        timeout: { type: 'number', required: false, label: 'Timeout (s)', default: 2 }
      }
    },
    {
      id: 'banner_grabber',
      name: 'Banner Grabber',
      script: 'scripts/network/banner_grabber.py',
      schema: {
        target:  { type: 'string', required: true,  label: 'Target host' },
        port:    { type: 'number', required: true,  label: 'Port' },
        timeout: { type: 'number', required: false, label: 'Timeout (s)', default: 3 }
      }
    },
    {
      id: 'dns_enum',
      name: 'DNS Enum',
      script: 'scripts/network/dns_enum.py',
      schema: {
        domain:      { type: 'string', required: true,  label: 'Domain' },
        record_type: { type: 'string', required: false, label: 'Record type', default: 'ALL' }
      }
    }
  ]
}
