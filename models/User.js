const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true, //공백처리
        unique: 1
    },
    password:{
        type: String,
        minlength: 5
    },
    lastname:{
        type: String,
        maxlength: 50
    },
    role:{ //유저 권한 구분
        type: Number,
        default: 0
    },
    image: String,
    token:{ // 유효성 관리
        type: String
    },
    tokenExp:{ // token 유효기간
        type: Number
    }
})


const User = mongoose.model('User', userSchema) // 모델로 스키마 감싸주기

module.exports = { User } // 다른 곳에서도 사용 가능