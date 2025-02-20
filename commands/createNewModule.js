import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname is not defined in ESM, so recreate it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function createNewModule(moduleName, forceOverwrite = false) {
  const templateDir = path.join(__dirname, "../templates/modulewithRedux");
  const targetDir = process.cwd(); // Use current working directory

  console.log(`🚀 Generating module files in: ${targetDir}`);

  // Process and copy template files directly into current directory
  fs.readdirSync(templateDir).forEach((file) => {
    const templatePath = path.join(templateDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.existsSync(targetPath) && !forceOverwrite) {
      console.warn(
        `⚠️ Skipping: ${file} already exists. Use --force to overwrite.`
      );
      return;
    }

    let content = fs.readFileSync(templatePath, "utf-8");
    content = content.replace(/{{moduleName}}/g, moduleName); // Replace placeholders

    fs.writeFileSync(targetPath, content);
    console.log(`✅ Created: ${targetPath}`);
  });

  console.log(`🎉 All template files have been created in ${targetDir}`);
}
