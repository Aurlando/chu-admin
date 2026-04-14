// const pool = require('../config/db');

// async function findUserByUsername(username) {
//     const result = await pool.query(
//         "SELECT * FROM ref.auth_user WHERE username = $1",
//         [username]
//     )

//     return result.rows[0];
// }

// module.exports = {
//     findUserByUsername,
// }

// server/src/models/authModels.js — APRÈS (Prisma)
const prisma = require('../config/prisma');

async function findUserByUsername(username) {
    return prisma.auth_user.findUnique({
        where: { username }
    });
}

module.exports = { 
    findUserByUsername 
};