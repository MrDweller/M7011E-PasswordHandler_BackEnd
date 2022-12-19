class ServerError{}

class EmailConformationNeeded extends ServerError {}

class InvalidToken extends ServerError {}

class NotFound extends ServerError {}

class WrongMasterPassword extends ServerError {}
  
class NoRowsEffectedInDb extends ServerError {}

class InternalServerError extends ServerError {}

module.exports = {
    ServerError: ServerError,

    EmailConformationNeeded: EmailConformationNeeded,
    InvalidToken: InvalidToken,
    NotFound: NotFound,
    WrongMasterPassword: WrongMasterPassword,
    NoRowsEffectedInDb: NoRowsEffectedInDb,
    InternalServerError: InternalServerError
}