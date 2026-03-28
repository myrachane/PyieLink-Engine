import path from 'node:path';

const py = (...parts) => path.resolve('src/python', ...parts);

export const moduleRegistry = {
  port_scanner: { category: 'network', scriptPath: py('network', 'port_scanner.py') },
  banner_grabber: { category: 'network', scriptPath: py('network', 'banner_grabber.py') },
  dns_enum: { category: 'network', scriptPath: py('network', 'dns_enum.py') },

  http_scanner: { category: 'web', scriptPath: py('web', 'http_scanner.py') },
  dir_bruteforce: { category: 'web', scriptPath: py('web', 'dir_bruteforce.py') },
  cors_checker: { category: 'web', scriptPath: py('web', 'cors_checker.py') },

  packet_sniffer: { category: 'packet', scriptPath: py('packet', 'packet_sniffer.py') },
  packet_crafter: { category: 'packet', scriptPath: py('packet', 'packet_crafter.py') },

  whois_lookup: { category: 'intelligence', scriptPath: py('intelligence', 'whois_lookup.py') },
  ip_info: { category: 'intelligence', scriptPath: py('intelligence', 'ip_info.py') },

  aes_encryptor: { category: 'crypto', scriptPath: py('crypto', 'aes_encryptor.py') },
  hashing_tool: { category: 'crypto', scriptPath: py('crypto', 'hashing_tool.py') },

  header_analyzer: { category: 'vulnerability', scriptPath: py('vulnerability', 'header_analyzer.py') },
  port_risk_analyzer: { category: 'vulnerability', scriptPath: py('vulnerability', 'port_risk_analyzer.py') },

  chunk_protocol: { category: 'custom', scriptPath: py('custom', 'chunk_protocol.py') },
};

export function getModuleConfig(moduleName) {
  return moduleRegistry[moduleName] ?? null;
}
