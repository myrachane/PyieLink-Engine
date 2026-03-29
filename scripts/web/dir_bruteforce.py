import sys, json, urllib.request, urllib.error

def run(data):
    base_url = data['url'].rstrip('/')
    wordlist  = [w.strip() for w in data.get('wordlist', 'admin,login,api,backup,config').split(',')]
    timeout   = int(data.get('timeout', 3))
    found     = []

    for word in wordlist:
        url = f'{base_url}/{word}'
        try:
            r = urllib.request.urlopen(
                urllib.request.Request(url, headers={'User-Agent': 'PyieLink/1.0'}),
                timeout=timeout
            )
            found.append({'path': f'/{word}', 'status': r.status})
        except urllib.error.HTTPError as e:
            if e.code not in (404, 403):
                found.append({'path': f'/{word}', 'status': e.code})
        except:
            pass

    return {'status': 'ok', 'base_url': base_url, 'found': found, 'checked': len(wordlist)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
