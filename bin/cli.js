#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import createNewModule from "../commands/createNewModule.js";

import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";

// Clear console for a clean output
clear();

// CLI Banner
console.log(
  chalk.yellow(
    figlet.textSync("MWG Module CLI", {
      font: "Small",
      horizontalLayout: "fitted",
      verticalLayout: "default",
      width: 80,
    })
  )
);

// Yargs setup
yargs(hideBin(process.argv))
  .command(
    "create-new-module", // Add [name] to the command string
    chalk.cyan("Init 1 module mới với template có sẵn"), // Command description
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
    (argv) => createNewModule(argv.name, argv.force)
  )
  .demandCommand(1, chalk.green("✅✅✅ Snippets Module -----")) // Ensure help shows commands
  .strict() // Show error on invalid commands
  .help()
  .alias("h", "help").argv;
