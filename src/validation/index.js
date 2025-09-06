exports.notificationValidation = (req, res, next) => {
    const { trackingNumber, chatId, type, waybillWeight, price, remark } = req.body;
    if (!trackingNumber || !chatId || !type ) {
        return res.status(400).json({ error: "Some fields are required" });
    }

    const typeOptions = [
        "_getMessageWarehouse",
        "_getMessageYiwu",
        "_getMessageUlugchat",
        "_getMessageOsh",
        "_getMessageTashkent",
        "_getMessageApproaching",
        "_getMessageDropZone",
        "_getMessageDelivered",
        "_getMessagePaymentPending",
        "_getMessagePriceChanged",
        "_getMessageProhibitedItem",
    ];

    if (!typeOptions.includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }
    next();
};