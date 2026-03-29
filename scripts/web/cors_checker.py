import sys, json, urllib.request

def run(data):
    url    = data['url']
    origin = data.get('origin', 'https://evil.com')
    if not url.startswith('http'):
        url = 'http://' + url
    try:
        request = urllib.request.Request(url, headers={
            'Origin': origin, 'User-Agent': 'PyieLink/1.0'
        })
        with urllib.request.urlopen(request, timeout=5) as r:
            headers = dict(r.getheaders())
    except urllib.error.HTTPError as e:
        headers = dict(e.headers)
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

    acao  = headers.get('Access-Control-Allow-Origin', None)
    acac  = headers.get('Access-Control-Allow-Credentials', None)
    issues = []
    if acao == '*':
        issues.append('Wildcard origin allowed (*)')
    if acao == origin:
        issues.append(f'Reflects arbitrary origin: {origin}')
    if acac and acac.lower() == 'true' and acao != '*':
        issues.append('Credentials allowed with reflected origin')

    return {
        'status': 'ok', 'url': url,
        'cors_headers': {k: v for k, v in headers.items() if 'access-control' in k.lower()},
        'issues': issues,
        'vulnerable': len(issues) > 0
    }

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
