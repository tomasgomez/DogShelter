/* DEFINITION OF OBJECT STORES */

/* Table 'User'
 *   It's necessary to create at least 1 delivery address to 
 *   every new client which is added to the database
 */
let user_store_schema = {
  name: "user",
  keyPath: "id",
  autoIncrement: true,
  indexes: [{
      keyPath: "name"
    },
    {
      name: "phone",
      multiEntry: true
    },
    {
      name: "photo"
    },
    {
      keyPath: "email",
      unique: true
    },
    {
      name: "password"
    },
    {
      name: "role"
    }
  ]
};

/* Table 'Delivery Address'
 *   It's a child of 'User'. This way, the primary key of a new delivery address
 *   must be linked to the primary key ('id') of ONLY 1 client.
 */
let delivery_address_store_schema = {
  name: "delivery-address",
  indexes: [{
      keyPath: "postalCode"
    },
    {
      name: "streetName"
    },
    {
      keyPath: "streetNo"
    },
    {
      keyPath: "receiversName"
    }
  ]
};

/* Table 'Pet'
 *   It's a child of 'User'. This way, the primary key of a new pet
 *   must be linked to the primary key ('id') of ONLY 1 client.
 */
let pet_store_schema = {
  name: "pet",
  indexes: [{
      keyPath: "name"
    },
    {
      keyPath: "breed"
    },
    {
      name: "photo"
    },
    {
      keyPath: "age"
    }
  ]
};

/* Table 'Order'
 *   It's a child of 'User'. This way, the primary key of a new order
 *   must be linked to the primary key ('id') of ONLY 1 client.
 */
let order_store_schema = {
  name: "order",
  indexes: [{
    keyPath: "creditCardNo"
  }]
};

/* Table 'Order Service Line'
 */
let order_service_line_store_schema = {
  name: "order-service-line",
  keyPath: ["orderId", "serviceID"],
  indexes: [{
      keyPath: "salePrice"
    },
    {
      keyPath: "date"
    },
    {
      keyPath: "petID"
    }
  ]
};

/* Table 'Order Product Line'
 */
let order_product_line_store_schema = {
  name: "order-product-line",
  keyPath: ["orderId", "productID"],
  indexes: [{
      keyPath: "salePrice"
    },
    {
      keyPath: "quantity"
    }
  ]
};

/* Table 'Service'
 */
let service_store_schema = {
  name: "service",
  keyPath: "id",
  autoIncrement: true,
  indexes: [{
      keyPath: "name"
    },
    {
      name: "photo",
      multiEntry: true
    },
    {
      name: "description"
    },
    {
      keyPath: "retailPrice"
    }
  ]
};

/* Table 'Product'
 */
let product_store_schema = {
  name: "product",
  keyPath: "id",
  autoIncrement: true,
  indexes: [{
      keyPath: "name"
    },
    {
      name: "photo",
      multiEntry: true
    },
    {
      name: "description"
    },
    {
      keyPath: "retailPrice"
    },
    {
      keyPath: "inventoryQty"
    },
    {
      keyPath: "qtySold"
    }
  ]
};

