import sys, json, socket, struct

def checksum(data):
    s = 0
    for i in range(0, len(data) - 1, 2):
        s += (data[i] << 8) + data[i+1]
    if len(data) % 2:
        s += data[-1] << 8
    s = (s >> 16) + (s & 0xFFFF)
    return ~s & 0xFFFF

def run(data):
    target   = data['target']
    port     = int(data['port'])
    protocol = data.get('protocol', 'tcp').lower()
    payload  = bytes.fromhex(data.get('payload', '')) if data.get('payload') else b'PyieLink'

    try:
        if protocol == 'udp':
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(3)
            s.sendto(payload, (target, port))
            s.close()
            return {'status': 'ok', 'target': target, 'port': port, 'protocol': 'udp', 'sent': len(payload)}

        elif protocol == 'tcp':
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(3)
            s.connect((target, port))
            s.sendall(payload)
            resp = s.recv(256)
            s.close()
            return {'status': 'ok', 'target': target, 'port': port, 'protocol': 'tcp',
                    'sent': len(payload), 'response': resp.hex()}

        elif protocol == 'icmp':
            s = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
            header = struct.pack('bbHHh', 8, 0, 0, 1, 1)
            chk    = checksum(header + payload)
            header = struct.pack('bbHHh', 8, 0, chk, 1, 1)
            s.sendto(header + payload, (target, 1))
            s.close()
            return {'status': 'ok', 'target': target, 'protocol': 'icmp', 'sent': len(payload)}

        return {'status': 'error', 'error': f'Unknown protocol: {protocol}'}
    except PermissionError:
        return {'status': 'error', 'error': 'Root/admin privileges required for raw sockets'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
