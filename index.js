const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const User = require('./user')

require('dotenv').config();

// Accede a las variables de entorno
const dbPassword = process.env.DB_PASSWORD;
const dbUser = process.env.DB_USER;

//conexion db
try {
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.rihd75b.mongodb.net/auth?retryWrites=true&w=majority`)
    console.log('Conexión a la base de datos exitosa');
} catch (error) {
    console.error('Error al conectar a la base de datos:', error)
}

const app = express()

app.use(express.json())

app.post('/register', async (req, res) => {
    const {body} = req
    console.log({body})
    try{
        
        const isUser = await User.findOne({email: body.email})
        if(isUser){
            console.log('existe')
            return res.status(403).send('User exist')
        }else{
            console.log('entro a crear')
            const salt = await bcrypt.genSalt()
            console.log(salt)
            const hashed = await bcrypt.hash(body.password, salt)
            console.log(hashed)
            const user = await User.create({email: body.email, password: hashed, salt})
        
            res.send({_id: user._id})
        }

    }catch (err){
        res.status(500).send(err.message)
    }
})

app.listen(3000, () => {
    console.log('Iniciando el servidor, port 3000')
})