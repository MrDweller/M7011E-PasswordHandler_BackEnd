import hashlib, uuid

def hash_password(plaintext):
    salt = uuid.uuid4().hex
    plaintext_and_salt = plaintext + salt
    hashed_password = hashlib.sha256(plaintext_and_salt.encode()).hexdigest()[:32]
    return (hashed_password, salt)

def hash_password_salt(plaintext, salt):
    plaintext_and_salt = plaintext + salt
    hashed_password = hashlib.sha256(plaintext_and_salt.encode()).hexdigest()[:32]
    return hashed_password