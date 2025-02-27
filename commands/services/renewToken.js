import { renewToken } from "../../config/configManager.js";

(async () => {
  console.log("🔍 Testing renewToken...");
  const newToken = await renewToken();
  if (newToken) {
    console.log("✅ Token renewed successfully:", newToken);
  } else {
    console.log("❌ Token renewal failed.");
  }
})();
