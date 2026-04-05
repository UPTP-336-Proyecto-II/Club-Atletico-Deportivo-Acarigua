const fs = require('fs');
const img = fs.readFileSync('src/assets/icons/logo.png');
fs.writeFileSync('src/utils/logoBase64.js', "export const LOGO_BASE64 = 'data:image/png;base64," + img.toString('base64') + "';");
