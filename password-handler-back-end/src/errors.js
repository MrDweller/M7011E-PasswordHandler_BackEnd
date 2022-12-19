class ServerError{}

class EmailConformationNeeded extends ServerError {}

class InvalidToken extends ServerError {}

class NotFound extends ServerError {}

class WrongMasterPassword extends ServerError {}

class InvalidLogin extends ServerError {}
  
class NoRowsEffectedInDb extends ServerError {}

class InternalServerError extends ServerError {}

class DuplicateUname extends ServerError {}

class DuplicateEmail extends ServerError {}

module.exports = {
    ServerError: ServerError,

    EmailConformationNeeded: EmailConformationNeeded,
    InvalidToken: InvalidToken,
    NotFound: NotFound,
    WrongMasterPassword: WrongMasterPassword,
    InvalidLogin: InvalidLogin,
    NoRowsEffectedInDb: NoRowsEffectedInDb,
    InternalServerError: InternalServerError,
    DuplicateUname: DuplicateUname,
    DuplicateEmail: DuplicateEmail,
}