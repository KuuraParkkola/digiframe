const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './frame.db'
    },
    useNullAsDefault: true
});

module.exports = knex;