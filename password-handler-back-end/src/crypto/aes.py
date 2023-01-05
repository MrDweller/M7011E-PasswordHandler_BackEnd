from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

def encrypt_data(decryptedData, key, iv):
    cipher = AES.new(key, AES.MODE_EAX, iv)
    encrypted_data = cipher.encrypt(decryptedData)
    return encrypted_data

def decrypt_data(encryptedData, key, iv):
    decipher = AES.new(key, AES.MODE_EAX, iv)
    decrypted_data = decipher.decrypt(encryptedData)
    return decrypted_data

def generate_key():
    return get_random_bytes(32)

def generate_iv():
    return get_random_bytes(16)


