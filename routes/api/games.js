const router = require("express").Router();
const connection = require("../../database/index");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, "../../uploads/games"));
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});

router.post("/addGame", upload.single('photo'), (req, res) => {
    try {
        const searchSql = "SELECT * FROM game WHERE nameGame=?";
        const nameGame = req.body.nameGame;
        if (req.file) {
            connection.query(searchSql, [nameGame], (err, result) => {
                if (err) throw err;
                if (!result.length) {
                    const { author, year, editor, genre } = req.body;
                    const photo = req.file.filename;
                    const addSql = "INSERT INTO game (nameGame, author, photo, year,editor,idGenre) VALUES(?,?,?,?,?,?)";
                    const values = [nameGame, author, photo, year, editor, genre];
                    connection.query(addSql, values, (err, result) => {
                        if (err) throw err;
                        res.status(200).json("Le jeu a bien été ajouté");
                    });
                } else {
                    const photo = req.file.filename;
                    const filePath = path.join(__dirname, "../../uploads/games", photo);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                    res.status(400).json("Le jeu est déjà en base de données !");
                }
            });
        }
        else {
            res.status(400).json("Une petite photo peut être ?");
        }
    } catch (error) {
        res.status(500).json("Un problème est survenu...");
    }
});



router.delete("/deleteGameData/:id", (req, res) => {
    try {
        const idGame = req.params.id;
        const selectGames = "SELECT * FROM game WHERE idGame = ?";
        connection.query(selectGames, [idGame], (err, result) => {
            if (err) throw err;
            const filePath = path.join(__dirname, "../../uploads/games", result[0].photo);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(err);
                }
            });

        });
        const deleteGameSql = "DELETE FROM game WHERE idGame = ?";
        connection.query(deleteGameSql, [idGame], (err, result) => {
            if (err) throw err;
            res.sendStatus(200);
        });
    } catch (error) {
        res.sendStatus(400).json("Un problème est survenu...");
    }
});

router.get("/getGames", (req, res) => {
    try {
        const selectSql = "SELECT * FROM game ORDER BY nameGame ASC";
        connection.query(selectSql, (err, result) => {
            if (err) throw err;
            res.send(JSON.stringify(result));
        });
    } catch (error) {
        console.error(error);
    }
});


module.exports = router;