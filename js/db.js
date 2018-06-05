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
      photo: "img/unknown_person.jpg",
      email: "admin",
      password: "admin",
      role: "admin"
    });
    db.put("product", {
        name: "Dog Collar",
        photo: "img/dog_collar.jpg",
        description: "It's a Dog Collar very cute",
        retailPrice: "15",
        inventoryQty: "20",
        qtySold: "0"
      })
      .then(
        key => {
          console.log("Success adding product of id #" + key);
        },
        e => {
          console.error(e.stack);
        }
      );
    db.put("service", {
        name: "DogGrooming",
        photo: "img/dog_grooming.png",
        description: "It's a Dog Grooming very nice",
        retailPrice: "45",
        inventoryQty: "30",
        qtySold: "0"
      })
      .then(
        key => {
          console.log("Success adding service of id #" + key);
        },
        e => {
          console.error(e.stack);
        }
      );
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
  let photo = $("#addProductImgThumb").attr("src");
  let desc = $("#addProductInputDescription").val();
  let rPrice = $("#addProductInputRetailPrice").val();
  let iQty = $("#addProductInputInventoryQuantity").val();
  let sQty = 0;

  $("#addProductInputName").val("");
  $("#addProductImgThumb").attr("src", "img/no_image.png");
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
    $("#editProductImgThumb").attr("src", record.photo);
    $("#editProductInputDescription").val(record.description);
    $("#editProductInputRetailPrice").val(record.retailPrice);
    $("#editProductInputInventoryQuantity").val(record.inventoryQty);
    $("#editProductInputQuantitySold").val(record.qtySold);
  });
}

function saveProductChanges() {
  console.log("Saving product changes...");

  db
    .put("product", {
      id: parseInt($("#editProductInputID").val()),
      name: $("#editProductInputName").val(),
      photo: $("#editProductImgThumb").attr("src"),
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
  let photo = $("#registerImgThumb").attr("src");
  let fName = $("#registerInputFirstName").val();
  let lName = $("#registerInputLastName").val();
  let phone = $("#registerInputPhone").val();
  let email = $("#registerInputEmail").val();
  let password = $("#registerInputPassword").val();

  $("#registerImgThumb").attr("src", "img/unknown_person.jpg");
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
  let id = parseInt($("#editUserRoleInputID").val());
  let role = $('input[name=user-role]:checked', '#editUserRoleForm').val();
  role = (role === 'administrator' ? 'admin' : 'client');

  let iter = new ydn.db.ValueIterator('user', ydn.db.KeyRange.only(id));
  db.open((cursor) => {
    let user = cursor.getValue();
    user.role = role;
    cursor.update(user).done((e) => {
      console.log("Successful editting user #" + id);
    });
  }, iter, 'readwrite').then(function () {
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
        $("#admin-photo").attr("src", record[0].photo);
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

function showProductsUser() {
  let output = "";

  let iter = new ydn.db.ValueIterator("product");
  db
    .open(
      cursor => {
        let v = cursor.getValue();
        output += "<div class='col-md-4'><div class='product'>" +
          "<div class='link-to-prod' onclick='showSelectedProd(" +
          v.id +
          ");'>";
        output += "<img src='"+ v.photo +"' class='image'>";
        output += "<p><span>"+ v.name +"</span></p></div>"
        output += "<p><span class='product-price'> $" +
          v.retailPrice +
          "</span></p></div></div>";
      },
      iter,
      "readonly"
    )
    .then(() => {
      $("#productsPanel").html(output);
    });
}

function showSelectedProd(id) {
  $("#test").load("prod1.html", () => {
    db.get("product",id).then(record => {
      $("#buyBtn").attr("onclick","buyAction(" + id + ")");
      $("#productName").html(record.name);
      $("#productPhoto").attr("src", record.photo);
      $("#productDescription").html(record.description);
      $("#productPrice").html(record.retailPrice);
      $("#productStock").html(record.inventoryQty);
      $("#productQuantity").attr("max", record.inventoryQty);
    });
  });
}

function showServicesUser() {
  let output = "";

  let iter = new ydn.db.ValueIterator("service");
  db
    .open(
      cursor => {
        let v = cursor.getValue();
        output += "<div class='col-md-4'><div class='service'>" +
          "<div class='link-to-prod' onclick='showSelectedServ(" +
          v.id +
          ");'>";
        output += "<img src='"+ v.photo +"' class='image'>";
        output += "<p><span>"+ v.name +"</span></p></div>"
        output += "<p><span class='service-price'> $" +
          v.retailPrice +
          "</span></p></div></div>";
      },
      iter,
      "readonly"
    )
    .then(() => {
      $("#servicePanel").html(output);
    });
}

function showSelectedServ(id) {
  $("#test").load("service1.html", () => {
    db.get("service",id).then(record => {
      $("#serviceName").html(record.name);
      $("#servicePhoto").attr("src", record.photo);
      $("#serviceDescription").html(record.description);
      $("#servicePrice").html(record.retailPrice);
    });
    calendar();
  });
}

function buyAction(id) {
  let quantity_prod = parseInt($("#productQuantity").val());

  db.get("product",id).then(record => {
    let stock_prod = parseInt(record.inventoryQty);
    let name_prod = record.name;
    let price_prod = record.retailPrice;

    if (quantity_prod > stock_prod) {
      alert("The quantity you are willing to buy it's more than the stock");
    }
    else {
      stock_prod -= quantity_prod;
      let product = {
        id: id,
        name: name_prod,
        retailPrice: price_prod,
        quantity: quantity_prod,
        inventoryQty: stock_prod
      };

      if (sessionStorage.getItem("selectedProducts") === null) {
        sessionStorage.setItem("selectedProducts", JSON.stringify([product]));
      }
      else {
        let product_list = sessionStorage.getItem("selectedProducts");
        let products = JSON.parse(product_list);
        products.push(product);
        sessionStorage.setItem("selectedProducts", JSON.stringify(products));
      }
    }
    alert("Your product was added to the cart :)");
  });
}

function showOrder() {
  let output = "";
  let paymentVar = "payBtn(";
  let total = 0;
  let product_list = sessionStorage.getItem("selectedProducts");
  let products = JSON.parse(product_list);
  console.log(products);

  if (products !== null) {
    for (prod of products) {
      let total_price = parseInt(prod.quantity) * parseInt(prod.retailPrice)
      output += "<li class='list-group-item' id='product-ord-" + prod.id + "'>";
      output += "<p>"+ prod.name + "</p>";
      output += " <p> Quantity : " +
        prod.quantity + "</p>";
      output += "<p> Unity price : " +
        prod.retailPrice + "</p>";
      output += "<p> Total price : " +
        total_price + "</p>";
      output += "</li>";
      total += parseInt(total_price);
    }
    output += "<br /> <h3> Total: " + total +"</h3>";
    paymentVar += total + ")"
    $("#productsClient").html(output);
    $("#payBtn").attr("onclick", paymentVar);
  }
}

function cleanBtn() {
  var txt;
  var r = confirm("Are you sure you want to empty your cart?");
  if (r == true) {
    sessionStorage.removeItem("selectedProducts");
    alert("Your cart it's now empty");
  }
  changePage("orders.html");
}

function payBtn(total) {
  let userId = sessionStorage.getItem("userID");
  console.log(userId);
  if (userId === null) {
    changePage("login.html");
  }
  else {
    $("#paymentForm").modal("toggle");

    bd.get("user", userId).then( record => {
      $("deliveryAddress").html(record.address);
      $("totalProducts").html(total);
    })
  }
}
