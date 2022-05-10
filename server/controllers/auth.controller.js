import User from '../models/user.model'
import jwt from 'jsonwebtoken'
// looks terrible but works!
// see npm docs - https://www.npmjs.com/package/express-jwt
var { expressjwt: expJwt} = require('express-jwt')
//import expressJwt from 'express-jwt'
import config from './../../config/config'

// route('/auth/signin').post(authCtrl.signin)
const signin = async (req, res) => {
    console.log(`Signing in ${req.body.email}`) 
    try {
        let user = await User.findOne({ "email": req.body.email })
        if (!user) {
            console.log(`${req.body.email} not found in database...`)
            return res.status(401).json({ error: 'Login Failed - User Not Found '})
        }

        if (!user.authenticate(req.body.password)) {
            console.log(`${req.body.email} authentication failed...`)
            return res.status(401).send({ error: "Login Failed - Invalid User Credentials" })
        }

        if (!user.active) {
            console.log(`${req.body.email} authentication failed - account inactive...`)
            return res.status(403).send({ error: "Login Failed - Unauthorized User" })
        }

        const token = jwt.sign({ _id: user._id }, config.jwtSecret)

        res.cookie('t', token, { expire: new Date() + 365 })

        return res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (err) {
        console.error(`***Error Signing In ${req.body.email}`)
        console.error(err)
        return res.status(401).json({ error: "Could not sign in" })
    }
 }

// route('/auth/signout').get(authCtrl.signout)
const signout = (req, res) => { 
    res.clearCookie("t")
    return res.status('200').json({
        message: "signed out"
    })
 }

// const requireSignin = () => { return true }
// verify that the incoming request has a valid JWT in the Authorization header.
const requireSignin = expJwt({
    secret: config.jwtSecret,
    //userProperty: 'auth',
    algorithms: ["HS256"]
}) 

// make sure the requesting user is only updating or deleting their own user information.
const hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth 
          && req.profile._id ==  req.auth._id
    if (!(authorized)) {
      return res.status('403').json({
        error: "User is not authorized"
      })
    }
    next()
}

export default { signin, signout, requireSignin, hasAuthorization }