import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const { Schema } = mongoose;


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Do not return password by default
    },
    img: {
        type: String,
        required: false,
    },
    country : {
        type: String,
        required: false,
    },
    desc: {
        type: String,   
        required: false,
    },
    isSeller: {
        type: Boolean,
        default: false,
    },}, {timestamps: true}
);

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {  
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


export const User = mongoose.model('User', userSchema);