const cds = require('@sap/cds');

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    const { Products } = this.entities;

    // This code runs BEFORE a new product is created or updated
    this.before(['CREATE', 'UPDATE'], Products, (req) => {
      const product = req.data;

      // Rule: Stock cannot be negative
      if (product.stock < 0) {
        return req.error(400, `Stock quantity for '${product.title}' cannot be less than 0!`);
      }

      // Rule: Price must be greater than 0
      if (product.price <= 0) {
        return req.error(400, `Price for '${product.title}' must be greater than 0!`);
      }
    });

    return super.init();
  }
}