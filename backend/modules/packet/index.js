module.exports = {
  id: 'packet',
  name: 'Packet',
  icon: 'layers',
  tools: [
    {
      id: 'packet_sniffer',
      name: 'Packet Sniffer',
      script: 'scripts/packet/packet_sniffer.py',
      schema: {
        interface: { type: 'string', required: false, label: 'Interface', default: 'eth0' },
        count:     { type: 'number', required: false, label: 'Packet count', default: 10 },
        filter:    { type: 'string', required: false, label: 'BPF filter', default: '' }
      }
    },
    {
      id: 'packet_crafter',
      name: 'Packet Crafter',
      script: 'scripts/packet/packet_crafter.py',
      schema: {
        target:   { type: 'string', required: true,  label: 'Target IP' },
        port:     { type: 'number', required: true,  label: 'Target port' },
        protocol: { type: 'string', required: false, label: 'Protocol (tcp/udp/icmp)', default: 'tcp' },
        payload:  { type: 'string', required: false, label: 'Payload (hex)', default: '' }
      }
    }
  ]
}
