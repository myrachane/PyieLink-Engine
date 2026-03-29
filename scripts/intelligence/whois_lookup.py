import sys, json, socket

def run(data):
    target = data['target']
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(10)
        s.connect(('whois.iana.org', 43))
        s.sendall((target + '\r\n').encode())
        resp = b''
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            resp += chunk
        s.close()
        raw = resp.decode('utf-8', errors='replace')
        parsed = {}
        for line in raw.splitlines():
            if ':' in line and not line.startswith('%'):
                key, _, val = line.partition(':')
                key = key.strip().lower().replace(' ', '_')
                val = val.strip()
                if key and val and key not in parsed:
                    parsed[key] = val
        return {'status': 'ok', 'target': target, 'parsed': parsed, 'raw': raw[:2000]}
    except Exception as e:
        return {'status': 'error', 'target': target, 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
