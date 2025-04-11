import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import Template from './../template.js'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import postRoutes from './routes/post.routes.js'
import commentRoutes from './routes/comment.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CURRENT_WORKING_DIR = process.cwd()

const app = express()

// Apply middleware first
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API prefix handlers
app.use('/api', (req, res, next) => {
    console.log('API endpoint hit', req.body);
    req.url = req.originalUrl.replace('/api', '')
    next()
})

app.use('/auth', (req, res, next) => {
    console.log('Auth endpoint hit', req.body);
    req.url = req.originalUrl.replace('/auth', '')
    next()
})

// Serve static files from dist
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

// Define routes
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', postRoutes)
app.use('/', commentRoutes)

// Production mode static file serving
if (process.env.NODE_ENV === 'production') {
    // Use proper path for client build in Vercel environment
    app.use(express.static(path.join(__dirname, '../client/dist')))
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
    })
} else {
    // Development mode template
    app.get('/', (req, res) => {
        res.status(200).send(Template())
    })
}

// Error handling middleware should be last
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({"error" : err.name + ": " + err.message}) 
    } else if (err) {
        res.status(400).json({"error" : err.name + ": " + err.message}) 
        console.log(err)
    } 
})
    
export default app