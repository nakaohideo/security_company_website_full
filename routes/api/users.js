const express = require("express");
const { ethers } = require('ethers');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const User = require("../../models/User");

const generateAddress = () => {
    const wallet = ethers.Wallet.createRandom();
    const depositAddress = wallet.address;
    const privateKey = wallet.privateKey;

    return { depositAddress, privateKey };
}

router.post(
    "/register",
    [
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a passwrod with 6 or more characters"
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const { depositAddress, privateKey } = generateAddress();

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "User already exists" }] });
            }

            user = new User({ email, password, depositAddress, privateKey });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            res.json({ user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Incorrect Password!" }] });
            }

            const payload = { user: { id: user.id } };

            jwt.sign(payload, config.get("jwtSecret"), (err, token) => {
                if (err) throw err;
                res.json({ token, user });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);
module.exports = router;
