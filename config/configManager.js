import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Define config storage inside `commands/config/`
const CONFIG_DIR = path.join(__dirname);
const CONFIG_FILE_PATH = path.join(CONFIG_DIR, "config.json");

// ✅ Use a fixed 32-byte encryption key & 16-byte IV (DO NOT HARD-CODE IN PRODUCTION)
const SECRET_KEY = crypto.createHash("sha256").update("my-secure-key").digest();
const IV = crypto
  .createHash("md5")
  .update("my-secure-iv")
  .digest()
  .slice(0, 16);

// 🔐 Encrypt Token
const encryptToken = (token) => {
  try {
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);
    let encrypted = cipher.update(token, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (error) {
    console.error(chalk.red("❌ Error encrypting token:", error.message));
    return null;
  }
};

// 🔓 Decrypt Token
const decryptToken = (encryptedToken) => {
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, IV);
    let decrypted = decipher.update(encryptedToken, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } catch (error) {
    console.error(chalk.red("❌ Error decrypting token. It may be corrupted."));
    return null;
  }
};

// ✅ Save Token Securely
export const saveToken = (token) => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true }); // ✅ Ensure directory exists
    }
    const encryptedToken = encryptToken(token);
    if (!encryptedToken) {
      console.error(chalk.red("❌ Failed to encrypt token."));
      return;
    }
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify({ token: encryptedToken }, null, 2),
      "utf-8"
    );
    console.log(chalk.green("✅ Token saved securely!"));
  } catch (error) {
    console.error(chalk.red("❌ Error saving token:", error.message));
  }
};

// ✅ Retrieve Token Securely
export const getToken = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      console.log(chalk.yellow("⚠️ No token file found."));
      return null;
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));
    return config.token ? decryptToken(config.token) : null;
  } catch (error) {
    console.error(chalk.red("❌ Error reading token:", error.message));
    return null;
  }
};

// ✅ Renew Token Function
export const renewToken = async () => {
  try {
    console.log(chalk.blue("🔄 Renewing token..."));

    // ✅ Handle user canceling the prompt
    const { totp, username } = await inquirer
      .prompt([
        {
          type: "input",
          name: "username",
          message: "Enter your username (BCNB user):",
          validate: (input) => input.length > 0 || "Username cannot be empty.",
        },
        {
          type: "input",
          name: "totp",
          message: "Enter your TOTP code:",
          validate: (input) => input.length === 6 || "TOTP must be 6 digits.",
        },
      ])
      .catch(() => {
        console.log(chalk.red("❌ Token renewal canceled by user."));
        return null; // ✅ Prevents process exit
      });

    if (!totp) {
      console.log(chalk.red("❌ No TOTP provided. Token renewal aborted."));
      return null;
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));
    const url = "oauth/token";
    const headers = {
      accept: "application/json, text/plain, */*",
      authorization: config.authToken,
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    };

    const body = new URLSearchParams({
      username,
      totp,
      grant_type: "password",
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      console.error(chalk.red("❌ Failed to renew token."));
      return null;
    }

    const data = await response.json();
    if (data.access_token) {
      saveToken(data.access_token);
      console.log(chalk.green("✅ Token renewed successfully!"));
      return data.access_token;
    } else {
      console.error(
        chalk.red("❌ Token renewal response did not contain an access_token.")
      );
      return null;
    }
  } catch (error) {
    console.error(chalk.red("❌ Error renewing token:", error.message));
    return null;
  }
};

// ✅ Function to Get a Valid Token (Renew If Invalid)
export const getValidToken = async () => {
  let token = getToken();

  if (token) {
    console.log(chalk.green("🔑 Using existing valid token."));
    return token;
  }

  console.log(chalk.yellow("⚠️ No valid token found. Attempting to renew..."));
  token = await renewToken();

  if (!token) {
    console.log(chalk.red("❌ Token renewal failed. Please try again."));
    return null;
  }

  return token;
};
