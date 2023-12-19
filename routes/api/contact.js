const router = require("express").Router();
const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.NODEMAILERPASSWORD,
    },
});


router.post('/send', (req, res) => {
    const { name, firstname, email, subject, message } = req.body;
    // Configurer le transporteur Nodemailer
    try {
        // Options du message
        const mailOptions = {
            from: email,
            to: 'becque.anthony@gmail.com', // Adresse e-mail de destination
            subject: subject,
            text: `Nom: ${name}\nPrénom: ${firstname}\nEmail: ${email}\nMessage: ${message}`,
        };

        // Envoyer l'email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.send('Erreur lors de l\'envoi de l\'email.');
            } else {
                res.status(200).json('Ok');
            }
        });
    } catch (error) {
        console.error(error);
    }

    // Options du message

});
module.exports = router;
