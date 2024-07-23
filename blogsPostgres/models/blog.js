const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Blog extends Model {}

Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0  // Changed 'default' to 'defaultValue'
  },
  yearWritten: {
    type: DataTypes.INTEGER,
    defaultValue: 1991,
    validate: {
      max: {
        args: [2024],
        msg: "Max year is the current year."
      },
      min: {
        args: [1992],
        msg: "Min year is 1991"
      }
  }

  }
}, {
  sequelize,
  underscored: true,
  modelName: 'blog'
})

module.exports = Blog