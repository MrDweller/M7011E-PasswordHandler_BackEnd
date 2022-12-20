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
exports.confirmIpAdmin = function(body,uname,emailToken) {
  return new Promise(function(resolve, reject) {
    let ip = body["ip"];

    backEndHandler.confirmIpAdmin(uname, emailToken, ip, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }

      if (result !== true) {
        reject(500);
        return;
      }
      resolve(200);

    });

  });
}


/**
 * Create admin
 * This creates a new user, on signup.
 *
 * body UserInfo Created admin object (optional)
 * superAdminToken Token 
 * no response value expected for this operation
 **/
exports.createAdmin = function(body, super_admin_uname, super_admin_token) {
  return new Promise(function(resolve, reject) {
    let uname = body["uname"];
    let email = body["email"];
    let ip = body["ip"];
    backEndHandler.createAdmin(super_admin_uname, super_admin_token, uname, email, ip, (result) => {
      if (result instanceof ServerErrors.EmailConformationNeeded) {
        reject(401);
        return;
      }
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.DuplicateUname) {
        reject(470);
        return;
      }
      if (result instanceof ServerErrors.DuplicateEmail) {
        reject(471);
        return;
      }

      if (result !== true) {
        reject(500);
        return;
      }
      resolve(201);

    });
  });
}

exports.addAdminPassword = function(body, uname, email_token) {
  return new Promise(function(resolve, reject) {
    let password = body["password"];
    backEndHandler.addAdminPassword(uname, email_token, password, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }

      if (result !== true) {
        reject(500);
        return;
      }
      resolve(200);

    });
  });
}

/**
 * Delete admin
 * This can only be done by the logged in user.
 *
 * uname String The uname for the user
 * adminToken Token  (optional)
 * superAdminToken Token  (optional)
 * no response value expected for this operation
 **/
exports.deleteAdmin = function(uname,adminToken, super_admin_uname, super_admin_token) {
  return new Promise(function(resolve, reject) {
    backEndHandler.deleteAdmin(uname, adminToken, super_admin_uname, super_admin_token, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }

      if (result !== true) {
        reject(500);
        return;
      }
      resolve(200);
    });
  });
}


/**
 * Get admin by user name
 * This can only be done by the logged in user.
 *
 * uname String The name that needs to be fetched.
 * adminToken Token 
 * returns UserInfo
 **/
exports.getAdminByName = function(uname, adminToken) {
  return new Promise(function(resolve, reject) {
    backEndHandler.getAdminInfo(uname, adminToken, (result) => {
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


/**
 * Logs in admin, generating an access token for that admin.
 *
 * body Authentication The password for login in clear text (optional)
 * uname String The user name for login
 * no response value expected for this operation
 **/
exports.loginAdmin = function(body,uname) {
  return new Promise(function(resolve, reject) {
    let password = body["password"];
    let ip = body["ip"];
    backEndHandler.loginAdmin(uname, password, ip, (result) => {
      if (result instanceof ServerErrors.EmailConformationNeeded) {
        reject(401);
        return;
      }
      if (result instanceof ServerErrors.InvalidLogin) {
        reject(403);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      let response = {
        "admin-token": result
      }
      resolve(response);
    });
  });
}


/**
 * Logs out the admin with the given token.
 *
 * uname String The name that needs to be fetched.
 * adminToken Token 
 * no response value expected for this operation
 **/
exports.logoutAdmin = function(uname,adminToken) {
  return new Promise(function(resolve, reject) {
    backEndHandler.cancelAdminToken(uname,adminToken, (result) => { 
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }

      if (result !== true) {
        reject(500);
        return;
      }

      resolve(200);
    });

  });
}


/**
 * Update admin
 * This can only be done by the logged in user.
 *
 * body User Update an existent user (optional)
 * uname String uname for user to be updated
 * adminToken Token 
 * no response value expected for this operation
 **/
exports.updateAdmin = function(body,uname,adminToken) {
  return new Promise(function(resolve, reject) {
    let newUname = body["uname"];
    let newEmail = body["email"];
    let password = body["password"];
    let newPassword = body["newPassword"];
    backEndHandler.updateAdmin(uname, newUname, newEmail, password, newPassword, adminToken, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
      }
      if (result instanceof ServerErrors.InvalidLogin) {
        reject(403);
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      if (result !== true) {
        reject(500);
        return;
      }
      resolve(200);

    });
  });
}

