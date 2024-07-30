const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: false
});

Expense.belongsTo(User, { foreignKey: userId });

module.exports = Expense;
