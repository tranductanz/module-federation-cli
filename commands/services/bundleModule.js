import chalk from "chalk";
import { exec } from "child_process";

export const command = "bundle-module"; // Keep command name as a plain string for proper Yargs execution
export const describe = chalk.cyan("✨ Bundling a module compile Repack");

export const builder = (yargs) =>
  yargs.option("platform", {
    alias: "p",
    type: "string",
    describe: chalk.greenBright("Platform to bundle for (default: ios)"),
    default: "ios",
  });

export const handler = ({ platform }) => {
  const bundleCommand = `yarn && yarn react-native webpack-bundle --platform ${platform} --webpackConfig webpack-production.config.mjs --entry-file index.js --dev=false && cd build && tar -cvf PackageBundle.tar PackageBundle`;

  console.log(
    chalk.blueBright(`🚀🚀🚀 Running bundle script for compiling Module`)
  );

  const childProcess = exec(bundleCommand);

  childProcess.stdout.on("data", (data) => {
    process.stdout.write(chalk.greenBright(data));
  });

  childProcess.stderr.on("data", (data) => {
    process.stderr.write(chalk.redBright(data));
  });

  childProcess.on("close", (code) => {
    if (code === 0) {
      console.log(chalk.green(`✅ Bundling complete!`));
    } else {
      console.error(chalk.red(`❌ Bundling process exited with code: ${code}`));
    }
  });
};
