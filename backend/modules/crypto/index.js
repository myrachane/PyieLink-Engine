module.exports = {
  id: 'crypto',
  name: 'Crypto',
  icon: 'lock',
  tools: [
    {
      id: 'aes_encryptor',
      name: 'AES Encryptor',
      script: 'scripts/crypto/aes_encryptor.py',
      schema: {
        action:  { type: 'string', required: true,  label: 'Action (encrypt/decrypt)' },
        data:    { type: 'string', required: true,  label: 'Data (plaintext or base64)' },
        key:     { type: 'string', required: true,  label: 'Key (hex, 32 bytes)' },
        mode:    { type: 'string', required: false, label: 'Mode (gcm/cbc)', default: 'gcm' }
      }
    },
    {
      id: 'hashing_tool',
      name: 'Hashing Tool',
      script: 'scripts/crypto/hashing_tool.py',
      schema: {
        data:      { type: 'string', required: true,  label: 'Input data' },
        algorithm: { type: 'string', required: false, label: 'Algorithm', default: 'sha256' }
      }
    }
  ]
}
