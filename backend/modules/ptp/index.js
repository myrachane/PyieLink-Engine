module.exports = {
  id: 'ptp',
  name: 'PTP',
  icon: 'zap',
  tools: [
    {
      id: 'chunk_protocol',
      name: 'PyieLink Transfer Protocol',
      script: 'scripts/ptp/chunk_protocol.py',
      schema: {
        action:     { type: 'string', required: true,  label: 'Action (chunk/reassemble/simulate)' },
        data_b64:   { type: 'string', required: false, label: 'Base64 file data' },
        chunks:     { type: 'string', required: false, label: 'Chunks JSON (for reassemble)' },
        key_hex:    { type: 'string', required: false, label: 'AES key (hex, 32 bytes)' },
        chunk_size: { type: 'number', required: false, label: 'Chunk size (bytes)', default: 1024 },
        randomize:  { type: 'boolean', required: false, label: 'Randomize order', default: true }
      }
    }
  ]
}
