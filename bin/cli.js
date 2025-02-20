#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const createNewModule = require("../commands/createNewModule");

yargs(hideBin(process.argv))
  .command(
    "create-new-module [name]",
    "Create new module files in the current directory",
    (yargs) => {
      yargs
        .positional("name", {
          describe: "Name of the module (used in placeholders)",
          type: "string",
          default: "NewModule",
        })
        .option("force", {
          alias: "f",
          type: "boolean",
          describe: "Overwrite existing files without prompt",
          default: false,
        });
    },
    (argv) => createNewModule(argv.name, argv.force)
  )
  .demandCommand(1, "❌ Please provide a valid command.")
  .help().argv;
