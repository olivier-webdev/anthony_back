const router = require("express").Router();
const connection = require("../../database/index");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, "../../uploads/imgCarrousel"));
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});

router.get('/getPhotosCarrousel', (req, res) => {
    try {
        const sql = "SELECT * FROM photos";
        connection.query(sql, (err, result) => {
            if (err) throw err;
            res.send(JSON.stringify(result));
        });
    } catch (error) {
        console.error(error);
    }
});

router.patch('/modifyCarrousel', upload.array('files'), (req, res) => {
    try {
        const idUser = req.body.idUser;
        const sqlOldImages = 'SELECT photo FROM photos';
        connection.query(sqlOldImages, (err, result) => {
            if (err) throw err;
            result.map((photoDB) => {
                const filePathPhotoDB = path.join(__dirname, "../../uploads/imgCarrousel", photoDB.photo);
                fs.unlink(filePathPhotoDB, (err) => {
                    if (err) {
                        console.error;
                    }
                });
            });

        });
        const sqlDelete = 'DELETE FROM photos';
        connection.query(sqlDelete, (err, result) => {
            if (err) throw err;
        });
        const imageNames = req.files.map(file => file.filename);
        imageNames.forEach(imageName => {
            const sqlAdd = 'INSERT INTO photos (photo,idUser) VALUES (?,?) ';
            connection.query(sqlAdd, [imageName, idUser], (err, result) => {
                if (err) throw err;

            });
        });
        res.status(200).json({ message: "Images ajoutées avec succès" });


    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur interne du serveur');
    }
});

module.exports = router;