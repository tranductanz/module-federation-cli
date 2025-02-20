#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const createNewModule = require("../commands/createNewModule");

yargs(hideBin(process.argv))
  .command(
    "create-new-module",
    "Create a new module",
    () => {},
    createNewModule
  )
  .demandCommand(1, "You need to specify a command.")
  .help().argv;
