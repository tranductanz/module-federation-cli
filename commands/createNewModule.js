import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders to exclude from copying
const EXCLUDED_FOLDERS = ["node_modules", ".git", "dist"];

// Recursively copy template files, excluding specified folders
function copyTemplate(templateDir, targetDir, moduleName, forceOverwrite) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.readdirSync(templateDir, { withFileTypes: true }).forEach((dirent) => {
    if (EXCLUDED_FOLDERS.includes(dirent.name)) {
      console.log(`🚫 Skipping excluded folder: ${dirent.name}`);
      return; // Skip excluded folders
    }

    const templatePath = path.join(templateDir, dirent.name);
    const targetPath = path.join(targetDir, dirent.name);

    if (dirent.isDirectory()) {
      // Recursively copy directories
      copyTemplate(templatePath, targetPath, moduleName, forceOverwrite);
    } else if (dirent.isFile()) {
      if (fs.existsSync(targetPath) && !forceOverwrite) {
        console.warn(
          `⚠️ Skipping: ${dirent.name} already exists. Use --force to overwrite.`
        );
        return;
      }

      let content = fs.readFileSync(templatePath, "utf-8");
      content = content.replace(/{{moduleName}}/g, moduleName); // Replace placeholders

      fs.writeFileSync(targetPath, content);
      console.log(`✅ Created: ${targetPath}`);
    }
  });
}

export default function createNewModule(moduleName, forceOverwrite = false) {
  const templateDir = path.join(__dirname, "../templates/modulewithRedux");
  const targetDir = process.cwd();

  console.log(`🚀 Generating module files in: ${targetDir}`);
  copyTemplate(templateDir, targetDir, moduleName, forceOverwrite);
  console.log(`🎉 All template files have been created in ${targetDir}`);
}
