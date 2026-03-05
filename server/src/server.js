require('dotenv').config();

const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["content-Type", "Authorization"],
    methods: ["GET", "POST"]
}))
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/staff', staffRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running at PORT ${process.env.PORT}`);
})