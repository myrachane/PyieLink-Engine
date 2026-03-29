import sys, json, os, base64, hashlib, random, struct

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

def chunk_data(raw_bytes, chunk_size):
    return [raw_bytes[i:i+chunk_size] for i in range(0, len(raw_bytes), chunk_size)]

def encrypt_chunk(data, key):
    if not HAS_CRYPTO:
        return base64.b64encode(data).decode(), None
    nonce  = os.urandom(12)
    aesgcm = AESGCM(key)
    ct     = aesgcm.encrypt(nonce, data, None)
    return base64.b64encode(nonce + ct).decode(), nonce.hex()

def decrypt_chunk(b64_data, key):
    if not HAS_CRYPTO:
        return base64.b64decode(b64_data)
    raw    = base64.b64decode(b64_data)
    nonce  = raw[:12]
    ct     = raw[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ct, None)

def run(data):
    action = data.get('action', 'chunk').lower()
    key_hex = data.get('key_hex', '')

    key = None
    if key_hex and HAS_CRYPTO:
        try:
            key = bytes.fromhex(key_hex)
            if len(key) not in (16, 24, 32):
                return {'status': 'error', 'error': 'Key must be 16/24/32 bytes hex'}
        except:
            return {'status': 'error', 'error': 'Invalid key hex'}

    if action == 'chunk':
        raw_b64    = data.get('data_b64', '')
        chunk_size = int(data.get('chunk_size', 1024))
        randomize  = data.get('randomize', True)

        raw_bytes  = base64.b64decode(raw_b64)
        total_hash = hashlib.sha256(raw_bytes).hexdigest()
        chunks     = chunk_data(raw_bytes, chunk_size)
        total      = len(chunks)
        result     = []

        for i, chunk in enumerate(chunks):
            enc_data, _ = encrypt_chunk(chunk, key) if key else (base64.b64encode(chunk).decode(), None)
            result.append({
                'seq':   i,
                'total': total,
                'size':  len(chunk),
                'data':  enc_data,
                'hash':  hashlib.sha256(chunk).hexdigest()
            })

        if randomize:
            random.shuffle(result)

        dummy_count = max(1, total // 5)
        for _ in range(dummy_count):
            dummy_data = os.urandom(chunk_size // 2)
            enc_dummy, _ = encrypt_chunk(dummy_data, key) if key else (base64.b64encode(dummy_data).decode(), None)
            result.insert(random.randint(0, len(result)), {
                'seq': -1, 'total': total, 'size': len(dummy_data),
                'data': enc_dummy, 'hash': 'dummy', 'dummy': True
            })

        return {
            'status':      'ok',
            'action':      'chunk',
            'original_hash': total_hash,
            'total_chunks': total,
            'dummy_chunks': dummy_count,
            'encrypted':   bool(key),
            'chunks':      result
        }

    elif action == 'reassemble':
        chunks_raw = data.get('chunks', [])
        orig_hash  = data.get('original_hash', '')

        real_chunks = [c for c in chunks_raw if not c.get('dummy')]
        real_chunks.sort(key=lambda c: c['seq'])

        reassembled = b''
        for chunk in real_chunks:
            if key:
                part = decrypt_chunk(chunk['data'], key)
            else:
                part = base64.b64decode(chunk['data'])
            reassembled += part

        result_hash = hashlib.sha256(reassembled).hexdigest()
        verified    = result_hash == orig_hash if orig_hash else None

        return {
            'status':    'ok',
            'action':    'reassemble',
            'verified':  verified,
            'hash_match': verified,
            'result_hash': result_hash,
            'data_b64':  base64.b64encode(reassembled).decode(),
            'size':      len(reassembled)
        }

    elif action == 'simulate':
        raw_b64    = data.get('data_b64', '')
        chunk_size = int(data.get('chunk_size', 512))
        raw_bytes  = base64.b64decode(raw_b64)
        chunks     = chunk_data(raw_bytes, chunk_size)
        log        = []

        for i, chunk in enumerate(chunks):
            drop = random.random() < 0.05
            delay_ms = random.randint(1, 50)
            log.append({'seq': i, 'size': len(chunk), 'dropped': drop, 'delay_ms': delay_ms})

        dropped = sum(1 for e in log if e['dropped'])
        return {
            'status': 'ok', 'action': 'simulate',
            'total': len(chunks), 'dropped': dropped,
            'delivery_rate': round((len(chunks) - dropped) / len(chunks) * 100, 1),
            'log': log
        }

    return {'status': 'error', 'error': f'Unknown action: {action}'}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
