require('dotenv').config();
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://mail.google.com/'],
});

console.log("Autorisez l'application en visitant ce lien:", url);

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Collez le code ici : ', async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Votre Refresh Token :', tokens.refresh_token);
  rl.close();
});
