const nodemailer = require('nodemailer');
const { google } = require("googleapis");

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const CLIENT_ID =
  "840259256346-rtvfs3lmoktokojmb3a2oahhi3ult8kc.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//045w0QDI2cFh8CgYIARAAGAQSNwF-L9IrdLtvLnBUBdMiKdJbMMdiAt-dXJTnqTmZ4PNbbUqAJs8KIfSelCepsVxVoP4tr9TsCA4";

// Create OAuth2 client
const authClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
authClient.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to send emails
async function mailer(receiver, id, key) {
    try {
        // Get access token
        const { token } = await authClient.getAccessToken();

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'adityarajput4276@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: token,
            }
        });

        // Compose email options
        const mailOptions = {
            from: 'Aditya Rajput <adityarajput4276@gmail.com>',
            to: receiver,
            subject: 'Recover your account',
            text: 'bsdk password yaad rakha kar',
            html: `recover your account by clicking on the following link <a href="http://localhost:3000/forgot/${id}/${key}">http://localhost:3000/forgot/${id}/${key}</a>`
        };

        // Send email
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (err) {
        return err;
    }
}

module.exports = mailer;
