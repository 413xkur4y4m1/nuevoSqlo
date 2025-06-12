const functions = require('firebase-functions');
const { exec } = require('child_process');

exports.startServer = functions.runWith({ memory: '512MB', timeoutSeconds: 540 }).https.onRequest((req, res) => {
  exec('npm start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing npm start: ${error.message}`);
      res.status(500).send(`Error executing npm start: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`npm start stderr: ${stderr}`);
      res.status(500).send(`npm start stderr: ${stderr}`);
      return;
    }
    res.status(200).send(stdout);
  });
});
