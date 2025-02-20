#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import createNewModule from "../commands/createNewModule.js";
import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";
import pkg from "../package.json" assert { type: "json" };
const { version } = pkg;

// Clear console for clean output
clear();

// CLI Banner
console.log(
  chalk.yellow(
    figlet.textSync("MWG Module CLI", {
      font: "Small",
      horizontalLayout: "fitted",
      width: 80,
    })
  )
);

// Yargs configuration
yargs(hideBin(process.argv))
  .usage(chalk.cyan("\nUsage: mwg-module <command> [options]"))
  .command(
    "create-new-module [name]",
    chalk.cyan("Init a new module with a template (interactive selection)"),
    (yargs) => {
      yargs
        .positional("name", {
          describe: chalk.green("Name of the module (used in placeholders)"),
          type: "string",
          default: "NewModule",
        })
        .option("force", {
          alias: "f",
          type: "boolean",
          describe: chalk.green("Overwrite existing files without prompt"),
          default: false,
        });
    },
    async (argv) => {
      await createNewModule(argv.name, argv.force);
    }
  )
  .options({
    version: {
      alias: "v",
      describe: chalk.green("Show version number"),
      type: "boolean",
    },
    help: {
      alias: "h",
      describe: chalk.green("Show help"),
      type: "boolean",
    },
  })
  .demandCommand(1, chalk.red("❌ Please provide a valid command."))

  .showHelpOnFail(
    true,
    `${chalk.cyan("💡💡 You currently using")} ${chalk.red(
      `${version}`
    )} ${chalk.cyan("CLI")}`
  )
  .help("help")
  .alias("help", "h")
  .alias("version", "v")
  .epilog(
    chalk.gray(
      "\nFor more information, visit: https://github.com/tranductanz/module-federation-cli"
    )
  ).argv;
