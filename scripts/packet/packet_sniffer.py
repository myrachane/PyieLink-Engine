import sys, json, socket, struct, time

def parse_ip(raw):
    return '.'.join(map(str, raw))

def run(data):
    iface   = data.get('interface', 'eth0')
    count   = int(data.get('count', 10))
    bpf     = data.get('filter', '')
    packets = []

    try:
        s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003))
        s.settimeout(10)
        for _ in range(count):
            try:
                raw, addr = s.recvfrom(65535)
                eth_proto = struct.unpack('!H', raw[12:14])[0]
                pkt = {'len': len(raw), 'proto': hex(eth_proto), 'time': time.time()}
                if eth_proto == 0x0800 and len(raw) >= 34:
                    ip = raw[14:]
                    proto_num = ip[9]
                    src = parse_ip(ip[12:16])
                    dst = parse_ip(ip[16:20])
                    pkt.update({'src': src, 'dst': dst, 'ip_proto': proto_num})
                    if proto_num in (6, 17) and len(ip) >= 24:
                        sport = struct.unpack('!H', ip[20:22])[0]
                        dport = struct.unpack('!H', ip[22:24])[0]
                        pkt.update({'sport': sport, 'dport': dport})
                packets.append(pkt)
            except socket.timeout:
                break
        s.close()
    except PermissionError:
        return {'status': 'error', 'error': 'Root/admin privileges required for packet capture'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

    return {'status': 'ok', 'interface': iface, 'captured': len(packets), 'packets': packets}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
