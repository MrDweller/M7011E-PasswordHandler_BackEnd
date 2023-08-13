'use strict';

const backEndHandler = require('../../backendHandler');

const ServerErrors = require('../../errors');

/**
 * Confirms the given ip of the user with the given token.
 *
 * body Ip Confirme a given ip (optional)
 * uname String The name that needs to be fetched.
 * emailToken Token 
 * no response value expected for this operation
 **/
exports.confirmIpUser = function (body, uname, emailToken) {
  return new Promise(function (resolve, reject) {
    console.log("emailToken " + emailToken);
    let userIP = body["ip"];
    backEndHandler.addIPtoDB(uname, emailToken, userIP, (result) => {
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }

      if (result == false) {
        reject(400);
        return;
      }
      if (result) {
        resolve(200);

      }
      else {
        reject(400);

      }
      

    });
  });
}


/**
 * Create user
 * This creates a new user, on signup.
 *
 * body User Created user object (optional)
 * no response value expected for this operation
 **/
exports.createUser = function (body) {
  return new Promise(function (resolve, reject) {
    let uname = body["uname"];
    let email = body["email"];
    let masterpwd = body["password"];
    let userIP = body["ip"];
    backEndHandler.addUser(uname, email, masterpwd, userIP, (result) => {
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.DuplicateEmail) {
        reject(471);
        return;
      }
      if (result instanceof ServerErrors.DuplicateUname) {
        reject(470);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }

      if (result == false) {
        reject(400);
        return;
      }
      if (result) {
        resolve(200);

      }
      else {
        reject(400);

      }
      if (result) {
        resolve();

      }
      else {
        reject();
      }
    })
  });
}


/**
 * Delete user
 * This can only be done by the logged in user.
 *
 * uname String The uname for the user
 * userToken Token 
 * no response value expected for this operation
 **/
exports.deleteUser = function (uname, userToken, admin_uname, admin_token, body) {
  return new Promise(function (resolve, reject) {
    let password = body["password"];
    backEndHandler.removeUser(uname, userToken, admin_uname, admin_token, password, (result) => {
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidLogin) {
        reject(401);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.NotFound) {
        reject(403);
        return;
      }
      if (result == false) {
        reject(400);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      resolve(200);
    });
  });
}


/**
 * Get user by user name
 * This can only be done by the logged in user.
 *
 * uname String The name that needs to be fetched.
 * userToken Token 
 * returns UserInfo
 **/
exports.getUserByName = function (uname, userToken) {
  return new Promise(function (resolve, reject) {
    backEndHandler.getUserInfo(uname, userToken, (result) => {
      console.log(result);
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.NoRowsEffectedInDb) {
        reject(403);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      resolve(result);
    })
  });
}


/**
 * Logs user, generating an access token for that user.
 *
 * body Authentication The password for login in clear text (optional)
 * uname String The user name for login
 * no response value expected for this operation
 **/
exports.loginUser = function (body, uname) {
  return new Promise(function (resolve, reject) {
    let masterpwd = body["password"];
    let userIP = body["ip"];
    backEndHandler.loginUser(uname, masterpwd, userIP, (result) => {
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.EmailConformationNeeded) {
        reject(401);
        return;
      }
      if (result instanceof ServerErrors.InvalidLogin) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.NotFound) {
        reject(403);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      console.log(result);
      let userToken = {"user-token": result};
      resolve(userToken);
    });

  });
}


/**
 * Logs out the user with the given token.
 *
 * uname String The name that needs to be fetched.
 * userToken Token 
 * no response value expected for this operation
 **/
exports.logoutUser = function (uname, userToken) {
  return new Promise(function (resolve, reject) {
    backEndHandler.cancelUserToken(uname, userToken, (result) => {
      console.log(result);
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result == false) {
        reject(400);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      resolve(200);
    })
  });
}


/**
 * Update user
 * This can only be done by the logged in user.
 *
 * body User Update an existent user (optional)
 * uname String uname for user to be updated
 * userToken Token 
 * no response value expected for this operation
 **/
exports.updateUser = function (body, uname, userToken) {
  return new Promise(function (resolve, reject) {
    let newUname = body["uname"];
    let newEmail = body["email"];
    let password = body["password"];
    let newPassword = body["newPassword"];
    backEndHandler.updateUser(uname, newUname, newEmail, password, newPassword, userToken, (result) => {
      if (result instanceof ServerErrors.InvalidLogin) {
        reject(401);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.DuplicateEmail) {
        reject(471);
        return;
      }
      if (result instanceof ServerErrors.DuplicateUname) {
        reject(470);
        return;
      }
      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }

      resolve(200);

    });
  });
}

exports.getUname = function(identification) {
  return new Promise(function (resolve, reject) {
    console.log(identification);
    backEndHandler.readUserName(identification, (result) => {
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.NotFound) {
        reject(404);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }

      let response = {
        "uname": result
      }
      resolve(response);
    });

  });
}

exports.uploadPFP = function(uname, user_token) {
  return new Promise(function (resolve, reject) {
    backEndHandler.uploadPFP(uname, user_token, (result) => {
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
  
      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }

      resolve(result);
    });

  });
}

exports.getPFP = function(uname, user_token) {
  return new Promise(function (resolve, reject) {
    backEndHandler.getPFP(uname, user_token, (result) => {
      console.log(result);
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
  
      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
  
      let response = {
        "pfpURL": result
      }
      resolve(response);
    });

  });
}