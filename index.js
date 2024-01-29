const express = requiere('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jwt')
const expressJwt = require('express-jwt')

//conexion db
try {
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.rihd75b.mongodb.net/auth?retryWrites=true&w=majority`)
    console.log('Conexión a la base de datos exitosa');
} catch (error) {
    console.error('Error al conectar a la base de datos:', error)
}

const app = express()

app.use(express.json())