/* DEFINITION OF DATABASE SCHEMA */
let schema = {
  // auto-versioning activated by not defining a version number
  stores: [
    user_store_schema,
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
db = new ydn.db.Storage("dogshelter", schema);
db.addEventListener("ready", event => {
  let is_updated = event.getVersion() != event.getOldVersion();
  if (isNaN(event.getOldVersion())) {
    console.log("new database created");
    db.put("user", {
      name: "admin",
      phone: "+55 (16) 25851253",
      photo: "teste",
      email: "admin",
      password: "admin",
      role: "admin"
    });
  } else if (is_updated) {
    console.log("database connected with new schema");
  } else {
    console.log("existing database connected");
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

  db
    .put("product", {
      name: name,
      photo: photo,
      description: desc,
      retailPrice: rPrice,
      inventoryQty: iQty,
      qtySold: sQty
    })
    .then(
      key => {
        console.log("Success adding product of id #" + key);
      },
      e => {
        console.error(e.stack);
      }
    );

  showProducts();
}

function showProducts() {
  let output = "";

  let iter = new ydn.db.ValueIterator("product");
  db
    .open(
      cursor => {
        let v = cursor.getValue();
        output += "<li class='list-group-item' id='product-" + v.id + "'>";
        output += v.name;
        output +=
          "<a onclick='removeProduct(" +
          v.id +
          ")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
        output +=
          "<a onclick='editProduct(" +
          v.id +
          ")' href='#'><span class='mini glyphicon glyphicon-wrench'></span></a>";
        output += "</li>";
      },
      iter,
      "readonly"
    )
    .then(() => {
      $("#productList").html(output);
    });
}

function removeProduct(id) {
  db.remove("product", id).then(
    n => {
      console.log(
        n.toString() + " products deleted with given id #" + id.toString()
      );
      showProducts();
    },
    e => {
      console.log(e.message);
    }
  );
}

function editProduct(id) {
  $("#editProductForm").modal();

  db.get("product", id).then(record => {
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
  console.log("Saving product changes...");
  photo = $("#editProductInputPhoto").val();
  if (photo === "") {
    photo = $("#editProductInputPhoto").attr("curphoto");
  }

  db
    .put("product", {
      id: parseInt($("#editProductInputID").val()),
      name: $("#editProductInputName").val(),
      photo: photo,
      description: $("#editProductInputDescription").val(),
      retailPrice: $("#editProductInputRetailPrice").val(),
      inventoryQty: $("#editProductInputInventoryQuantity").val(),
      qtySold: $("#editProductInputQuantitySold").val()
    })
    .then(
      key => {
        console.log("Success editting product of id #" + key);
        $("#editProductForm").modal("toggle");
        showProducts();
      },
      e => {
        console.error(e.stack);
      }
    );
}

function addUser() {
  let fName = $("#registerInputFirstName").val();
  let lName = $("#registerInputLastName").val();
  let phone = $("#registerInputPhone").val();
  let photo = "TODO";
  let email = $("#registerInputEmail").val();
  let password = $("#registerInputPassword").val();

  $("#registerInputFirstName").val("");
  $("#registerInputLastName").val("");
  $("#registerInputPhone").val("");
  $("#registerInputEmail").val("");
  $("#registerInputPassword").val("");

  db
    .put("user", {
      name: fName + " " + lName,
      phone: phone,
      photo: photo,
      email: email,
      password: password,
      role: "client"
    })
    .then(
      key => {
        console.log("Success adding client of id #" + key);
        alert("Your account was created successfully.");

        //Log user in automatically
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("userRole", "client");
        changePage("client_profile.html");
      },
      e => {
        alert(
          "The given email is already being used! Please choose another one."
        );
        // console.error(e.stack);
      }
    );
}

function userLogin() {
  let userEmail = $("#loginInputEmail").val();
  let userPassword = $("#loginInputPassword").val();

  $("#loginInputEmail").val("");
  $("#loginInputPassword").val("");

  // Search for user email in client_table
  let key_range = ydn.db.KeyRange.only(userEmail);
  let success = false;
  let userInfo = null;
  db.values("user", "email", key_range).then(
    record => {
      if (record.length > 0) {
        if (record[0].password === userPassword) {
          console.log("Login was successful");
          success = true;
          userInfo = record[0];
        } else {
          alert("Wrong email or password!");
        }
      } else {
        alert("Wrong email or password!");
      }

      if (success) {
        console.log(JSON.stringify(userInfo));
        sessionStorage.setItem("userEmail", userEmail);
        sessionStorage.setItem("userRole", userInfo.role);
        if (userInfo.role === "client") {
          changePage("client_profile.html");
        } else {
          changePage("admin_profile.html");
        }
      }
    },
    function (e) {
      console.error("A wild error appears = " + e);
    }
  );
}

function showUsers() {
  let output = "";

  let iter = new ydn.db.ValueIterator("user");
  db
    .open(
      cursor => {
        let v = cursor.getValue();
        output += "<li class='list-group-item' id='user-" + v.id + "'>";
        output += v.name;
        output +=
          "<a onclick='removeUser(" +
          v.id +
          ")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
        output +=
          "<a onclick='editUserRole(" +
          v.id +
          ")' href='#'><span class='mini glyphicon glyphicon-wrench'></span></a>";
        output += "</li>";
      },
      iter,
      "readonly"
    )
    .then(() => {
      $("#userList").html(output);
    });
}

function editUserRole(id) {
  $("#editUserRoleModal").modal();

  db.get("user", id).then(record => {
    $("#editUserRoleInputID").val(record.id);
    $("#editUserRoleInputName").val(record.name);
    $("#editUserRoleInputEmail").val(record.email);
  });
}

function saveUserRoleChanges() {
  console.log("Saving user role changes...");

  let id = parseInt($("#editUserRoleInputID").val());
  let role = $('input[name=user-role]:checked', '#editUserRoleForm').val();
  role = (role === 'administrator' ? 'admin' : 'client');

  let iter = new ydn.db.ValueIterator('user', ydn.db.KeyRange.only(id));
  db.open((cursor) => {
    let user = cursor.getValue();
    console.log("Found this user with id #" + id + " = " + JSON.stringify(user));
    user.role = role;
    cursor.update(user).done((e) => {
      console.log("Successful editting user #" + id);
    });
  }, iter, 'readwrite').then(function () {
    console.log("Finished editting user roles");
    $("#editUserRoleModal").modal("toggle");
  });
}

function removeUser(id) {
  db.remove("user", id).then(
    n => {
      console.log(
        n.toString() + " users deleted with given id #" + id.toString()
      );
      showUsers();
    },
    e => {
      console.log(e.message);
    }
  );
}

function showAdminProfile() {
  let userEmail = sessionStorage.getItem("userEmail");
  // Search for user email in client_table
  let key_range = ydn.db.KeyRange.only(userEmail);
  db.values("user", "email", key_range).then(
    record => {
      if (record.length > 0) {
        // console.log("Found this user profile = " + JSON.stringify(record[0]));
        // TODO - Change photo
        $("#admin-name").html(record[0].name);
        $("#admin-phone").html(record[0].phone);
        $("#admin-email").html(record[0].email);
      }
    },
    function (e) {
      console.error("A wild error appears = " + e);
    }
  );
}