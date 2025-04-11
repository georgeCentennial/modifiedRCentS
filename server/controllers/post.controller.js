import Post from '../models/post.model.js'
import extend from 'lodash/extend.js'
import errorHandler from './error.controller.js'

const create = async (req, res) => { 
    const post = new Post(req.body) 
    try {
        await post.save()
        return res.status(200).json({ 
            post
        })
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err) 
        })
    } 
}

const list = async (req, res) => { 
    try {
        let posts = await Post.find().select('userId content created updated')
        .populate('userId', 'lastname firstname username')
        .sort({created: -1})
        res.json(posts)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err) 
        })
    } 
}

const postByID = async (req, res, next, id) => { 
    try {
        let post = await Post.findById(id)
        if (!post)
            return res.status(400).json({ 
                error: "post not found"
            })
        req.post = post
        next()
    } catch (err) {
        return res.status(400).json({ 
        error: "Could not retrieve post"
        }) 
    }
}

const read = (req, res) => {
    req.post.hashed_password = undefined 
    req.post.salt = undefined
    return res.json(req.post) 
}

const update = async (req, res) => { 
    try {
        let post = req.post
        post = extend(post, req.body) 
        post.updated = Date.now() 
        await post.save()
        post.hashed_password = undefined     
        post.salt = undefined             
        res.json(post) 
    } catch (err) {
        return res.status(400).json({
        error: errorHandler.getErrorMessage(err) 
        })
    } 
}

const remove = async (req, res) => { 
    try {
        let post = req.post
        let deletedPost = await post.deleteOne() 
        deletedPost.hashed_password = undefined
        deletedPost.salt = undefined
        res.json(deletedPost)
    } catch (err) {
        return res.status(400).json({
        error: errorHandler.getErrorMessage(err) 
        })
    } 
}

// New function to remove multiple contacts
const removeMany = async (req, res) => {
    const { ids } = req.body; // Assuming IDs are sent in the request body
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            error: "Please provide an array of IDs to delete."
        });
    }
    try {
        const result = await Post.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({
            message: `${result.deletedCount} post successfully deleted!`
        });
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

//is post by user
const isOwner = (req, res, next) => {
    const authorized = req.post && req.auth && req.auth._id == req.post.userId;
    if (!authorized) {
        return res.status(403).json({ error: "User is not authorized" });
    }
    next();
}

const postsByUser = async (req, res)  => {
    const {userId} = req.params;
    try {
        let posts = await Post.find({ userId }).select('userId content created updated')
        .populate('userId', 'lastname firstname username')
        .sort({created: -1})
        res.json(posts)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err) 
        })
    } 
}

export default { create, postByID, read, list, remove, removeMany, update, isOwner, postsByUser }
