const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB bağlandı"))
  .catch(err => console.log(err));

module.exports = mongoose;

