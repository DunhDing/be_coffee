import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ErrorCodes } from '../constants/error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse();
        const request = context.getRequest();

        if (!(exception instanceof HttpException)) {
            console.error('Unhandled exception:', exception);
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            const responseBody =
                typeof exceptionResponse === 'string'
                    ? { message: exceptionResponse }
                    : (exceptionResponse as { message?: string | string[]; code?: string });

            const message =
                responseBody.message ?? exception.message;

            const code =
                responseBody.code ??
                (status === HttpStatus.BAD_REQUEST
                    ? ErrorCodes.BAD_REQUEST
                    : status === HttpStatus.UNAUTHORIZED
                        ? ErrorCodes.UNAUTHORIZED
                        : status === HttpStatus.FORBIDDEN
                            ? ErrorCodes.FORBIDDEN
                            : status === HttpStatus.NOT_FOUND
                                ? ErrorCodes.NOT_FOUND
                                : status === HttpStatus.CONFLICT
                                    ? ErrorCodes.CONFLICT
                                    : ErrorCodes.INTERNAL_SERVER_ERROR);

            response.status(status).json({
                statusCode: status,
                code,
                message,
                path: request.url,
                timestamp: new Date().toISOString(),
            });

            return;
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}