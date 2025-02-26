#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import commands from "../commands/index.js";
import figlet from "figlet";
import clear from "clear";
import { createRequire } from "module";
import chalk from "chalk";

// ✅ Import package.json without warnings
const require = createRequire(import.meta.url);
const { version } = require("../package.json");

// Clear console for a clean display
clear();

// CLI Banner
console.log(
  chalk.yellowBright(
    figlet.textSync("MWG Module CLI", {
      font: "Small",
      horizontalLayout: "fitted",
      width: 80,
    })
  )
);

// Yargs setup
const cli = yargs(hideBin(process.argv))
  .scriptName("💡")
  .usage(
    chalk.cyan.bold("\nUsage: ") +
      chalk.whiteBright("mwg-module <command> [options]")
  )
  .version(version) // ✅ Uses version from package.json
  .alias("version", "v")
  // .command(
  //   "create-new-module",
  //   chalk.cyan("✨ Init a new module with a template (interactive selection)"),
  //   (yargs) => {
  //     yargs
  //       .positional("name", {
  //         describe: chalk.greenBright(
  //           "Name of the module (used in placeholders)"
  //         ),
  //         type: "string",
  //         default: "NewModule",
  //       })
  //       .option("force", {
  //         alias: "f",
  //         type: "boolean",
  //         describe: chalk.greenBright(
  //           "Overwrite existing files without prompt"
  //         ),
  //         default: false,
  //       });
  //   },
  //   async (argv) => {
  //     try {
  //       console.log(
  //         chalk.blueBright(`🚀 Starting to create module: ${argv.name}`)
  //       );
  //       await createNewModule(argv.name, argv.force); // ✅ Call once here
  //       console.log(
  //         chalk.green(`✅ Module '${argv.name}' created successfully!`)
  //       );
  //       process.exit(0); // ✅ Prevent double prompts
  //     } catch (error) {
  //       console.error(chalk.red(`❌ Error: ${error.message}`));
  //       process.exit(1); // ✅ Clean error exit
  //     }
  //   }
  // )
  .help("help")
  .alias("help", "h")
  .strictCommands()
  .showHelpOnFail(
    true,
    chalk.red("❌ Invalid command! Use --help to see available commands.")
  )
  .epilog(
    chalk.gray(
      `\n💡 You are currently using ${chalk.greenBright(
        version
      )} CLI\n🔗 More info: https://github.com/tranductanz/module-federation-cli`
    )
  );

// ✅ Dynamically register all commands from the commands folder
commands.forEach((command) => cli.command(command));

// ✅ Show help with an informational prompt if no command is provided
if (!process.argv.slice(2).length) {
  console.log(
    chalk.blueBright("\nℹ️ Info:"),
    chalk.cyan("No command provided. Please use one of the following commands:")
  );
  cli.showHelp();
  process.exit(0); // Exit with success code since it's informational
}

cli.argv;
