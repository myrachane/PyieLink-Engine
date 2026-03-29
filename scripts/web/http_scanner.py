import sys, json
try:
    import urllib.request as req
    import urllib.error
except:
    pass

def run(data):
    url     = data['url']
    timeout = int(data.get('timeout', 5))
    if not url.startswith('http'):
        url = 'http://' + url
    try:
        request = req.Request(url, headers={'User-Agent': 'PyieLink/1.0'})
        with req.urlopen(request, timeout=timeout) as r:
            headers = dict(r.getheaders())
            status  = r.status
            body_preview = r.read(512).decode('utf-8', errors='replace')
        return {
            'status': 'ok', 'url': url, 'http_status': status,
            'headers': headers, 'body_preview': body_preview
        }
    except urllib.error.HTTPError as e:
        return {'status': 'ok', 'url': url, 'http_status': e.code, 'headers': dict(e.headers), 'body_preview': ''}
    except Exception as e:
        return {'status': 'error', 'url': url, 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
