const router = require("express").Router();
const connection = require("../../database/index");
const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL,
        pass: process.env.NODEMAILERPASSWORD
    }
});

router.get('/getMessage', (req, res) => {
    try {
        const sql = "SELECT message.idMessage,message.content,DATE_FORMAT(message.date, '%d-%m-%Y %H:%i:%s') AS formattedDate,message.idUser,message.edit,message.report, user.username,user.avatar,user.idUser FROM message,user WHERE message.idUser = user.idUser ORDER BY message.date DESC";
        connection.query(sql, (err, result) => {
            if (err) throw err;
            res.send(JSON.stringify(result));
        });
    } catch (error) {
        console.error(error);
    }
});

router.post("/sendMessage", (req, res) => {
    try {
        const idUser = req.body.idUser;
        const content = req.body.content.content;
        const sqlAddMessage = "INSERT INTO message (content,idUser,edit,date) VALUES (?, ?,0,NOW())";
        const values = [content, idUser];
        connection.query(sqlAddMessage, values, (err, result) => {
            if (err) throw err;
            const messageId = result.insertId;
            const sqlGetNewMessage = "SELECT message.idMessage, message.content,DATE_FORMAT(message.date, '%d-%m-%Y %H:%i:%s') AS formattedDate,message.idUser,message.edit,user.username,user.avatar,user.idUser FROM message,user WHERE message.idUser = user.idUser AND idMessage = ?";;
            connection.query(sqlGetNewMessage, [messageId], (err, result) => {
                if (err) throw err;
                res.json(result[0]);

            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json("Une erreur est survenue");
    }
});

router.delete("/deleteMessage", (req, res) => {
    try {
        const idMessage = req.body.messageId;
        const sqlDelete = "DELETE FROM message WHERE idMessage = ?";
        connection.query(sqlDelete, [idMessage], (err, result) => {
            if (err) throw err;
            res.status(200).json('Message supprimé');
        });
    } catch (error) {
        console.error(error);
    }
});

router.patch("/updateMessage", (req, res) => {
    try {
        const edit = req.body.edit === true ? "1" : "0";
        const content = req.body.content;
        const id = req.body.idMessage;
        const report = req.body.report === true ? "1" : "0";
        const sql = 'UPDATE message set content = ? , edit = ?, report = ? WHERE idMessage = ?';
        connection.query(sql, [content, edit, report, id], (err, result) => {
            if (err) throw err;
            res.send(req.body);
        });
    } catch (error) {
        console.error(error);
    }
});
router.post("/alertMessage/:email", (req, res) => {
    try {
        const emailSend = req.params.email;
        const { content, formattedDate, idUser, username, idMessage } = req.body;
        const sql = "SELECT email FROM user WHERE idUser = ?";
        connection.query(sql, [idUser], (err, result) => {
            if (err) throw err;
            const mailOptions = {
                from: emailSend,
                to: process.env.MAIL,
                subject: "Un message a été signalé",
                text: `Le message suivant a été signalé : ${content} écrit le ${formattedDate} par ${username} ayant pour adresse mail ${result[0].email}`
            };
            transporter.sendMail(mailOptions, (err, result) => {
                if (err) throw err;
                res.status(200).json({ message: "Le message a été signalé" });
            });
            const sqlUpdate = "UPDATE message SET report = ? WHERE idMessage = ?";
            const report = 1;
            connection.query(sqlUpdate, [report, idMessage], (err, result) => {
                if (err) throw err;
            });
            const sqlSelect = "SELECT message.idMessage,message.content,DATE_FORMAT(message.date, '%d-%m-%Y %H:%i:%s') AS formattedDate,message.idUser,message.edit,message.report, user.username,user.avatar,user.idUser FROM message,user WHERE message.idUser = user.idUser ORDER BY message.date DESC";
            connection.query(sqlSelect, (err, result) => {
                if (err) throw err;
                res.send(JSON.stringify(result));
            });


        });

    } catch (error) {
        console.error(error);
    }
});

module.exports = router;