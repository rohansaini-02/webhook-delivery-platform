const { spawn } = require('child_process');
const fs = require('fs');

console.log("Starting SSH tunnel...");
const ssh = spawn('ssh', ['-R', '80:localhost:3000', 'nokey@localhost.run']);

ssh.stdout.on('data', (data) => {
  const output = data.toString();
  console.log("SSH Output:", output);
  const match = output.match(/(https:\/\/[a-zA-Z0-9-]+\.lhr\.life)/);
  if (match) {
    const url = match[1];
    
    // Update admin-app/.env
    let envAdmin = fs.readFileSync('admin-app/.env', 'utf-8');
    if(envAdmin.includes('EXPO_PUBLIC_API_URL')) {
       envAdmin = envAdmin.replace(/EXPO_PUBLIC_API_URL=.*/, `EXPO_PUBLIC_API_URL="${url}/api/v1"`);
    } else {
       envAdmin += `\nEXPO_PUBLIC_API_URL="${url}/api/v1"\n`;
    }
    fs.writeFileSync('admin-app/.env', envAdmin);

    // Update api/.env
    let envApi = fs.readFileSync('api/.env', 'utf-8');
    envApi = envApi.replace(/BACKEND_URL=.*/, `BACKEND_URL="${url}"`);
    fs.writeFileSync('api/.env', envApi);

    console.log('SUCCESS_URL_WRITTEN:', url);
  }
});

ssh.stderr.on('data', (data) => console.log("SSH Err:", data.toString()));
ssh.on('close', (code) => console.log(`SSH tunnel exited with code ${code}`));
