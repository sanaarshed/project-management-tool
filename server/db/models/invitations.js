"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Invitations extends Model {
    static associate(models) {
      // Define associations here, if any
      Invitations.belongsTo(models.Team, {
        foreignKey: "team_id",
      });
      Invitations.belongsTo(models.User, {
        foreignKey: "invited_by",
      });
    }
  }
  Invitations.init(
    {
      // Define the columns of your Invitation model
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      invited_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: "Invitations"
    }
  );
  return Invitations;
};
