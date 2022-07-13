/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {

  pgm.createTable('orders', {
    id: 'id',
    username: { type: 'varchar(100)', notNull: true },
    details: { type: 'json', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
  pgm.createIndex('orders', 'username')
};

exports.down = pgm => {
  pgm.dropTable('orders', {});
};
