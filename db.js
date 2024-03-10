const mongoose = require('mongoose')
const { Schema, model } = mongoose

mongoose.connect('mongodb+srv://admin:1mwGcuR5hNAnFsnE@cluster0.43jjlwz.mongodb.net/Paytm')


const userSchema = new Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})

const bankSchema = new Schema({
    userId: { type: String, ref: 'User', required: true },
    balance: { type: Number, required: true }

})

const User = model('User', userSchema)
const Bank = model('Bank', bankSchema)

module.exports = {
    User,
    Bank
}