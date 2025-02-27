import chalk from "chalk";
import { exec } from "child_process";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { getValidToken } from "../../config/configManager.js"; // ✅ Secure token retrieval

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createRequire } from "module";

// Create a require function relative to the current working directory
const require = createRequire(path.join(process.cwd(), "package.json"));

export const command = "upload-module";
export const describe = chalk.cyan(
  "🚀🚀🚀 Upload a bundled module to the server"
);

export const builder = (yargs) =>
  yargs
    .option("appName", {
      alias: "a",
      type: "string",
      describe: "Name of the application",
      demandOption: false,
    })
    .option("moduleName", {
      alias: "m",
      type: "string",
      describe: "Name of the module",
      demandOption: false,
    })
    .option("versionMain", {
      alias: "v",
      type: "string",
      describe: "Main version of the app",
      demandOption: false,
    })
    .option("featureName", {
      alias: "f",
      type: "string",
      describe: "Feature name",
      demandOption: false,
    })
    .option("platform", {
      alias: "p",
      type: "string",
      describe: "Platform (e.g., IOS, ANDROID)",
      default: "IOS",
    });

export const handler = async () => {
  const filePath = path.join(process.cwd(), "build", "PackageBundle.tar");

  const { confirmUpload } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmUpload",
      message: `Are you sure you want to upload ${chalk.yellowBright(
        filePath
      )} to the server?`,
      default: true,
    },
  ]);

  if (!confirmUpload) {
    console.log(chalk.red("❌ Upload canceled."));
    return;
  }

  // ✅ Get a valid token (automatically renews if invalid)
  const token = await getValidToken();
  if (!token) {
    console.error(
      chalk.red("❌ Unable to obtain a valid token. Upload aborted.")
    );
    return;
  }

  const platform = "IOS";
  const {
    version,
    appName,
    moduleName,
    featureName,
    "version-live": versionLive,
  } = require(path.join(process.cwd(), "package.json"));

  const versionModule = "1.0.0";

  const curlCommand = `curl --location --request POST '' \
    --header 'accept: */*' \
    --header 'authorization: Bearer ${token}' \
    --header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' \
    --form 'file=@"${filePath}"' \
    --form 'appName="${appName}"' \
    --form 'versionModule="${versionModule}"' \
    --form 'versionMain="${version}"' \
    --form 'platform="${platform}"' \
    --form 'moduleName="${moduleName}"' \
    --form 'featureName="${featureName}"' \
    --form 'fileType="br"'`;

  console.log(chalk.blueBright("🚀 Uploading module....."));

  const uploadProcess = exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red(`❌ Upload failed: ${error.message}`));
      return;
    }

    if (stderr) {
      console.warn(chalk.yellowBright(`⚠️ ${stderr}`));
    }

    console.log(chalk.green(`✅ Upload successful!`));
    console.log(stdout);
  });

  uploadProcess.stdout.pipe(process.stdout);
  uploadProcess.stderr.pipe(process.stderr);
};
