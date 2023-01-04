# M7011E-PasswordHandler_BackEnd
A secure password handler, that can store your passwords in a sql database. All passwords will be encrypted and to access them a master password will be used.

## Prerequisites
The code was developed with the folowing programs and versions,

- node v16.17.0
- npm 8.15.0

Any later version sould also work.

# Database
The backend requires a mysql database to be started and working.
In your mysql database create a database called password_handler and import the *password_handler.sql* file.
The database comes with a super admin, where the username is *admin* and the password is *12345*, a valid email must manually be entred.

## Installation
Clone the repo then in the *password-handler-back-end* folder run,

```
npm install
```

## Running
In the *password-handler-back-end* folder run the command,
```
npm start
```

## Config
To change the address and port of the backend, open the *config.js* file located in *password-handler-back-end/src*.
In the config file, the settings for your database must be entered. 
Valid settings for s3 storage must also be entered in the config file, inorder for profile pictures to work.
