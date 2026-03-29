import sys, json, os, base64, hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

def run(data):
    action = data['action'].lower()
    key_hex = data['key']
    mode = data.get('mode', 'gcm').lower()

    try:
        key = bytes.fromhex(key_hex)
        if len(key) not in (16, 24, 32):
            return {'status': 'error', 'error': 'Key must be 16, 24, or 32 bytes (hex)'}

        if action == 'encrypt':
            plaintext = data['data'].encode()
            if mode == 'gcm':
                nonce = os.urandom(12)
                aesgcm = AESGCM(key)
                ct = aesgcm.encrypt(nonce, plaintext, None)
                result = base64.b64encode(nonce + ct).decode()
                return {'status': 'ok', 'action': 'encrypt', 'mode': 'gcm', 'result': result}
            else:
                iv = os.urandom(16)
                padded = plaintext + b'\x00' * (16 - len(plaintext) % 16)
                cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
                enc = cipher.encryptor()
                ct = enc.update(padded) + enc.finalize()
                result = base64.b64encode(iv + ct).decode()
                return {'status': 'ok', 'action': 'encrypt', 'mode': 'cbc', 'result': result}

        elif action == 'decrypt':
            raw = base64.b64decode(data['data'])
            if mode == 'gcm':
                nonce, ct = raw[:12], raw[12:]
                aesgcm = AESGCM(key)
                plaintext = aesgcm.decrypt(nonce, ct, None).decode()
                return {'status': 'ok', 'action': 'decrypt', 'mode': 'gcm', 'result': plaintext}
            else:
                iv, ct = raw[:16], raw[16:]
                cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
                dec = cipher.decryptor()
                plaintext = (dec.update(ct) + dec.finalize()).rstrip(b'\x00').decode()
                return {'status': 'ok', 'action': 'decrypt', 'mode': 'cbc', 'result': plaintext}

        return {'status': 'error', 'error': 'action must be encrypt or decrypt'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
