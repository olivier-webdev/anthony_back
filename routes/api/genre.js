const router = require("express").Router();
const connection = require("../../database/index");

/**
 * 
 */
router.get("/getGenre", (req, res) => {
    try {
        const sql = "SELECT * FROM genre";
        connection.query(sql, (err, result) => {
            if (err) throw err;
            res.send(JSON.stringify(result));
        });
    } catch (error) {
        console.error(error);
    }

});

module.exports = router;