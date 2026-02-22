const pool = require('../config/db');

async function findUserByUsername(username) {
    const result = await pool.query(
        "SELECT * FROM ref.auth_user WHERE username = $1",
        [username]
    )

    return result.rows[0];
}

module.exports = {
    findUserByUsername,
}