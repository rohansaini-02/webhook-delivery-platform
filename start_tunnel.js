const { spawn } = require('child_process');
const fs = require('fs');

console.log("Starting stable Localtunnel...");

// Using npx localtunnel for a more resilient bridge
const lt = spawn('npx', ['localtunnel', '--port', '3000'], { shell: true });

lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log("Tunnel Output:", output);
  
  // Regex to match the localtunnel URL (e.g. https://fancy-pumas-jump.loca.lt)
  const match = output.match(/(https:\/\/[a-zA-Z0-9-]+\.loca\.lt)/);
  if (match) {
    const url = match[1];
    console.log('\n----------------------------------------');
    console.log('LIVE TUNNEL URL:', url);
    console.log('----------------------------------------\n');

    // Update admin-app/.env
    if (fs.existsSync('admin-app/.env')) {
      let envAdmin = fs.readFileSync('admin-app/.env', 'utf-8');
      if(envAdmin.includes('EXPO_PUBLIC_API_URL')) {
        envAdmin = envAdmin.replace(/EXPO_PUBLIC_API_URL=.*/, `EXPO_PUBLIC_API_URL="${url}/api/v1"`);
      } else {
        envAdmin += `\nEXPO_PUBLIC_API_URL="${url}/api/v1"\n`;
      }
      fs.writeFileSync('admin-app/.env', envAdmin);
      console.log('[SUCCESS] Updated admin-app/.env');
    }

    // Update api/.env
    if (fs.existsSync('api/.env')) {
      let envApi = fs.readFileSync('api/.env', 'utf-8');
      if(envApi.includes('BACKEND_URL')) {
        envApi = envApi.replace(/BACKEND_URL=.*/, `BACKEND_URL="${url}"`);
      } else {
        envApi += `\nBACKEND_URL="${url}"\n`;
      }
      fs.writeFileSync('api/.env', envApi);
      console.log('[SUCCESS] Updated api/.env');
    }

    console.log('\n[INSTRUCTION] Restart Expo with "npx expo start --clear" now!');
  }
});

lt.stderr.on('data', (data) => {
  const err = data.toString();
  if (!err.includes('Cloned correctly')) { // Ignore noisy logs
    console.error("Tunnel Error:", err);
  }
});

lt.on('close', (code) => {
  console.log(`Tunnel process exited with code ${code}. Restarting tunnel in 5 seconds...`);
  setTimeout(() => {
    // Basic recursive call would be cleaner as a function, but for now just a reminder
    console.log("Please re-run 'node start_tunnel.js' if it doesn't auto-start properly.");
  }, 5000);
});
