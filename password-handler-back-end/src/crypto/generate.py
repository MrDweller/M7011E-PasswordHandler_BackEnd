from Crypto.Random import get_random_bytes
from base64 import b64encode

def get_password(length):
    return b64encode(get_random_bytes(length))
