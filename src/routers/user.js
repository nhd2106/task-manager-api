const express= require('express');
const router = new express.Router();
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const multer = require('multer')
// create user
router.post('/users', async (req,res) => {
    const user = new User(req.body);

    try {
        await user.save()
        const token = await user.generateAuthToken( )
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }

    

    //- without async - await
    // user.save().then(() =>{

    //     res.send(user)

    // }).catch((err) => {
    //     res.status(400).send(err)
        
        
    // })


})
// login
router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

//read all user
router.get('/users/me',auth, async (req,res) => {
    res.send(req.user)
 
})
// log out
router.post('/users/logout',auth, async (req,res)=> {
        try {
            req.user.tokens =  req.user.tokens.filter((token)=>{
                return token.token !== req.token
            })
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
})
// Logout all User

router.post('/users/logoutAll',auth, async (req,res)=>{
    try {
        req.user.tokens  = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// --------------updating user by id

router.patch('/users/me',auth, async (req,res) => {
    const updates = Object.keys(req.body) // convert req.body to array
    const allowedUpdates =  ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
   
    try {

       
        updates.forEach((update) => req.user[update] = req.body[update])
        // const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})
// ------------Delete user 
router.delete('/users/me',auth, async(req,res) => {
    try {
           await req.user.remove()
            res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})
// -------Upload user avatar
const upload = multer({
    limits: {
        fileSize: 1000000,
    
    },
    fileFilter(req, file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return cb(new Error('File must be an image'))
        }
        cb(undefined, true)
    }
})


router.post('/users/me/avatar',auth,upload.single('avatar'), async(req,res)=> {
   
    const buffer = await sharp(req.file.buffer).resize({ width:250, height: 250 }).png().toBuffer()

    req.user.avatar =  buffer
    await req.user.save()
    res.send()
}, (error, req,res, next)=>{
    res.status(400).send({error: error.message})

} )
router.delete('/users/me/avatar',auth,upload.single('avatar'), async(req,res)=>{
    req.user.avatar = undefined
   await req.user.save()
   res.send()
})


router.get('/users/:id/avatar', async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
           throw new Error('there is no user or Avatar in user field')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports =  router