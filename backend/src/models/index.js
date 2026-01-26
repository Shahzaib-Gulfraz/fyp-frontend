// Export all models from a single file for easy imports
module.exports = {
    User: require('./User'),
    Shop: require('./Shop'),
    Product: require('./Product'),
    ProductVariant: require('./ProductVariant'),
    Order: require('./Order'),
    OrderItem: require('./OrderItem'),
    SavedItem: require('./SavedItem'),
    Message: require('./Message'),
    Review: require('./Review'),
    Notification: require('./Notification'),
    UserFollow: require('./UserFollow'),
    ShopFollow: require('./ShopFollow')
};
