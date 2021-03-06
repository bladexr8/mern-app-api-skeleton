import User from '../models/user.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'

// route('/api/users').post
const create = async (req, res) => { 
    console.log('***Creating User...');
    const user = new User(req.body)
    try {
        await user.save()
        return res.status(200).json({
            message: "Successfully signed up"
        })
    } catch(err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
 }

 // route('/api/users').get
const list = async (req, res) => { 
    try {
        console.log('***Listing Users...');
        let users = await User.find().select(`name email updated created`)
        res.json(users)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
 }

// router.param('userId', userCtrl.userByID)
const userByID = async (req, res, next, id) => { 
    try {
        let user = await User.findById(id)
        if (!user) {
            return res.status(400).json({
                error: `User ${id} not found`
            })
        }
        req.profile = user
        next()
    } catch (err) {
         res.status('400').json({
             error: "Could not retrieve user"
        })
    }
  }

// route('/api/users/:userId').get(userCtrl.read)
const read = (req, res) => { 
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile)
 }

// route('/api/users/:userId').put(userCtrl.update) 
const update = async (req, res) => { 
    try {
        let user = req.profile
        user = extend(user, req.body)
        user.updated = Date.now()
        await user.save()
        user.hashed_password = undefined
        user.salt = undefined
        user.active = undefined
        res.json(user)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

// route('/api/users/:userId').delete(userCtrl.remove)
const remove = async (req, res) => { 
    try {
        let user = req.profile
        let deletedUser = await user.remove()
        deletedUser.hashed_password = undefined
        deletedUser.salt = undefined
        res.json(deletedUser)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

export default { create, userByID, read, list, remove, update }