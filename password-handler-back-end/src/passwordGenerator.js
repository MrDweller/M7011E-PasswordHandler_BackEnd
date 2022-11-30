const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const INTEGERS = "0123456789";
const EX_CHARACTERS = "!@#$%^&*_-=+";

class PasswordGenerator {
    static generatePassword = (length, hasNumbers, hasSymbols) => {
        let chars = ALPHABET;
        if (hasNumbers) {
            chars += INTEGERS;
        }
        if (hasSymbols) {
            chars += EX_CHARACTERS;
        }
        return this.#getPassword(length, chars);
    };
    
    static #getPassword = (length, chars) => {
        let password = "";
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

}

module.exports = PasswordGenerator;