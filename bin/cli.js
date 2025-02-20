#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import createNewModule from "../commands/createNewModule.js";

import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";

// Clear console
clear();

// CLI Banner
console.log(
  chalk.yellow(
    figlet.textSync("MWG Module CLI", {
      font: "Small", // Try "Mini" or "Calvin S" for even smaller fonts
      horizontalLayout: "fitted",
      verticalLayout: "default",
      width: 80, // Adjust width if needed
    })
  )
);

yargs(hideBin(process.argv))
  .command(
    "create-new-module",
    chalk.cyan("Init 1 module mới với template có sẵn"),
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
  //   .demandCommand(1, chalk.red("❌ Please provide a valid command."))
  .help().argv;
