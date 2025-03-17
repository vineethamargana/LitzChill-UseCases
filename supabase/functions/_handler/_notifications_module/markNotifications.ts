import { isValid, V4 } from "@V4";
import { markNotificationsAsReadQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import Logger from "@shared/Logger/logger.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";

/**
 * Marks a notification as read.
 * 
 * @param {Request} req - The request object containing the request details.
 * @param {Record<string, string>} params - The parameters from the URL, including the notification ID.
 * @returns {Promise<Response>} A promise that resolves to a success or error response based on the operation.
 */
export default async function markNotification(_req: Request, params: Record<string, string>, markNotificationsAsRead = markNotificationsAsReadQuery): Promise<Response> {
    const logger = Logger.getInstance();
    try {
        const notification_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.MISSING_ID);
        const user_id = params.user_id;
        
        logger.info(`User_id: ${user_id}, Notification_id: ${notification_id}`);

        const isSuccessful = await markNotificationsAsRead(notification_id,user_id);
        logger.info(`Marking result: ${JSON.stringify(isSuccessful)}`);
        if (!isSuccessful) {
            logger.info("Marking failed");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, NOTIFICATION_ERRORS.FAILED_TO_UPDATE);
        }

        // Return a success response
        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATION_UPDATED);
        
    } catch (error) {
        logger.error("Error marking notification:"+ error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
