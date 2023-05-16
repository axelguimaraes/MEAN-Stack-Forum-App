const mongoose = require("mongoose");
const mongoUser = require("../models/user")
const jwt = require("jsonwebtoken")
const config = require("../jwt/config")
const bcrypt = require("bcryptjs")

let authController = {}

authController.submittedLogin = function(req, res, next) {
    const emailInput = req.body.email
    const passwordInput = req.body.password

    mongoUser.findOne({email:emailInput})
        .then(function(user){
            bcrypt.compare(passwordInput, user.password)
                .then(function(result){
                    if (result === true) {
                        const authToken = jwt.sign({email: user.email}, config.secret, {expiresIn: 86400 })
                        res.cookie('auth-token', authToken, {maxAge: 82000})
                        res.redirect("/")
                    } else {
                        res.redirect("/auth/login")
                    }
                })
        })
        .catch(function(err){
            next(err)
        })
}

authController.login = function(req, res, next) {
    res.render('login/index')
}

authController.logout = function(req, res, next) {
    res.clearCookie('auth-token')
    res.redirect('/')
};

authController.createLogin = function(req, res, next) {
    res.render('login/createUser')
};

authController.createLoginSubmitted = function(req, res, next) {
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword

    mongoUser.create(req.body)
        .then(function(){
            res.redirect('/')
        })
        .catch(function(err){
            next(err)
        })
};

authController.verifyLoginUser = function(req, res, next) {
    const authToken = req.cookies['auth-token']
    if (authToken){
        jwt.verify(authToken, config.secret, function(err, decoded) {
            req.userEmail = decoded
            next()
        })
    } else {
        res.redirect('/auth/login')
    }
}

module.exports = authController;