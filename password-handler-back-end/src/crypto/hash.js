const crypto = require('crypto');

class HashFunction {
    static hashPlainText(plainText, salt) {
        let hash = crypto.scryptSync(plainText, salt, 32);
        return hash
    }

    static generateSalt() {
        return crypto.randomBytes(32);
    }

}

module.exports = HashFunction;