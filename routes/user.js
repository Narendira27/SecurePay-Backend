const express = require('express')
const { User, Bank } = require('../db')
const { z } = require('zod')
const jwt = require('jsonwebtoken')
const JWT_SECRET = require('../confing')
const bcrypt = require('bcryptjs');
const middlewareFunction = require('../middleware')

const router = express.Router();

const bodySchema = z.object({
    username: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string().min(8)
})

router.post('/signup', async (req, res) => {
    const body = req.body
    const inputValidation = bodySchema.safeParse(body).success
    if (inputValidation === false) {
        return res.status(411).json({ 'message': 'Incorrect inputs' })
    }
    const user = await User.findOne({ username: body.username })
    if (user) {
        return res.status(411).json({ 'message': 'Email already taken' })
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(body.password, salt);
    // bcrypt.compareSync("B4c0/\/", hash);

    const dbStatus = await User.create({
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        password: passwordHash
    })

    await Bank.create({
        userId: dbStatus._id,
        balance: 1 + Math.random() * 1000
    })

    const jwtToken = jwt.sign({ userId: dbStatus._id }, JWT_SECRET)
    res.status(200).json({
        message: "User created successfully",
        name: body.firstName,
        token: jwtToken
    })
})

const signinSchema = z.object({
    username: z.string(),
    password: z.string().min(8)
})

router.post('/signin', async (req, res) => {

    const body = req.body

    const inputValidation = signinSchema.safeParse(body).success

    if (inputValidation !== true) {
        return res.status(411).json({ message: "Incorrect Inputs" })
    }

    const userStatus = await User.findOne({ username: body.username })

    if (!userStatus) {
        return res.status(411).json({ message: "Error while logging in" })
    }

    const signinStatus = await bcrypt.compare(body.password, userStatus.password)

    if (!signinStatus) {

        return res.status(411).json({ message: "Incorrect Password" })
    }

    //console.log(userStatus.id)

    const jwtToken = jwt.sign({ userId: userStatus.id }, JWT_SECRET)

    res.status(200).json(
        {
            name: userStatus.firstName,
            token: jwtToken
        }
    )
})


updateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().optional()
})

router.put('/', middlewareFunction, async (req, res) => {
    const body = req.body

    const id = req.userId

    const validateInput = updateSchema.safeParse(body).success

    if (!validateInput) {
        return res.status(411).json({
            message: "Error while updating information"
        })
    }

    if (body.password) {
        console.log('here')
        const salt = bcrypt.genSaltSync(10);
        const encryptPassword = bcrypt.hashSync(body.password, salt)
        body.password = encryptPassword
    }

    const db = await User.updateOne({ _id: id }, body)
    res.json({
        message: "Updated successfully"
    })
})

router.get('/bulk', middlewareFunction, async (req, res) => {

    const query = req.query.filter || "";

    const dbCall = await User.find({
        $or: [{
            firstName: {
                "$regex": query
            }
        }, {
            lastName: {
                "$regex": query
            }
        }]
    })

    const data = dbCall.map((each) => ({ firstName: each.firstName, lastName: each.lastName, id: each.id }))

    res.status(200).json({ "users": data })


})

router.get('/me', middlewareFunction, async (req, res) => {
    const id = req.userId

    const dbCall = await User.findOne({ _id: id })

    if (!dbCall) {
        return (res.status(411).json({ message: "Invaild Token / User Doesn't Exists " }))
    }

    res.status(200).json({ name: dbCall.firstName })

})


module.exports = router
