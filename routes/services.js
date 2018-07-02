const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    database.services.getAll((err, services) => {
        if (err) res.send(err);
        else res.status(200).json(services);
    });
});

router.get('/:id', (req, res) => {
    database.services.findById(req.params.id, (err, service) => {
        if (err) res.send(err);
        else res.status(200).json(service);
    });
});

router.get('/:id/time-slots', (req, res) => {
    database.services.getTimeSlots(req.params.id, (err, timeSlots) => {
        if (err) res.send(err);
        else res.status(200).json(timeSlots);
    });
});

router.get('/time-slots/:id', (req, res) => {
    database.services.getTimeSlotOfId(req.params.id, (err, timeSlot) => {
        if (err) res.send(err);
        else res.status(200).send(timeSlot);
    });
});

router.put('/time-slots/:id', (req, res) => {
    database.services.updateTimeSlot(req.params.id, req.body, (err, info) => {
        if (err) res.send(err);
        else res.status(200).json(info);
    });
});

module.exports = router;