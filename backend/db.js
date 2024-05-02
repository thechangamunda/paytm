const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:BdWgJVYRvrSk7WV5@cluster0.qm6kbox.mongodb.net/paytm');


const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true, minLength: 6},
});

const accountSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    balance: {type: Number, required: true}
})

const User = mongoose.model('User', userSchema);

const Account = mongoose.model('Account', accountSchema);

module.exports = {
    User: User,
    Account: Account
};

