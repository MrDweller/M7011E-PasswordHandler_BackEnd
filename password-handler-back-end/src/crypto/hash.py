import hashlib, uuid

def hash_password(plaintext):
    salt = uuid.uuid4().hex
    ps = plaintext + salt
    hashed_password = hashlib.sha256(ps.encode()).hexdigest()[:32]
    return (hashed_password, salt)