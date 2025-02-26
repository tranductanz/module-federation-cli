import chalk from "chalk";
import { exec } from "child_process";

export const command = chalk.greenBright("bundle-module");
export const describe = chalk.cyan("✨ Bundling a module compile Repack");

export const builder = (yargs) =>
  yargs.option("platform", {
    alias: "p",
    type: "string",
    describe: chalk.greenBright("Platform to bundle for (default: ios)"),
    default: "ios",
  });

export const handler = ({ platform }) => {
  const bundleCommand = `yarn react-native webpack-bundle --platform ${platform} --webpackConfig webpack-production.config.mjs --entry-file index.js --dev=false && cd build && tar -cvf PackageBundle.tar PackageBundle`;

  console.log(
    chalk.blueBright(`🚀 Running bundle script for platform: ${platform}`)
  );

  const process = exec(bundleCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red(`❌ Error during bundling: ${error.message}`));
      return;
    }

    if (stderr) {
      console.warn(chalk.yellowBright(`⚠️ Warnings: ${stderr}`));
    }

    console.log(chalk.green(`✅ Bundling complete!`));
    console.log(stdout);
  });

  process.stdout.pipe(process.stdout);
  process.stderr.pipe(process.stderr);
};
