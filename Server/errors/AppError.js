export default class AppError extends Error {
    status;

    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode === 500 ? "error" : "failure";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}