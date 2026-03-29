import sys, json, socket

def run(data):
    target  = data['target']
    ports   = data.get('ports', '1-1024')
    timeout = float(data.get('timeout', 2))

    if '-' in str(ports):
        start, end = ports.split('-')
        port_list = range(int(start), int(end) + 1)
    else:
        port_list = [int(p.strip()) for p in str(ports).split(',')]

    open_ports = []
    for port in port_list:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(timeout)
            result = s.connect_ex((target, port))
            if result == 0:
                try:
                    service = socket.getservbyport(port)
                except:
                    service = 'unknown'
                open_ports.append({'port': port, 'service': service})
            s.close()
        except:
            pass

    return {'status': 'ok', 'target': target, 'open_ports': open_ports, 'scanned': len(list(port_list))}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
