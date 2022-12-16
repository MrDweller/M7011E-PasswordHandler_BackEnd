class ServerError{}

class EmailConformationNeeded extends ServerError {}

class InvalidToken extends ServerError {}
  
class NoRowsEffectedInDb extends ServerError {}

class InternalServerError extends ServerError {}

module.exports = {
    ServerError: ServerError,

    EmailConformationNeeded: EmailConformationNeeded,
    InvalidToken: InvalidToken,
    NoRowsEffectedInDb: NoRowsEffectedInDb,
    InternalServerError: InternalServerError
}