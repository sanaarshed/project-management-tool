"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    static associate(models) {
      // Define associations here, if any
      File.belongsTo(models.Task, {
        foreignKey: "task_id",
      });
    }
  }
  File.init(
    {
      // Define the columns of your File model
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "File",
    }
  );
  return File;
};
