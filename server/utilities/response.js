// response.js

module.exports = {
    // Success responses
    ok: {
      statusCode: 200,
      message: 'OK',
    },
    created: {
      statusCode: 201,
      message: 'Created',
    },
    noContent: {
      statusCode: 204,
      message: 'No Content',
    },
    userRemovedFromTeam: {
      statusCode: 200,
      message: 'User removed from Team',
    },
    noTeamExists: {
      statusCode: 404,
      message: 'No team exists',
    },
    passwordChangedSuccessfully: {
      statusCode: 200,
      message: 'Password changed successfully',
    },
    fileNotUpload: {
      statusCode: 400,
      message: 'file Not upload!',
    },
    deleteProject:{
      message:'Project deleted successfully'
    },
    fileUploaded:{
      message: "File uploaded successfully."
    },
  
    // Client error responses
    badRequest: {
      statusCode: 400,
      message: 'Bad Request',
    },
    unauthorized: {
      statusCode: 401,
      message: 'Unauthorized',
    },
    forbidden: {
      statusCode: 403,
      message: 'Forbidden',
    },
    notFound: {
      statusCode: 404,
      message: 'Not Found',
    },
    conflict: {
      statusCode: 409,
      message: 'Conflict',
    },
    validationError: {
      statusCode: 422,
      message: 'Unprocessable Entity (Validation Error)',
    },
    tokenInvalid: {
      statusCode: 401,
      message: 'Token not valid!',
    },
    userAlreadyExists: {
      statusCode: 422,
      message: 'User already exists',
    },
    missingEmailAndPassword: {
      statusCode: 422,
      message: 'Must provide email and password',
    },
    fieldsMissing: {
      statusCode: 400,
      message: 'Required fields are missing',
    },
  
    // Server error responses
    internalServerError: {
      statusCode: 500,
      message: 'Internal Server Error',
    },
  };
  