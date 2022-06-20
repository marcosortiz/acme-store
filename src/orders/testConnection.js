import config from 'config';
import { Sequelize } from 'sequelize'

const HOST     = config.get("aurora.host");
const PORT     = config.get("aurora.port");
const DATABASE = 'postgres'
const USERNAME = config.get("aurora.username");
const PASSWORD = config.get("aurora.password");

const sequelize = new Sequelize(`postgres://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`, {
    logging: false
});

try {
  await sequelize.authenticate();
  console.log(`Successfully connected to postgres.`);
} catch (error) {
  console.error('Unable to connect to the database:', error);
} finally {
    process.exit();
}



