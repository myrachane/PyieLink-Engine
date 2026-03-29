import sys, json, urllib.request

def run(data):
    ip = data['ip']
    try:
        url = f'http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,isp,org,as,query,lat,lon,timezone'
        req = urllib.request.Request(url, headers={'User-Agent': 'PyieLink/1.0'})
        with urllib.request.urlopen(req, timeout=8) as r:
            result = json.loads(r.read().decode())
        if result.get('status') == 'fail':
            return {'status': 'error', 'error': result.get('message', 'Lookup failed')}
        return {'status': 'ok', 'ip': ip, 'info': result}
    except Exception as e:
        return {'status': 'error', 'ip': ip, 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
