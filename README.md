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
Clone the repo then in the terminal navigate to *password-handler-back-end* folder and run,

```
npm install
```

In the *password-handler-back-end* folder run the following command in the terminal,
```
$ touch .env
```
   
Add this code to your .env file

Valid settings for Amazon S3 Cloud Storage if you want to import icons and profile pictures accordingly:

```
AWS_ACCESS_KEY_SECRET=Required
AWS_ACCESS_KEY=Required
```

Valid settings for mail serivice

```
EMIAL_HOST_PASSWORD=Required
```

## Config
To change the address and port of the backend, open the *config.js* file located in *password-handler-back-end/src*.
In the config file, the settings for your database must be entered. 
Valid settings for s3 storage must also be entered in the config file, inorder for profile pictures to work.
Also enter valid mail setting, this can be done by following [these instructions](https://support.google.com/accounts/answer/185833?hl=en).

## Running
In the *password-handler-back-end* folder run the command,
```
npm start
```
