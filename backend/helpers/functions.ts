import crypto from 'crypto-browserify';
const { vars } = require("hardhat/config");

// Code from https://dev.to/vapourisation/east-encryption-in-typescript-3948

function splitEncryptedText(encryptedText: string) {
  return {
    ivString: encryptedText.slice(0, 32),
    encryptedDataString: encryptedText.slice(32),
  }
}

// encryption and decryption
export default class Security {
  encoding: BufferEncoding = 'hex';

  key: string = vars.get("CRYPTO_KEY");

  encrypt(plaintext: string) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);

      const encrypted = Buffer.concat([
        cipher.update(
          plaintext, 'utf-8'
        ),
        cipher.final(),
      ]);

      return iv.toString(this.encoding) + encrypted.toString(this.encoding);
    } catch (e) {
      console.error(e);
    }
  };

  decrypt(cipherText: string) {
    const {
      encryptedDataString,
      ivString,
    } = splitEncryptedText(cipherText);

    try {
      const iv = Buffer.from(ivString, this.encoding);
      const encryptedText = Buffer.from(encryptedDataString, this.encoding);

      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);

      const decrypted = decipher.update(encryptedText);
      return Buffer.concat([decrypted, decipher.final()]).toString();
    } catch (e) {
      console.error(e);
    }
  }
}