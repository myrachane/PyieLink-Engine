import sys, json, hashlib

ALGORITHMS = ['md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'sha3_256', 'sha3_512', 'blake2b', 'blake2s']

def run(data):
    text      = data['data']
    algorithm = data.get('algorithm', 'sha256').lower().replace('-', '_')

    if algorithm not in ALGORITHMS:
        return {'status': 'error', 'error': f'Unsupported algorithm. Choose from: {", ".join(ALGORITHMS)}'}

    try:
        raw     = text.encode('utf-8')
        h       = hashlib.new(algorithm, raw)
        digest  = h.hexdigest()
        results = {}
        if data.get('algorithm', 'sha256').upper() == 'ALL':
            for alg in ALGORITHMS:
                results[alg] = hashlib.new(alg, raw).hexdigest()
            return {'status': 'ok', 'input_len': len(raw), 'results': results}
        return {'status': 'ok', 'algorithm': algorithm, 'hash': digest, 'input_len': len(raw)}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
