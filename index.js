import express, { text } from 'express'
import mongoose from 'mongoose'
import usersModel from './model/user.js';
import postsModel from './model/post.js';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { listApiKey } from './data.js';

dotenv.config();
await mongoose.connect(process.env.MONGODB_URL)

const app = express();
app.use(express.json())

const saltRound = 10;

//Cau 1: Dang ky
app.post('/users/register', async (req, res)=>{
    try{
        const {userName, email, password} = req.body; 
        if(!userName || !email || !password){
            throw new Error('userName, email, or password is missing!')
        }
        const existedUser = await usersModel.findOne({
            email: email
        })
        if(existedUser) throw new Error('email has already been used')
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const createdUser = await usersModel.create({
            userName: userName,
            email: email,
            password: hashedPassword
        })
        res.status(201).send({
            message: 'Register successful!',
            data: createdUser
        })
    } catch(error){
        res.status(400).send({
            message: error.message,
            data: null
        })
    }
})

//Cau 2: Dang nhap
app.post('/users/login', async (req, res)=>{
    try{
        const {email, password} = req.body; 
        if(!email || !password){
            throw new Error('userName, email, or password is missing!')
        }
        const crrUser = await usersModel.findOne({
            email: email
        })
        if(!crrUser) throw new Error('email or password is invalid')
        const comparedPassword = bcrypt.compareSync(password, crrUser.password)
        if(!comparedPassword) throw new Error('Email or password is invalid')
        const findExistKey = listApiKey.findIndex((item) => String(item).includes(email) && String(item).includes(crrUser._id))
        if(findExistKey >= 0){
            listApiKey.splice(findExistKey, 1)
        }
        const randomString = crypto.randomUUID()
        const generateApiKey = `mern-$${crrUser._id}$-$${email}$-$${randomString}$`
        listApiKey.push(generateApiKey)
        res.status(201).send({
            message: 'Login successful!',
            data: listApiKey
        })
    } catch(error){
        res.status(400).send({
            message: error.message,
            data: null
        })
    }
})

//Cau 3: Tao post


app.post('/posts', async (req, res)=>{
    try{
        const {content} = req.body; 
        const apiKey = String(Object.values(req.query))
        let text = apiKey.split("-")[1]
        let result = text.slice(1, text.length - 1)
        if(!apiKey) throw new Error('Cannot validate user')
        const findApiKey = listApiKey.findIndex((item) => item == apiKey)
        if(findApiKey < 0) throw new Error('Cannot validate user')
        if(!content){
            throw new Error('Content is missing!')
        }
        const createdPost = await postsModel.create({
            userID: result,
            content: content
        })
        res.status(201).send({
            message: 'Post created successfully!',
            data: createdPost
        })
    } catch(error){
        res.status(400).send({
            message: error.message,
            data: null
        })
    }
})

//Cau 4: Update post
app.put('/posts:id', async (req, res)=>{
    try{
        const {content} = req.body; 
        const postID = String(Object.values(req.params))
        const apiKey = String(Object.values(req.query))
        // let text = apiKey.split("-")[1]
        // let result = text.slice(1, text.length - 1)
        if(!apiKey) throw new Error('Cannot validate user')
        const findApiKey = listApiKey.findIndex((item) => item == apiKey)
        if(findApiKey < 0) throw new Error('Cannot validate user')
        const crrPost = await postsModel.findOne({
            _id: postID
        })
        if(!crrPost) throw new Error('Cannot find post')
        if(!content){
            throw new Error('Content is missing!')
        }
        crrPost.content = content;
        crrPost.updatedAt = Date.now();
        await crrPost.save();
        res.status(201).send({
            message: 'Post updated successfully!',
            data: crrPost
        })
    } catch(error){
        res.status(400).send({
            message: error.message,
            data: null
        })
    }
})

app.listen(8080, ()=>{
    console.log('Server is running!')
})