import express from 'express'
import { Create, DeleteBlog, GetPosts, update } from '../controllers/Blog.js'
import { upload } from '../middleware/Multer.js'

const BlogRoutes= express.Router()


BlogRoutes.post('/create',upload.single('postimg'),Create)
BlogRoutes.patch('/update/:id',upload.single('postimg'),update)
BlogRoutes.get('/GetPosts',GetPosts)
BlogRoutes.delete('/delete/:id',DeleteBlog)





export default BlogRoutes