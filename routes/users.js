const express = require('express');
const router = express.Router();

const passport = require("passport");
const jwt_decode = require("jwt-decode");

router.post('/', (req, res) => {
    database.users.add(req.body, err => {
        if (err) res.send(err);
        else res.status(200).send({
            message: "New user added!"
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let bearer = req.get("Authorization");
    let token = bearer.split(" ")[1];
    let data = jwt_decode(token);

    database.users.findById(data.id, (err, user) => {
        if (err) res.send(err);
        else res.status(200).json({
            name: user.name,
            phone: user.phone,
            address: user.address,
            photo: user.photo,
            email: user.email,
            role: user.role
        });
    });
});

router.get('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.findById(req.params.id, (err, user) => {
        if (err) res.send(err);
        else res.status(200).json({
            name: user.name,
            phone: user.phone,
            address: user.address,
            photo: user.photo,
            email: user.email,
            role: user.role
        });
    });
});

// USER PETs
router.get('/:id/pet-appointments', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.getUserPetAppointments(req.params.id, (err, petAppointments) => {
        if (err) res.send(err);
        else res.status(200).json(petAppointments);
    });
});

router.get('/pet-appointments/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.getPetAppointmentById(req.params.id, (err, petAppointment) => {
        if (err) res.send(err);
        else res.status(200).json(petAppointment);
    });
});

router.get('/pets/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.getPetById(req.params.id, (err, pet) => {
        if (err) res.send(err);
        else res.status(200).json(pet);
    });
});

router.put('/pets/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.updatePet(req.params.id, req.body, (err, info) => {
        if (err) res.send(err);
        else res.status(200).json(info);
    });
});

router.delete('/pets/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.deletePet(req.params.id, (err, info) => {
        if (err) res.send(err);
        else res.status(200).json(info);
    })
});

router.get('/:id/pets', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.getPets(req.params.id, (err, pets) => {
        if (err) res.send(err);
        else res.status(200).json(pets);
    });
});

router.post('/:id/pets', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    database.users.addPet(req.params.id, req.body, (err, info) => {
        if (err) res.send(err);
        else res.status(200).json(info);
    });
});

module.exports = router;