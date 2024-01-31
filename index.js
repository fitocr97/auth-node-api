const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {expressjwt:expressJwt} = require('express-jwt');
const User = require('./user');

require('dotenv').config();

// Accede a las variables de entorno
const dbPassword = process.env.DB_PASSWORD;
const dbUser = process.env.DB_USER;
const stringSecreto = process.env.JWT_STRING;

// Conexion a la base de datos
try {
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.rihd75b.mongodb.net/auth?retryWrites=true&w=majority`);
    console.log('Conexión a la base de datos exitosa');
} catch (error) {
    console.error('Error al conectar a la base de datos:', error);
}

const app = express();

app.use(express.json());
//validar si esta logueado
const validateJWT = expressJwt({ secret: stringSecreto, algorithms: ['HS256'] }); // Middleware
//token loguear
const signToken =  _id => jwt.sign({ _id }, stringSecreto);

//registrar un usuario en la bd
app.post('/register', async (req, res) => {
    const {body} = req
    console.log({body})
    try{
        
        const isUser = await User.findOne({email: body.email})
        if(isUser){
            console.log('el usuario ya existe')
            return res.status(403).send('User exist')
        }else{
            const salt = await bcrypt.genSalt()
            const hashed = await bcrypt.hash(body.password, salt)
            const user = await User.create({email: body.email, password: hashed, salt})
            const signed = signToken(user._id)
        
            //res.send({_id: user._id}) //devolver el id del user
            res.send(signed)
        }

    }catch (err){
        res.status(500).send(err.message)
    }
})

//login
app.post('/login', async (req, res) => {
    const { body } = req
    try {
        const user = await User.findOne({email: body.email})
        if (!user) {
            res.status(403).send('usuario y/o contraseña incorrecto')
        }else{
            const isMatch = await bcrypt.compare(body.password, user.password)
            if (isMatch) {
                const signed = signToken(user._id)
                res.status(200).send(signed)
            }else{
                res.status(403).send('usuario y/o contraseña incorrecto')
            }
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//
const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id)
        if(!user){
            return res.status(401).end() //jwt invalido
        }
        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

const isAuthenticated = express.Router().use(validateJWT, findAndAssignUser)

//validar jwt y autorizacio funciona
/*
app.get('/lele', validateJWT,(req, res, next) =>{
    console.log(validateJWT)
    console.log('lala' , req.auth)
    res.send('ok')
})*/


app.get('/lele', isAuthenticated, (req, res) =>{
    //throw new Error('errorrrrr) //error
    res.send(req.user)
})

//manejo errores (error request response next)  
app.use((err, req, res, next) =>{
    console.error('error nuevo')
    next(err)
})

app.use((err, req, res, next) =>{
    res.sen('Ha ocurrido un error') //se podria devolver un html  custom para mostrar
})


//servidor
app.listen(3000, () => {
    console.log('Iniciando el servidor, port 3000')
})