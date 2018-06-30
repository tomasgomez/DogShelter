const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    database.get('ds_services', "_all_docs?include_docs=true").then(result => {
        let services = result.data.rows.map((service) => {
            return service.doc;
        });
        res.status(200).json(services);
    }, err => {
        res.send(err);
    });
});

router.get('/:id', (req, res) => {
    database.get('ds_services', req.params.id).then(service => {
        res.status(200).json(service.data);
    }, err => {
        res.send(err);
    });
});

router.get('/:id/time-slots', (req, res) => {
    database.get('ds_service_time_slots', "_all_docs?include_docs=true").then(result => {
        let services = result.data.rows.reduce((acc, curr) => {
            if (curr.doc.serviceID === parseInt(req.params.id)) {
                acc.push(curr.doc);
            }
            return acc;
        }, []);
        res.status(200).json(services);
    }, err => {
        res.send(err);
    });
});

module.exports = router;