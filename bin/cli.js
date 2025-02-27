// bin/cli.js
// #!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";
import { createRequire } from "module";
import commands from "../commands/index.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

// Clear console
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

(async () => {
  // Prepare choices for the command selection prompt
  const commandChoices = commands.map((command) => ({
    name: `${command.command} - ${command.describe}`,
    value: command,
  }));

  // If no command is provided, show a prompt to select one
  if (!process.argv.slice(2).length) {
    const { selectedCommand } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCommand",
        message: "🔎 Select a command to execute:",
        choices: commandChoices,
      },
    ]);

    yargs(hideBin(["node", "cli.js", selectedCommand.command]))
      .command(selectedCommand)
      .help().argv;
  } else {
    // If command is provided, register commands normally
    const cli = yargs(hideBin(process.argv))
      .scriptName("mwg-module")
      .usage(
        chalk.cyan.bold("\nUsage: ") +
          chalk.whiteBright("mwg-module <command> [options]")
      )
      .version(version)
      .alias("version", "v")
      .help("help")
      .alias("help", "h")
      .strictCommands()
      .showHelpOnFail(
        true,
        chalk.red("❌ Invalid command! Use --help to see available commands.")
      )
      .epilog(
        chalk.gray(
          `\n💡 Using ${chalk.greenBright(
            version
          )} CLI\n🔗 More info: https://github.com/tranductanz/module-federation-cli`
        )
      );

    commands.forEach((command) => cli.command(command));
    cli.argv;
  }
})();
