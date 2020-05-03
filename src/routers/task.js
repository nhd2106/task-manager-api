const express =  require('express');
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


router.post('/tasks',auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

    // task.save().then(()=>{
    
    //     res.status(201).send(task)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // })
})
// GET /tasks?completed=false
// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt_
router.get('/tasks',auth,async (req,res) => {
        const match = {}
        const sort = {}
        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }

        if(req.query.sortBy) {
            const parts =  req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc'? -1 : 1
             
        }
        try {
            //method 1
            // const tasks = await Task.find({owner: req.user._id})
            // res.status(200).send(tasks)
            // method 2
            await req.user.populate({
                path: 'tasks', 
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                }
            }).execPopulate()
            res.status(200).send(req.user.tasks)
           
        } catch (error) {
            res.status(500).send()
        }
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((err)=>{
    //     res.status(404).send(err)
    // })
})

router.get('/tasks/:id', auth ,async (req,res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner:req.user._id})
        if(!task){
          return  res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }

    // Task.findById(_id).then((task) => {
    //     if(!task){
    //        return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch(() => {
    //     res.status(500).send()
    // })
})
router.patch('/tasks/:id',auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdates = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidUpdates){
        return res.status(400).send({error:'Invalid updates'})
    }
    const _id = req.params.id
    try {
        // const task = await Task.findByIdAndUpdate(_id, req.body, {runValidators: true, new: true})
        // const task = await Task.findById(_id);
        const task= await Task.findOne({_id, owner:req.user._id})
      
        if(!task){
           return res.status(404).send()
        }
        updates.forEach((update) =>  task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})
// -----------Delete Task
router.delete('/tasks/:id' ,auth, async (req,res)=> {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
        if(!task){
           return res.status(404).send({error: 'Task not found'})
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router