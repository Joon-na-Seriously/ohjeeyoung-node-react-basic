const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


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

userSchema.pre('save', function(next){ //mongoose에서 가져온 메소드, 괄호 안에 적힌 것을 하기전에 수행하는 작업
    const user = this;

    if(user.isModified('password')){
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else{
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // plainPassword 1234567    암호화된 비밀번호 $2b$10$cThCuJeQ5/Od0yV9kRutReAGzX9a5M0azgmj/labf57XwjBL0KW5O
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    const user = this;

    //jsonwebtoken을 이용해서 token을 생성하기
    const token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb){
    const user = this;

    // token을 decode
    jwt.verify(token, 'secretToken', function(err, decoded){
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })

}


const User = mongoose.model('User', userSchema) // 모델로 스키마 감싸주기

module.exports = { User } // 다른 곳에서도 사용 가능