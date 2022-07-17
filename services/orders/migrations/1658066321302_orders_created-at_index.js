/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createIndex('orders', 'created_at');
};

exports.down = pgm => {
    pgm.dropIndex('orders', 'created_at');
};
