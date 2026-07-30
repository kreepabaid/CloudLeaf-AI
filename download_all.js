import { stitch } from "@google/stitch-sdk";
import fs from "fs";
import path from "path";

const apiKey = "AQ.Ab8RN6In4eQh4nLeYfXR8ED5Q_Slu28Kev-34x9Kx9Y7kbiChQ";
process.env.STITCH_API_KEY = apiKey;

async function main() {
  try {
    const downloadDir = "./stitch_downloads";
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }
    
    console.log("Fetching projects...");
    const projects = await stitch.projects();
    console.log("Projects list length:", projects.length);
    const p = projects[0];
    
    // Save theme if present (non-circular fields)
    if (p.data && p.data.designTheme) {
      console.log("Saving design theme...");
      const themeClean = {};
      for (const k of Object.keys(p.data.designTheme)) {
        if (k !== 'root' && k !== 'client') {
          themeClean[k] = p.data.designTheme[k];
        }
      }
      fs.writeFileSync(
        path.join(downloadDir, "theme.json"),
        JSON.stringify(themeClean, null, 2)
      );
    }
    
    console.log("Calling screens()...");
    const screens = await p.screens();
    console.log("Found screens:", screens.length);
    
    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      const title = screen.data.title || `screen_${screen.id}`;
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      console.log(`\nProcessing screen ${i}: ${title} (${screen.id})...`);
      
      // Save screen metadata
      const screenMeta = {
        id: screen.id,
        name: screen.name,
        title: screen.data.title,
        width: screen.data.width,
        height: screen.data.height,
        deviceType: screen.data.deviceType,
      };
      fs.writeFileSync(
        path.join(downloadDir, `${i}_${safeTitle}_meta.json`),
        JSON.stringify(screenMeta, null, 2)
      );
      
      // Get HTML URL
      let htmlUrl = null;
      try {
        htmlUrl = await screen.getHtml();
      } catch (err) {
        console.error(`  Error calling getHtml():`, err.message);
      }
      
      if (!htmlUrl && screen.data.htmlCode && screen.data.htmlCode.downloadUrl) {
        htmlUrl = screen.data.htmlCode.downloadUrl;
      }
      
      if (htmlUrl) {
        console.log(`  Downloading HTML from: ${htmlUrl}`);
        try {
          const res = await fetch(htmlUrl);
          const htmlContent = await res.text();
          const filename = `${i}_${safeTitle}.html`;
          fs.writeFileSync(path.join(downloadDir, filename), htmlContent);
          console.log(`  Saved to ${filename}`);
        } catch (err) {
          console.error(`  Failed to download HTML:`, err.message);
        }
      } else {
        console.log(`  No HTML URL found for screen.`);
      }
    }
    console.log("\nDownload complete!");
  } catch (err) {
    console.error("Error in download script:", err);
  }
}

main();
