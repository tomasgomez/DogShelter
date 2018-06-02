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
db.addEventListener('ready', (event) => {
    let is_updated = event.getVersion() != event.getOldVersion();
    if (isNaN(event.getOldVersion())) {
        console.log('new database created');
        db.put('admin', {
            name: 'admin',
            phone: '+55 (16) 25851253',
            photo: 'teste',
            email: 'admin@admin.com',
            password: 'admin'
        });
    } else if (is_updated) {
        console.log('database connected with new schema');
    } else {
        console.log('existing database connected');
    }
    // heavy database operations should start from this.
});

/* USEFUL FUNCTIONS */
function addProduct() {
    let name = $("#addProductInputName").val();
    let photo = $("#addProductInputPhoto").val();
    let desc = $("#addProductInputDescription").val();
    let rPrice = $("#addProductInputRetailPrice").val();
    let iQty = $("#addProductInputInventoryQuantity").val();
    let sQty = 0;

    $("#addProductInputName").val("");
    $("#addProductInputPhoto").val("");
    $("#addProductInputDescription").val("");
    $("#addProductInputRetailPrice").val("");
    $("#addProductInputInventoryQuantity").val("");

    db.put('product', {
        name: name,
        photo: photo,
        description: desc,
        retailPrice: rPrice,
        inventoryQty: iQty,
        qtySold: sQty
    }).then((key) => {
        console.log("Success adding product of id #" + key);
    }, (e) => {
        console.error(e.stack);
    });

    showProducts();
}

function showProducts() {
    let output = "";

    let iter = new ydn.db.ValueIterator('product');
    db.open((cursor) => {
        let v = cursor.getValue();
        output += "<li class='list-group-item' id='product-" + v.id + "'>";
        output += v.name;
        output += "<a onclick='removeProduct(" + v.id + ")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
        output += "<a onclick='editProduct(" + v.id + ")' href='#'><span class='mini glyphicon glyphicon-wrench'></span></a>";
        output += "</li>";
    }, iter, 'readonly').then(() => {
        // console.log("final res=" + output);
        $("#productList").html(output);
    });
}

function removeProduct(id) {
    db.remove('product', id).then((n) => {
        console.log(n.toString() + " records deleted with given id #" + id.toString());
        showProducts();
    }, (e) => {
        console.log(e.message);
    });
}

function editProduct(id) {
    $("#editProductForm").modal();

    db.get('product', id).then((record) => {
        //console.log("aquiii " + JSON.stringify(record));
        $("#editProductInputID").val(record.id);
        $("#editProductInputName").val(record.name);
        $("#editProductInputPhoto").attr("curphoto", record.photo);
        $("#editProductInputDescription").val(record.description);
        $("#editProductInputRetailPrice").val(record.retailPrice);
        $("#editProductInputInventoryQuantity").val(record.inventoryQty);
        $("#editProductInputQuantitySold").val(record.qtySold);
    });
}

function saveProductChanges() {
    console.log("Saving product changes...")
    photo = $("#editProductInputPhoto").val();
    if (photo === "") {
        photo = $("#editProductInputPhoto").attr("curphoto");
    }

    db.put('product', {
        id: parseInt($("#editProductInputID").val()),
        name: $("#editProductInputName").val(),
        photo: photo,
        description: $("#editProductInputDescription").val(),
        retailPrice: $("#editProductInputRetailPrice").val(),
        inventoryQty: $("#editProductInputInventoryQuantity").val(),
        qtySold: $("#editProductInputQuantitySold").val()
    }).then((key) => {
        console.log("Success editting product of id #" + key);
        $("#editProductForm").modal('toggle');
        showProducts();
    }, (e) => {
        console.error(e.stack);
    });
}