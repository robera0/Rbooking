import Notification from "../model/notification.model.js";

class NotificationService {
    async getNotifications(recipient, limit = 10, page = 0) {
        try {
            return Notification.find({ recipient })
                .select("-token")
                .limit(limit)
                .skip(page * limit)
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new AppError(error.message);
        }
    }
}

export default NotificationService;