const app = require('./app');
const connectDB = require('./db/connect')
require('dotenv').config()




const port = 4000

const start = async () => {

    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => console.log('server is running in port 4000... '))
    } catch (error) {
        console.log(error)
    }
    
}


start()