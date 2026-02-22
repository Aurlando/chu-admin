require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes')

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running at PORT ${process.env.PORT}`);
})