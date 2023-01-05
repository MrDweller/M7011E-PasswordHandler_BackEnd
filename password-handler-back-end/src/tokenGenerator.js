const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const INTEGERS = "0123456789";


class TokenGenerator {
    static generateToken = (length, hasNumbers) => {
        let chars = ALPHABET;
        if (hasNumbers) {
            chars += INTEGERS;
        }
       
        return this.#getToken(length, chars);
    };
    
    static #getToken = (length, chars) => {
        let token = "";
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    };

}

module.exports = TokenGenerator;