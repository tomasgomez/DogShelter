module.exports = (req, res) => {
    database.get('ds_products', "_all_docs").then((data, headers, status) => {
        console.log(data.data.rows);

        res.status(200).json({
            data
        });
    }, (err) => {
        console.log(err);
    });
};