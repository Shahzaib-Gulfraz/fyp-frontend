// Export all models from a single file for easy imports
module.exports = {
    User: require('./User'),
    Shop: require('./Shop'),
    Product: require('./Product'),
    ProductVariant: require('./ProductVariant'),
    Order: require('./Order'),
    OrderItem: require('./OrderItem'),
    SavedItem: require('./SavedItem'),
    Chat: require('./Chat'),
    Message: require('./Message'),
    Review: require('./Review'),
    ShopStaff: require('./ShopStaff'),
    ARSession: require('./ARSession'),
    UserMeasurement: require('./UserMeasurement'),
    Notification: require('./Notification'),
    UserFollow: require('./UserFollow'),
    ShopFollow: require('./ShopFollow')
};
