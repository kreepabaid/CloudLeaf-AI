import { stitch } from "@google/stitch-sdk";

const apiKey = "AQ.Ab8RN6In4eQh4nLeYfXR8ED5Q_Slu28Kev-34x9Kx9Y7kbiChQ";
process.env.STITCH_API_KEY = apiKey;

async function main() {
  try {
    console.log("Fetching projects...");
    const projects = await stitch.projects();
    console.log("Projects list length:", projects.length);
    
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      console.log(`\n--- Project ${i} ---`);
      console.log("projectId:", p.projectId);
      console.log("data (excluding circular properties):");
      if (p.data) {
        // Output non-circular fields of p.data
        const dataKeys = Object.keys(p.data);
        for (const k of dataKeys) {
          if (typeof p.data[k] !== 'object' || p.data[k] === null) {
            console.log(`  ${k}:`, p.data[k]);
          } else {
            console.log(`  ${k}: [Object/Array]`);
            try {
              // Try to print it if not circular
              console.log(`  ${k} (JSON):`, JSON.stringify(p.data[k]).substring(0, 150));
            } catch (e) {
              console.log(`  ${k} (circular or error):`, e.message);
            }
          }
        }
      }
      
      // Let's call screens()
      try {
        if (typeof p.screens === 'function') {
          const screens = await p.screens();
          console.log(`Screens count for ${p.id || p.projectId}:`, screens.length);
          for (let j = 0; j < screens.length; j++) {
            const screen = screens[j];
            console.log(`\n  --- Screen ${j} ---`);
            console.log("  screen.id:", screen.id);
            console.log("  screen.name:", screen.name);
            console.log("  screen keys:", Object.keys(screen));
            
            // Print screen data if exists
            if (screen.data) {
              console.log("  screen.data keys:", Object.keys(screen.data));
              for (const sk of Object.keys(screen.data)) {
                if (typeof screen.data[sk] !== 'object' || screen.data[sk] === null) {
                  console.log(`    ${sk}:`, screen.data[sk]);
                } else {
                  console.log(`    ${sk}: [Object/Array]`);
                  try {
                    console.log(`    ${sk} (JSON):`, JSON.stringify(screen.data[sk]).substring(0, 300));
                  } catch (e) {}
                }
              }
            }
            
            // Inspect prototype methods of screen
            const proto = Object.getPrototypeOf(screen);
            const methods = Object.getOwnPropertyNames(proto).filter(m => typeof proto[m] === 'function');
            console.log("  Screen prototype methods:", methods);
            
            // Try calling screen methods like html(), getHtml(), css(), getCss(), etc.
            for (const m of methods) {
              if (m === 'constructor') continue;
              try {
                const res = await screen[m]();
                console.log(`  Called ${m}():`, typeof res === 'string' ? res.substring(0, 200) + '...' : res);
              } catch (err) {
                console.log(`  Failed calling ${m}():`, err.message);
              }
            }
          }
        }
      } catch (err) {
        console.error("  Error getting screens:", err);
      }
    }
  } catch (err) {
    console.error("Error fetching projects from Stitch:", err);
  }
}

main();
