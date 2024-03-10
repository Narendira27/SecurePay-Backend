const express = require('express')
const middlewareFunction = require('../middleware')
const { z } = require('zod')
const { Bank } = require('../db')
const { mongoose } = require('mongoose')
const { ObjectId } = require('mongoose').Types;
const router = express.Router()

router.get('/balance', middlewareFunction, async (req, res) => {

    const Id = req.userId

    const response = await Bank.findOne({ userId: Id })

    res.status(200).json({ 'Balance': response.balance })
})


const transferSchema = z.object({
    to: z.string(),
    amount: z.number()
})

router.post('/transfer', middlewareFunction, async (req, res) => {

    const body = req.body

    const validateInput = transferSchema.safeParse(body).success

    if (!validateInput) {
        return res.status(411).json('Invalid Inputs')
    }

    const session = await mongoose.startSession();

    session.startTransaction();

    const account = await Bank.findOne({ userId: req.userId }).session(session)

    if (!account || account.balance < body.amount) {
        session.abortTransaction();
        return res.status(400).json({ "message": "Insufficient Balance" })
    }


    const Toaccount = await Bank.findOne({ userId: body.to }).session(session)

    if (!Toaccount) {
        session.abortTransaction()
        return res.status(400).json({ message: "Invalid Account" })
    }

    await Bank.updateOne({ userId: req.userId }, { $inc: { balance: - body.amount } }).session(session)
    await Bank.updateOne({ userId: body.to }, { $inc: { balance: + body.amount } }).session(session)

    await session.commitTransaction()

    res.status(200).json({ message: "Transfer Successful" })
})

module.exports = router