const express = require('express')
const cors = require('cors')
const rootRouter = require('./routes/index.js')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1', rootRouter)

//RapidPay

app.listen(54258, console.log('running'))