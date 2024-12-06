const crypto = require('crypto');
const path = require("path");
const fs = require('fs').promises;
const algorithm = 'aes-256-gcm';
require("dotenv").config();

const SECRET_SALT = process.env.SECRET_SALT;
const SECRET_PASSPHRASE = process.env.SECRET_PASSPHRASE;

const SECURE_FOLDER_PATH = "auth/secure";
const SECURE_FOLDER_ABSOLUTE_PATH = path.resolve(SECURE_FOLDER_PATH);



if (!SECRET_SALT || !SECRET_PASSPHRASE) {
    console.error("Please set the SECRET_SALT and SECRET_PASSPHRASE environment variables.");
    process.exit(1);
}

const secretKey = crypto.scryptSync(SECRET_PASSPHRASE, SECRET_SALT, 32);

async function encryptFile(inputPath, key = secretKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const input = await fs.readFile(inputPath, 'utf8');
    const out_path = `${SECURE_FOLDER_ABSOLUTE_PATH}/creds.json.secure`;

    const encrypted = Buffer.concat([cipher.update(input, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const result = {
        iv: iv.toString('hex'),
        auth_tag: authTag.toString('hex'),
        data: encrypted.toString('base64'),
    };
    await fs.writeFile(out_path, JSON.stringify(result));

    console.log(`Encrypted file written to ${out_path}!`);
}

async function decryptToString(inputPath, key = secretKey) {

    console.log(`Decrypting ${inputPath}...`);
    const encryptedData = JSON.parse(await fs.readFile(inputPath, 'utf8'));

    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(encryptedData.iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(encryptedData.auth_tag, 'hex'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.data, 'base64')),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}


module.exports = {
    encryptFile,
    decryptToString,
    SECURE_FOLDER_PATH,
    SECURE_FOLDER_ABSOLUTE_PATH
}
