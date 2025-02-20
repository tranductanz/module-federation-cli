import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders to exclude from selection
const EXCLUDED_FOLDERS = ["node_modules", ".git", "dist"];

// Template name mapping (folderName -> displayName)
const TEMPLATE_NAME_MAP = {
  modulewithRedux: "Module using with ReduxThunk",
  modulewithSaga: "Module using with ReduxSaga",
};

// Recursively copy template files
function copyTemplate(templateDir, targetDir, moduleName, forceOverwrite) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.readdirSync(templateDir, { withFileTypes: true }).forEach((dirent) => {
    if (EXCLUDED_FOLDERS.includes(dirent.name)) return;

    const templatePath = path.join(templateDir, dirent.name);
    const targetPath = path.join(targetDir, dirent.name);

    if (dirent.isDirectory()) {
      copyTemplate(templatePath, targetPath, moduleName, forceOverwrite);
    } else if (dirent.isFile()) {
      if (fs.existsSync(targetPath) && !forceOverwrite) {
        console.warn(
          `⚠️ Skipping: ${dirent.name} already exists. Use --force to overwrite.`
        );
        return;
      }

      let content = fs.readFileSync(templatePath, "utf-8");
      content = content.replace(/{{moduleName}}/g, moduleName);
      fs.writeFileSync(targetPath, content);
      console.log(`✅ Created: ${targetPath}`);
    }
  });
}

export default async function createNewModule(
  moduleName,
  forceOverwrite = false
) {
  const templateDir = path.join(__dirname, "../templates");

  // Read available template folders
  const templates = fs
    .readdirSync(templateDir, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() && !EXCLUDED_FOLDERS.includes(dirent.name)
    )
    .map((dirent) => ({
      name: TEMPLATE_NAME_MAP[dirent.name] || dirent.name, // Display friendly name
      value: dirent.name, // Folder name used internally
    }));

  if (templates.length === 0) {
    console.error("❌ No templates found.");
    return;
  }

  // Prompt user to select a template
  const { selectedTemplate } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedTemplate",
      message: "📦 Choose a template to use:",
      choices: templates,
    },
  ]);

  const selectedTemplateDir = path.join(templateDir, selectedTemplate);
  const targetDir = process.cwd();

  console.log(
    `🚀 Generating module files using "${
      TEMPLATE_NAME_MAP[selectedTemplate] || selectedTemplate
    }" in: ${targetDir}`
  );
  copyTemplate(selectedTemplateDir, targetDir, moduleName, forceOverwrite);
  console.log(`🎉 Module created successfully!`);
}
