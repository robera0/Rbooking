import NotificationService from "Server/services/notification.service";

const notificationService = new NotificationService();

export const getNotifications = async (req, res) => {
    const { id } = req.user;

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const notifications = await notificationService.getNotifications(id, limit, page);

    return res.status(200).json({
        status: "success",
        message: "Notifications retrieved successfully",
        data: notifications,
    });
};