$(document).ready(() => {
    /* DEFINITION OF OBJECT STORES */

    /* Table 'Client'
     *   It's necessary to create at least 1 delivery address to 
     *   every new client which is added to the database
     */
    let client_store_schema = {
        name: 'client',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [{
            keyPath: 'name'
        }, {
            name: 'phone',
            multiEntry: true
        }, {
            name: 'photo'
        }, {
            keyPath: 'email'
        }, {
            name: 'password'
        }]
    };

    /* Table 'Admin'
     */
    let admin_store_schema = {
        name: 'admin',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [{
            keyPath: 'name'
        }, {
            name: 'phone',
            multiEntry: true
        }, {
            name: 'photo'
        }, {
            keyPath: 'email'
        }, {
            name: 'password'
        }]
    };

    /* Table 'Delivery Address'
     *   It's a child of 'Client'. This way, the primary key of a new delivery address
     *   must be linked to the primary key ('id') of ONLY 1 client.
     */
    let delivery_address_store_schema = {
        name: 'delivery-address',
        indexes: [{
            keyPath: 'postalCode'
        }, {
            name: 'streetName'
        }, {
            keyPath: 'streetNo'
        }, {
            keyPath: 'receiversName'
        }]
    };

    /* Table 'Pet'
     *   It's a child of 'Client'. This way, the primary key of a new pet
     *   must be linked to the primary key ('id') of ONLY 1 client.
     */
    let pet_store_schema = {
        name: 'pet',
        indexes: [{
            keyPath: 'name'
        }, {
            keyPath: 'breed'
        }, {
            name: 'photo'
        }, {
            keyPath: 'age'
        }]
    };

    /* Table 'Order'
     *   It's a child of 'Client'. This way, the primary key of a new order
     *   must be linked to the primary key ('id') of ONLY 1 client.
     */
    let order_store_schema = {
        name: 'order',
        indexes: [{
            keyPath: 'creditCardNo'
        }]
    };

    /* Table 'Order Service Line'
     */
    let order_service_line_store_schema = {
        name: 'order-service-line',
        keyPath: ['orderId', 'serviceID'],
        indexes: [{
            keyPath: 'salePrice'
        }, {
            keyPath: 'date'
        }, {
            keyPath: 'petID'
        }]
    };

    /* Table 'Order Product Line'
     */
    let order_product_line_store_schema = {
        name: 'order-product-line',
        keyPath: ['orderId', 'productID'],
        indexes: [{
            keyPath: 'salePrice'
        }, {
            keyPath: 'quantity'
        }]
    };

    /* Table 'Service'
     */
    let service_store_schema = {
        name: 'service',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [{
            keyPath: 'name'
        }, {
            name: 'photo',
            multiEntry: true
        }, {
            name: 'description'
        }, {
            keyPath: 'retailPrice'
        }]
    };

    /* Table 'Product'
     */
    let product_store_schema = {
        name: 'product',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [{
            keyPath: 'name'
        }, {
            name: 'photo',
            multiEntry: true
        }, {
            name: 'description'
        }, {
            keyPath: 'retailPrice'
        }, {
            keyPath: 'inventoryQty'
        }, {
            keyPath: 'qtySold'
        }]
    };

    /* DEFINITION OF DATABASE SCHEMA */
    let schema = {
        // auto-versioning activated by not defining a version number
        stores: [
            client_store_schema,
            admin_store_schema,
            delivery_address_store_schema,
            pet_store_schema,
            order_store_schema,
            order_service_line_store_schema,
            order_product_line_store_schema,
            service_store_schema,
            product_store_schema
        ]
    };

    /* INITIALIZING DATABASE */
    db = new ydn.db.Storage('dogshelter', schema);
    db.getSchema(function (schema) {
        console.log(schema);
    });
});