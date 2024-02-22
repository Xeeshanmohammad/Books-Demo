const express = require("express")
const app = express()
require("dotenv").config()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

// Database connection
const connectDB = require("./services/database")

//router functionality
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const bookRouter = require('./routes/bookRouter')

// Error-handling ==== Middleware
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(morgan("tiny"))
app.use('/api/v1/users',authRouter)
app.use('/api/v1/user',userRouter)
app.use('/api/v1/book',bookRouter)


app.get('/', (req,res)=>{
    res.send("<h2>Mind Blowing Projects<h2/>")
})

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5252

const start = async()=>{
    try {
        await connectDB()
      await  app.listen(port,()=>{
            console.log(`Server is listening on : ${port}`);
        })
    } catch (error) {
        console.log("oops! server error");
    }
}

start()