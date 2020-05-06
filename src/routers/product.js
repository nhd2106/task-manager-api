const express = require('express');
const router = new express.Router();
const Product = require('../models/product')

const sharp = require('sharp')
const multer = require('multer')

const upload = multer({
    limits:{
        fileSize: 2000000
    },
    fileFilter(req,file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be an image'))
        }
        cb(undefined, true)
    }
})

// create new product

router.post('/products', async(req,res)=>{
    const product= new Product(req.body);
    
    try {
        await product.save()
        res.status(201).send(product)
        
    } catch(error){
        res.status(400).send(error)
        
    }
})
router.post('/products/:id',upload.single('image'), async (req,res)=>{
    const idName = req.params.id
    try {
        const product = await Product.findOne({idName})
        if(!product){
            return res.status(404).send()
        }
    
        const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
        product.image = buffer
        await product.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }

    // product.image = buffer
})
router.get('/products/:id',async(req,res)=>{
    const idName = req.params.id

    try {
        const product= await Product.findOne({idName})
        if(!product){
            return res.status(404).send()
        }
        res.send(product)
    } catch (error) {
        res.status(500).send()
    }
})


module.exports = router