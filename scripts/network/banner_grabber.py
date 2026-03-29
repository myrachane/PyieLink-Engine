import sys, json, socket

def run(data):
    target  = data['target']
    port    = int(data['port'])
    timeout = float(data.get('timeout', 3))

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((target, port))
        s.sendall(b'HEAD / HTTP/1.0\r\n\r\n')
        banner = s.recv(1024).decode('utf-8', errors='replace').strip()
        s.close()
        return {'status': 'ok', 'target': target, 'port': port, 'banner': banner}
    except Exception as e:
        return {'status': 'error', 'target': target, 'port': port, 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
