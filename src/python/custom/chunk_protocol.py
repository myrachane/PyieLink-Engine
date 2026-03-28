import hashlib
import json
import random
import sys
from typing import Any


def xor_encrypt(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))


def main() -> None:
    raw = sys.stdin.read().strip() or "{}"
    payload: dict[str, Any] = json.loads(raw)

    message = str(payload.get("message", "PyieLink-Chunk-Protocol")).encode("utf-8")
    chunk_size = max(1, int(payload.get("chunk_size", 6)))
    key_seed = str(payload.get("key", "pyielink-default-key"))
    key = hashlib.sha256(key_seed.encode("utf-8")).digest()

    chunks = [message[i : i + chunk_size] for i in range(0, len(message), chunk_size)]

    encrypted_chunks = [xor_encrypt(chunk, key) for chunk in chunks]

    random_indices = list(range(len(encrypted_chunks)))
    random.shuffle(random_indices)
    randomized_packet = [(idx, encrypted_chunks[idx].hex()) for idx in random_indices]

    received = {idx: bytes.fromhex(data_hex) for idx, data_hex in randomized_packet}
    ordered_encrypted = [received[idx] for idx in range(len(chunks))]
    reassembled = b"".join(xor_encrypt(chunk, key) for chunk in ordered_encrypted)

    source_hash = hashlib.sha256(message).hexdigest()
    output_hash = hashlib.sha256(reassembled).hexdigest()

    response = {
        "ok": True,
        "module": "chunk_protocol",
        "pipeline": [
            "chunk",
            "aes_encrypt(simulated)",
            "randomize",
            "send/simulate",
            "reassemble",
            "verify",
        ],
        "chunks_total": len(chunks),
        "verification": source_hash == output_hash,
        "source_hash": source_hash,
        "output_hash": output_hash,
        "preview": reassembled.decode("utf-8", errors="replace"),
    }

    sys.stdout.write(json.dumps(response))


if __name__ == "__main__":
    main()
