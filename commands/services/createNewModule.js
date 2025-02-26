// commands/createNewModule.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCLUDED_FOLDERS = ["node_modules", ".git", "dist"];

const TEMPLATE_NAME_MAP = {
  modulewithRedux: "Module using ReduxThunk",
  modulewithSaga: "Module using ReduxSaga",
};

function copyTemplate(templateDir, targetDir, forceOverwrite) {
  fs.readdirSync(templateDir, { withFileTypes: true }).forEach((dirent) => {
    if (EXCLUDED_FOLDERS.includes(dirent.name)) return;

    const templatePath = path.join(templateDir, dirent.name);
    const targetPath = path.join(targetDir, dirent.name);

    if (dirent.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyTemplate(templatePath, targetPath, forceOverwrite);
    } else if (dirent.isFile()) {
      if (fs.existsSync(targetPath) && !forceOverwrite) {
        console.warn(
          `⚠️ Skipping: ${dirent.name} already exists. Use --force to overwrite.`
        );
        return;
      }

      fs.copyFileSync(templatePath, targetPath);
      console.log(`✅ Created: ${targetPath}`);
    }
  });
}

export const command = "create-new-module";
export const describe = chalk.cyan(
  "✨ Copy template contents directly into the current folder"
);

export const builder = (yargs) =>
  yargs.option("force", {
    alias: "f",
    type: "boolean",
    describe: chalk.greenBright("Overwrite existing files without prompt"),
    default: false,
  });

export const handler = async ({ force: forceOverwrite }) => {
  const templateDir = path.join(__dirname, "../../templates");

  const templates = fs
    .readdirSync(templateDir, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() && !EXCLUDED_FOLDERS.includes(dirent.name)
    )
    .map((dirent) => ({
      name: TEMPLATE_NAME_MAP[dirent.name] || dirent.name,
      value: dirent.name,
    }));

  if (!templates.length) {
    console.error("❌ No templates found.");
    return;
  }

  const { selectedTemplate } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedTemplate",
      message: "📦 Choose a template to use:",
      choices: templates,
    },
  ]);

  const selectedTemplateDir = path.join(templateDir, selectedTemplate);
  const targetDir = process.cwd(); // ✅ Current working directory

  console.log(
    `🚀 Copying template "${
      TEMPLATE_NAME_MAP[selectedTemplate] || selectedTemplate
    }" into: ${targetDir}`
  );
  copyTemplate(selectedTemplateDir, targetDir, forceOverwrite);
  console.log(
    `🎉 Template contents copied successfully into the current directory!`
  );
};
