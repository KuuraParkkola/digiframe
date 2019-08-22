
exports.up = function(knex) {
    return knex.schema.createTable('images', table => {
        table.increments('id').primary();
        table.string('title', 32).notNullable();
        table.string('album', 32).notNullable();
        table.string('path', 128).notNullable().unique();
        table.integer('index').notNullable();
        table.integer('width').notNullable();
        table.integer('height').notNullable();
        table.string('type', 16).notNullable();
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('images');
};
