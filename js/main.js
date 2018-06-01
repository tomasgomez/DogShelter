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
    let db = new ydn.db.Storage('dogshelter', schema);
    //addProduct('prod1', 'foto', 'este é um produto legal', 5.2, 10, 0);
    //getProduct(10);
    //removeProduct(5);
    getProduct(18);
    updateProduct({
        id: 18,
        name: 'prodU',
        photo: 'fotoU',
        description: 'descU',
        retailPrice: 5.3,
        inventoryQty: 11,
        qtySold: 1
    });
    getProduct(18);

    /* USEFUL FUNCTIONS */
    function addProduct(name, photo, desc, rPrice, iQty, sQty) {
        db.put('product', {
            name: name,
            photo: photo,
            description: desc,
            retailPrice: rPrice,
            inventoryQty: iQty,
            qtySold: sQty
        }).then((key) => {
            console.log(key);
        }, (e) => {
            console.error(e.stack);
        });
    }

    function updateProduct(value) {
        // let iter = new ydn.db.KeyIterator('product', new ydn.db.KeyRange.only(id));
        // let req = db.open(function (icursor) {
        //     let product = icursor.getValue();
        //     product.description = 'updated';
        //     icursor.put(product).then(function (key) {
        //         console.log('product ' + key + ' got health boost');
        //     }, function (e) {
        //         console.log('deu ruim 1');
        //         throw e;
        //     });
        // }, iter, 'readwrite');
        // req.then(function () {
        //     console.log('committed');
        // }, function (e) {
        //     console.log('deu ruim 2');
        //     throw e;
        // });

        // db.get('product', id).then((record) => {
        //     record.description = 'updated';
        //     db.put('product', record);
        // }, (e) => {
        //     console.log(e.message);
        // });

        db.put('product', value);
    }

    function getProduct(id) {
        db.get('product', id).then((record) => {
            console.log(record);
            return record;
        }, (e) => {
            console.log(e.message);
        });
    }

    function removeProduct(id) {
        db.remove('product', id).then((n) => {
            console.log(n.toString() + " records deleted with given id #" + id.toString());
        }, (e) => {
            console.log(e.message);
        });
    }
});