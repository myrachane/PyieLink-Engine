import sys, json, socket

RECORD_TYPES = ['A', 'MX', 'NS', 'TXT', 'CNAME']

def run(data):
    domain      = data['domain']
    record_type = data.get('record_type', 'ALL').upper()
    results     = {}

    types_to_check = RECORD_TYPES if record_type == 'ALL' else [record_type]

    for rtype in types_to_check:
        try:
            if rtype == 'A':
                info = socket.getaddrinfo(domain, None, socket.AF_INET)
                results['A'] = list(set(r[4][0] for r in info))
            elif rtype == 'MX':
                import subprocess
                out = subprocess.check_output(['nslookup', '-type=MX', domain], timeout=5, stderr=subprocess.DEVNULL)
                results['MX'] = [l.decode() for l in out.splitlines() if b'mail exchanger' in l.lower()]
            else:
                results[rtype] = []
        except Exception as e:
            results[rtype] = {'error': str(e)}

    return {'status': 'ok', 'domain': domain, 'records': results}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
