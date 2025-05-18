import { Sequelize } from "sequelize";
import db from "../config/database.js";

// Membuat tabel "user"
const User = db.define(
  "user", // Nama Tabel
  {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    gender: Sequelize.STRING,
    password: Sequelize.STRING,
    refresh_token: Sequelize.TEXT
  },{
    freezeTableName :true
  }
);

db.sync().then(() => console.log("Note Model synced"));

export default User;
