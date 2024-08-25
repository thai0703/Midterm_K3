import express from 'express'
import mongoose from 'mongoose'
import usersModel from './model/user.js';
import postsModel from './model/post.js';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { error } from 'console';
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
        usersModel.push(createdUser)
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
        res.status(201).send({
            message: 'Login successful!',
            data: crrUser
        })
    } catch(error){
        res.status(400).send({
            message: error.message,
            data: null
        })
    }
})

//Cau 3: Tao post
// Ví dụ: /posts?apiKey=mern-$507f1f77bcf86cd799439011$-$nguyena@gmail.com$-$9bb4d-3b7d-4ad-9bdd-2d7dcb6d$
//Lấy apiKey t

app.post('/posts', async (req, res)=>{
    try{
        const {userID, content} = req.body; 
        if(!userID || !content){
            throw new Error('userId or content is missing!')
        }
        const createdPost = await postsModel.create({
            userID: userID,
            content: content
        })
        postsModel.push(createdPost)
        res.status(201).send({
            message: 'Post created successfully!',
            data: createdUser
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