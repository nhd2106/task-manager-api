const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})









// const myTask  = new Task({
//     description: "learn basic javascript and reactjs"
// })

// myTask.save().then(()=>[
//     console.log("Success!", myTask)
    
// ]).catch((error)=>{
//     console.log("Error!", error);
    
// })