const jwt = require('jsonwebtoken')
const JWT_SECRET = require('./confing')

const middlewareFunction = (req, res, next) => {
    const header = req.headers.authorization
    if (!header) {
        return res.status(403).json({ message: "invalid auth" })
    }

    const token = header.split(" ")[1]
    // console.log(token)
    try {
        const decode = jwt.verify(token, JWT_SECRET)

        if (decode.userId) {
            req.userId = decode.userId
            next()
        }
    }
    catch (e) {
        res.status(403).json({ 'message': e.message })
    }
}

module.exports = middlewareFunction