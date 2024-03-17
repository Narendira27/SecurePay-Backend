const express = require('express')
const cors = require('cors')
const rootRouter = require('./routes/index.js')

const app = express()

const corsOptions = {
  origin: ['https://securepay-frontend.onrender.com', 'https://securepay.narendira.tech','https://secure-pay-frontend.vercel.app'],
};

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/v1', rootRouter)

//RapidPay

app.listen(54258, console.log('running'))
