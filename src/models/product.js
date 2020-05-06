const mongoose =  require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    idName: {
        type: String,
        required: true,
        trim: true
    },

    price :{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: Buffer
    }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product