/* DEFINITION OF OBJECT STORES */

/* Table 'User'
 *   It's necessary to create at least 1 delivery address to
 *   every new client which is added to the database
 */
let user_store_schema = {
  name: "user",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
      keyPath: "name"
    },
    {
      name: "phone",
      multiEntry: true
    },
    {
      name: "address"
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
 *   It's a child of 'User'.
 */
/* let delivery_address_store_schema = {
  name: "delivery-address",
  keyPath: "id",
  autoIncrement: true,
  indexes: [{
      keyPath: "userID"
    },
    {
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
}; */

/* Table 'Pet'
 *   It's a child of 'User'.
 */
let pet_store_schema = {
  name: "pet",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
      keyPath: "userID"
    },
    {
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
 *   It's a child of 'User'.
 */
let order_store_schema = {
  name: "order",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
      keyPath: "userID"
    },
    {
      keyPath: "creditCardNo"
    }
  ]
};

/* Table 'Order Service Line'
 */
let order_service_line_store_schema = {
  name: "order-service-line",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
      keyPath: "orderID"
    },
    {
      keyPath: "serviceID"
    },
    {
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
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
      keyPath: "orderID"
    },
    {
      keyPath: "productID"
    },
    {
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
  indexes: [
    {
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

/* Table 'Service Time Slot'
 */
let service_time_slot_store_schema = {
  name: "service-time-slot",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
      keyPath: "serviceID"
    },
    {
      keyPath: "date"
    },
    {
      name: "taken"
    }
  ]
};

/* Table 'Product'
 */
let product_store_schema = {
  name: "product",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    {
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
    // delivery_address_store_schema,
    pet_store_schema,
    order_store_schema,
    order_service_line_store_schema,
    order_product_line_store_schema,
    service_store_schema,
    service_time_slot_store_schema,
    product_store_schema
  ]
};

/* INITIALIZING DATABASE */
db = new ydn.db.Storage("dogshelter", schema);
db.addEventListener("ready", event => {
  let is_updated = event.getVersion() != event.getOldVersion();
  if (isNaN(event.getOldVersion())) {
    console.log("new database created");
    // Insert a default admin user
    db.put("user", {
      name: "admin",
      phone: "+55 (16) 25851253",
      photo: "img/unknown_person.jpg",
      address: "SEATTLE WA 98104",
      email: "admin",
      password: "admin",
      role: "admin"
    });

    insertSomeTestData();
  } else if (is_updated) {
    console.log("database connected with new schema");
  } else {
    console.log("existing database connected");
  }
  // heavy database operations should start from this.
});

/* USEFUL FUNCTIONS */
//-------- Manipulate the PRODUCT store
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

  db.put("product", {
    name: name,
    photo: photo,
    description: desc,
    retailPrice: rPrice,
    inventoryQty: iQty,
    qtySold: sQty
  }).then(key => {
    console.log("Success adding product of id #" + key);
  });

  showProducts();
}

function showProducts() {
  let output = "";

  let iter = new ydn.db.ValueIterator("product");
  db.open(
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
        ")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
      output += "</li>";
    },
    iter,
    "readonly"
  ).then(() => {
    $("#productsList").html(output);
  });
}

function removeProduct(id) {
  db.remove("product", id).then(n => {
    console.log(
      n.toString() + " products deleted with given id #" + id.toString()
    );
    showProducts();
  });
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
  db.put("product", {
    id: parseInt($("#editProductInputID").val()),
    name: $("#editProductInputName").val(),
    photo: $("#editProductImgThumb").attr("src"),
    description: $("#editProductInputDescription").val(),
    retailPrice: $("#editProductInputRetailPrice").val(),
    inventoryQty: $("#editProductInputInventoryQuantity").val(),
    qtySold: $("#editProductInputQuantitySold").val()
  }).then(key => {
    console.log("Success editting product of id #" + key);
    $("#editProductForm").modal("toggle");
    showProducts();
  });
}

//-------- Manipulate the SERVICE store
function addService() {
  let name = $("#addServiceInputName").val();
  let photo = $("#addServiceImgThumb").attr("src");
  let desc = $("#addServiceInputDescription").val();
  let rPrice = $("#addServiceInputRetailPrice").val();

  $("#addServiceInputName").val("");
  $("#addServiceImgThumb").attr("src", "img/no_image.png");
  $("#addServiceInputDescription").val("");
  $("#addServiceInputRetailPrice").val("");

  db.put("service", {
    name: name,
    photo: photo,
    description: desc,
    retailPrice: rPrice
  }).then(key => {
    console.log("Success adding service of id #" + key);
  });

  showServices();
}

function showServices() {
  let output = "";

  let iter = new ydn.db.ValueIterator("service");
  db.open(
    cursor => {
      let v = cursor.getValue();
      output += "<li class='list-group-item' id='service-" + v.id + "'>";
      output += v.name;
      output +=
        "<a onclick='removeService(" +
        v.id +
        ")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
      output +=
        "<a onclick='initAddTimeSlotsServiceForm(" +
        v.id +
        ")' href='#'><span class='mini glyphicon glyphicon-time'></span></a>";
      output +=
        "<a onclick='editService(" +
        v.id +
        ")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
      output += "</li>";
    },
    iter,
    "readonly"
  ).then(() => {
    $("#servicesList").html(output);
  });
}

function removeService(id) {
  db.remove("service", id).then(n => {
    console.log(
      n.toString() + " services deleted with given id #" + id.toString()
    );
    showServices();
  });
}

function editService(id) {
  $("#editServiceForm").modal();

  db.get("service", id).then(record => {
    $("#editServiceInputID").val(record.id);
    $("#editServiceInputName").val(record.name);
    $("#editServiceImgThumb").attr("src", record.photo);
    $("#editServiceInputDescription").val(record.description);
    $("#editServiceInputRetailPrice").val(record.retailPrice);
  });
}

function showTimeSlots(serviceID) {
  let output = "";
  db.values(
    "service-time-slot",
    "serviceID",
    ydn.db.KeyRange.only(serviceID)
  ).then(timeSlots => {
    for (timeSlot of timeSlots) {
      output += "<li class='list-group-item'>";
      output += timeSlot.date;
      output +=
        "<span onclick='removeTimeSlotFromService(" +
        timeSlot.id +
        ")' class='mini glyphicon red glyphicon-remove' style='cursor: pointer;'></span>";
      output += "</li>";
    }
    $("#time-slots-service").html(output);
  });
}

function initAddTimeSlotsServiceForm(serviceID) {
  $("#addTimeSlotsServiceForm").modal("show");
  $("#addTimeSlotsServiceInputID").val(serviceID.toString());
  db.get("service", serviceID).done(service => {
    $("#addTimeSlotsServiceInputName").val(service.name);
  });
  showTimeSlots(serviceID);
}

function addTimeSlotToService() {
  let serviceID = parseInt($("#addTimeSlotsServiceInputID").val());
  let timeSlot = $("#addTimeSlotsServiceInputDate").val();

  db.put("service-time-slot", {
    serviceID: serviceID,
    date: timeSlot,
    taken: false
  }).done(k => {
    showTimeSlots(serviceID);
  });
}

function removeTimeSlotFromService(timeSlotID) {
  db.remove("service-time-slot", timeSlotID);
  showTimeSlots(parseInt($("#addTimeSlotsServiceInputID").val()));
}

function deleteAllTimeSlotsFromService() {
  let serviceID = parseInt($("#addTimeSlotsServiceInputID").val());
  db.remove(
    "service-time-slot",
    "serviceID",
    ydn.db.KeyRange.only(serviceID)
  ).done(n => {
    console.log(n + "time slots deleted associated to service #" + serviceID);
    showTimeSlots(serviceID);
  });
}

function saveServiceChanges() {
  db.put("service", {
    id: parseInt($("#editServiceInputID").val()),
    name: $("#editServiceInputName").val(),
    photo: $("#editServiceImgThumb").attr("src"),
    description: $("#editServiceInputDescription").val(),
    retailPrice: $("#editServiceInputRetailPrice").val()
  }).then(key => {
    console.log("Success editting service of id #" + key);
    $("#editServiceForm").modal("toggle");
    showServices();
  });
}

function initServiceBooking() {
  let userID = parseInt(sessionStorage.getItem("userID"));
  if (userID) {
    $("#serviceBookingForm").modal("show");
    db.values("pet", "userID", ydn.db.KeyRange.only(userID)).then(pets => {
      let output = "";
      for (pet of pets) {
        output +=
          "<option value='pet-" + pet.id + "'>" + pet.name + "</option>";
      }
      $("#service-booking-pet").html(output);
    });
  } else {
    alert("You need to login to make an appointment.");
    changePage("login.html");
  }
}

function saveAppointment() {}

//-------- Manipulate the USER store
function addUser() {
  let photo = $("#registerImgThumb").attr("src");
  let fName = $("#registerInputFirstName").val();
  let lName = $("#registerInputLastName").val();
  let phone = $("#registerInputPhone").val();
  let address = $("#registerInputAddress").val();
  let email = $("#registerInputEmail").val();
  let password = $("#registerInputPassword").val();

  $("#registerImgThumb").attr("src", "img/unknown_person.jpg");
  $("#registerInputFirstName").val("");
  $("#registerInputLastName").val("");
  $("#registerInputPhone").val("");
  $("#registerInputAddress").val("");
  $("#registerInputEmail").val("");
  $("#registerInputPassword").val("");

  db.put("user", {
    name: fName + " " + lName,
    phone: phone,
    address: address,
    photo: photo,
    email: email,
    password: password,
    role: "client"
  }).then(
    key => {
      console.log("Success adding client of id #" + key);
      alert("Your account was created successfully.");

      //Log user in automatically
      sessionStorage.setItem("userID", key.toString());
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userRole", "client");
      changePage("client_profile.html");
    },
    e => {
      alert(
        "The given email is already being used! Please choose another one."
      );
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
  db.values("user", "email", key_range).then(record => {
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
      sessionStorage.setItem("userEmail", userEmail);
      sessionStorage.setItem("userID", userInfo.id);
      sessionStorage.setItem("userRole", userInfo.role);
      if (userInfo.role === "client") {
        changePage("client_profile.html");
      } else {
        changePage("admin_profile.html");
      }
    }
  });
}

function showUsers() {
  let output = "";

  let iter = new ydn.db.ValueIterator("user");
  db.open(
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
        ")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
      output += "</li>";
    },
    iter,
    "readonly"
  ).then(() => {
    $("#userList").html(output);
  });
}

function editUserRole(id) {
  $("#editUserRoleModal").modal();

  db.get("user", id).then(record => {
    $("#editUserRoleInputID").val(record.id);
    $("#editUserRoleInputName").val(record.name);
    $("#editUserRoleInputEmail").val(record.email);
    $("#editUserRoleCurRole").html(record.role);
  });
}

function saveUserRoleChanges() {
  let id = parseInt($("#editUserRoleInputID").val());
  let role = $("input[name=user-role]:checked", "#editUserRoleForm").val();
  role = role === "administrator" ? "admin" : "client";

  let iter = new ydn.db.ValueIterator("user", ydn.db.KeyRange.only(id));
  db.open(
    cursor => {
      let user = cursor.getValue();
      user.role = role;
      cursor.update(user).done(e => {
        console.log("Successful editting user #" + id);
      });
    },
    iter,
    "readwrite"
  ).then(function() {
    $("#editUserRoleModal").modal("toggle");
  });
}

function removeUser(id) {
  db.remove("user", id).then(n => {
    console.log(
      n.toString() + " users deleted with given id #" + id.toString()
    );
    showUsers();
  });
}

function showAdminProfile() {
  let userEmail = sessionStorage.getItem("userEmail");
  // Search for user email in client_table
  let key_range = ydn.db.KeyRange.only(userEmail);
  db.values("user", "email", key_range).then(record => {
    if (record.length > 0) {
      $("#admin-photo").attr("src", record[0].photo);
      $("#admin-name").html(record[0].name);
      $("#admin-phone").html(record[0].phone);
      $("#admin-email").html(record[0].email);
      $("#admin-address").html(record[0].address);
    }
  });
}

function showClientProfile() {
  $(".btn-pref .btn").click(function() {
    $(".btn-pref .btn")
      .removeClass("btn-primary")
      .addClass("btn-default");
    // $(".tab").addClass("active"); // instead of this do the below
    $(this)
      .removeClass("btn-default")
      .addClass("btn-primary");
  });

  let userEmail = sessionStorage.getItem("userEmail");
  // Search for user email in client_table
  let key_range = ydn.db.KeyRange.only(userEmail);
  db.values("user", "email", key_range).then(record => {
    if (record.length > 0) {
      $("#client-cover-photo").attr("src", record[0].photo);
      $("#client-profile-photo").attr("src", record[0].photo);
      $("#client-profile-name").html(record[0].name);
      $("#client-profile-phone").html(record[0].phone);
      $("#client-profile-email").html(record[0].email);
      $("#client-profile-address").html(record[0].address);
    }
  });
}

//-------- Manipulate the PET store
function addPet() {
  let name = $("#addPetInputName").val();
  let photo = $("#addPetImgThumb").attr("src");
  let breed = $("#addPetInputBreed").val();
  let age = parseInt($("#addPetInputAge").val());
  let userID = parseInt(sessionStorage.getItem("userID"));

  $("#addPetInputName").val("");
  $("#addPetImgThumb").attr("src", "img/no_image.png");
  $("#addPetInputBreed").val("");
  $("#addPetInputAge").val("");

  db.put("pet", {
    userID: userID,
    name: name,
    photo: photo,
    breed: breed,
    age: age
  }).then(key => {
    console.log("Success adding pet of id #" + key);
  });

  showPets();
}

function showPets() {
  let output = "";

  let iter = new ydn.db.ValueIterator("pet");
  db.open(
    cursor => {
      let v = cursor.getValue();
      output += "<li class='list-group-item' id='pet-" + v.id + "'>";
      output += v.name;
      output +=
        "<a onclick='removePet(" +
        v.id +
        ")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
      output +=
        "<a onclick='editPet(" +
        v.id +
        ")' href='#'><span class='mini glyphicon glyphicon-wrench'></span></a>";
      output += "</li>";
    },
    iter,
    "readonly"
  ).then(() => {
    $("#petList").html(output);
  });
}

function removePet(id) {
  db.remove("pet", id).then(n => {
    console.log(n.toString() + " pets deleted with given id #" + id.toString());
    showPets();
  });
}

function editPet(id) {
  $("#editPetForm").modal();

  db.get("pet", id).then(record => {
    $("#editPetInputID").html(record.id.toString());
    $("#editPetInputName").val(record.name);
    $("#editPetImgThumb").attr("src", record.photo);
    $("#editPetInputBreed").val(record.breed);
    $("#editPetInputAge").val(record.age);
  });
}

function savePetChanges() {
  db.put("pet", {
    id: parseInt($("#editPetInputID").html()),
    userID: parseInt(sessionStorage.getItem("userID")),
    name: $("#editPetInputName").val(),
    photo: $("#editPetImgThumb").attr("src"),
    breed: $("#editPetInputBreed").val(),
    age: $("#editPetInputAge").val()
  }).then(key => {
    console.log("Success editting pet of id #" + key);
    $("#editPetForm").modal("toggle");
    showPets();
  });
}

//-------- Manipulate the ORDER store
function showOrders() {
  let totalSum = 0;
  let totalQty = 0;

  let iter = new ydn.db.ValueIterator("order");
  db.open(
    cursor => {
      let v = cursor.getValue();

      db.get("user", v.userID).then(record => {
        if (record) {
          let userName = record.name;
          let keyRange = ydn.db.KeyRange.only(v.id);
          let sum = 0;
          let qty = 0;

          let orderProductLines = db
            .values("order-product-line", "orderID", keyRange)
            .then(records => {
              if (records) {
                for (productLine of records) {
                  sum += productLine.salePrice * productLine.quantity;
                  qty += productLine.quantity;
                }
              }

              let output = "";
              output += "<li class='list-group-item' id='order-" + v.id + "'>";
              output +=
                userName +
                " (" +
                qty +
                " products | total = $" +
                sum.toFixed(2) +
                ")";
              output += "</li>";
              $("#ordersList").append(output);
              totalSum += sum;
              totalQty += qty;
              $("#reports-no-prod-sold").html(totalQty.toString());
              $("#reports-sum-orders-values").html(totalSum.toString());
            });
        }
      });
    },
    iter,
    "readonly"
  );
}

//-------- SHOW PRODUCTS
function showProductsUser() {
  let output = "";

  let iter = new ydn.db.ValueIterator("product");
  db.open(
    cursor => {
      let v = cursor.getValue();
      output +=
        "<div class='col-md-4'><div class='product'>" +
        "<div class='link-to-prod' onclick='showSelectedProd(" +
        v.id +
        ");'>";
      output += "<img src='" + v.photo + "' class='image'>";
      output += "<p><span>" + v.name + "</span></p></div>";
      output +=
        "<p><span class='product-price'> $" +
        v.retailPrice +
        "</span></p></div></div>";
    },
    iter,
    "readonly"
  ).then(() => {
    $("#productsPanel").html(output);
  });
}

function showSelectedProd(id) {
  $("#changeableContent").load("prod1.html", () => {
    db.get("product", id).then(record => {
      $("#buyBtn").attr("onclick", "buyProduct(" + id + ")");
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
  db.open(
    cursor => {
      let v = cursor.getValue();
      output +=
        "<div class='col-md-4'><div class='service'>" +
        "<div class='link-to-prod' onclick='showSelectedServ(" +
        v.id +
        ");'>";
      output += "<img src='" + v.photo + "' class='image'>";
      output += "<p><span>" + v.name + "</span></p></div>";
      output +=
        "<p><span class='service-price'> $" +
        v.retailPrice +
        "</span></p></div></div>";
    },
    iter,
    "readonly"
  ).then(() => {
    $("#servicePanel").html(output);
  });
}

function showSelectedServ(id) {
  $("#changeableContent").load("service1.html", () => {
    db.get("service", id).then(record => {
      $("#serviceName").html(record.name);
      $("#servicePhoto").attr("src", record.photo);
      $("#serviceDescription").html(record.description);
      $("#servicePrice").html(record.retailPrice);
    });

    $("#service-booking-date-picker").datetimepicker({
      format: "DD-MM-YYYY"
    });

    // RESTART FROM HERE!!
    // $("#service-booking-date").on("input", function(e) {
    //   alert("Changed!");
    // });
    //calendar();
  });
}

function buyProduct(id) {
  let qty = parseFloat($("#productQuantity").val());
  console.log("got qty = " + qty);
  if (qty > 0 && Number.isInteger(qty)) {
    let product = {
      id: id,
      qty: qty,
      rPrice: parseFloat($("#productPrice").html()),
      store: "product"
    };
    let itemsInCart = sessionStorage.getItem("selectedItemsInCart");
    if (itemsInCart === null) {
      sessionStorage.setItem("selectedItemsInCart", JSON.stringify([product]));
    } else {
      itemsInCart = JSON.parse(itemsInCart);
      itemsInCart.push(product);
      sessionStorage.setItem(
        "selectedItemsInCart",
        JSON.stringify(itemsInCart)
      );
    }

    alert("Your product was added to the cart :)");
  } else {
    alert("Invalid quantity :(");
    $("#productQuantity").val(1);
  }
}

function showItemsInCart() {
  let cartItems = sessionStorage.getItem("selectedItemsInCart");
  let totalOrder = 0;

  if (cartItems === null) {
    $("#cartItemsList").append(
      "<p style='padding-left:20px;'>Your cart is empty!</p>"
    );
    $("#cart-total-order").html("0.00");
  } else {
    cartItems = JSON.parse(cartItems);

    for (cartItem of cartItems) {
      (cartItem => {
        if (cartItem.store === "product") {
          let qty = cartItem.qty;
          db.get("product", cartItem.id).done(prod => {
            let output = "";

            output += "<div class='row cart-prod'><div class='col-md-2'>";
            output += "<img src='" + prod.photo + "' class='img-thumbnail '>";
            output += "</div>";
            output +=
              "<div class='col-md-8'><p class='name-in-cart'>" +
              prod.name +
              "</p></div>";
            output += "<div class='col-md-2'>";
            // output += "<span class='glyphicon glyphicon-remove cart-glyphicon' onclick='removeCartProduct(" + prod.id + ")'></span>";
            output +=
              "<p>" +
              cartItem.qty +
              " x " +
              cartItem.rPrice +
              " =<br>" +
              (cartItem.qty * cartItem.rPrice).toFixed(2) +
              "</p>";
            output += "</div></div>";

            totalOrder += prod.retailPrice * cartItem.qty;
            sessionStorage.setItem("totalOrder", totalOrder);

            $("#cartItemsList").append(output);
            $("#cart-total-order").html(totalOrder.toFixed(2).toString());
          });
        } else {
          alert("TODO: Add a service to the cart.");
        }
      })(cartItem);
    }
  }
}

function emptyCart() {
  let ans = confirm("Are you sure you want to empty your cart?");
  if (ans == true) {
    sessionStorage.removeItem("selectedItemsInCart");
  }
  changePage("checkout.html");
}

function initPayment() {
  let userId = sessionStorage.getItem("userID");
  if (userId === null) {
    changePage("login.html");
  } else {
    $("#cartCheckoutForm").modal("show");
    db.get("user", parseInt(userId)).then(record => {
      $("#deliveryAddress").val(record.address);
      $("#totalProducts").val(sessionStorage.getItem("totalOrder").toString());
    });
  }
}

function savePurchase() {
  let userID = parseInt(sessionStorage.getItem("userID"));
  let creditCardNo = parseInt($("#creditCard").val());

  db.put("order", {
    userID: userID,
    creditCardNo: creditCardNo
  }).done(orderId => {
    let cartItems = JSON.parse(sessionStorage.getItem("selectedItemsInCart"));
    for (cartItem of cartItems) {
      (cartItem => {
        //Add a product line to the order
        if (cartItem.store === "product") {
          db.put("order-product-line", {
            orderID: orderId,
            productID: cartItem.id,
            salePrice: cartItem.rPrice,
            quantity: cartItem.qty
          });

          // Update product 'qtySold' and 'inventoryQty'
          let iter = new ydn.db.ValueIterator(
            "product",
            ydn.db.KeyRange.only(cartItem.id)
          );
          db.open(
            cursor => {
              let product = cursor.getValue();
              let qtySold = cartItem.qty;
              product.qtySold += qtySold;
              product.inventoryQty -= qtySold;
              cursor.update(product).done(e => {
                console.log(
                  "Successful saving inventory quantities for product #" +
                    product.id
                );
              });
            },
            iter,
            "readwrite"
          );
        } else {
          //Add a service line to the order
          console.log("TODO: Add service #" + cartItem.id + " to the order");
        }
      })(cartItem);
    }
    sessionStorage.removeItem("selectedItemsInCart");
    alert("Your order was approved! Redirecting to your profile...");
    $("#cartCheckoutForm").modal("hide");
    $("#cartCheckoutForm").on("hidden.bs.modal", e => {
      let userRole = sessionStorage.getItem("userRole");
      if (userRole === "client") {
        changePage("client_profile.html");
      } else {
        changePage("admin_profile.html");
      }
    });
  });
}

function insertSomeTestData() {
  let users = [
    {
      name: "John Doe",
      phone: "202-555-0164",
      address: "60 Lees Creek Lane North Andover, MA 01845",
      photo: "img/unknown_person.jpg",
      email: "john.doe@gmail.com",
      password: "john123",
      role: "client"
    },
    {
      name: "Jose E. West",
      phone: "202-555-0188",
      address: "591 Homewood Drive Portsmouth, VA 23703",
      photo: "img/unknown_person.jpg",
      email: "jose.west@yahoo.com",
      password: "westjose",
      role: "client"
    },
    {
      name: "Ann W. Schmitz",
      phone: "+1-202-555-0171",
      address: "9952 Arcadia Dr. Salt Lake City, UT 84119",
      photo: "img/unknown_person.jpg",
      email: "schmitz.ann@gmail.com",
      password: "ann123",
      role: "admin"
    }
  ];
  let pets = [
    {
      userID: 1,
      name: "Bailey",
      breed: "Alaskan Malamute",
      photo: "img/no_image.png",
      age: 5
    },
    {
      userID: 1,
      name: "Celeste",
      breed: "American Eskimo Dog",
      photo: "img/no_image.png",
      age: 3
    },
    {
      userID: 2,
      name: "Diva",
      breed: "Australian Kelpie",
      photo: "img/no_image.png",
      age: 8
    }
  ];
  let orders = [
    {
      userID: 2,
      creditCardNo: 341768679371831
    },
    {
      userID: 2,
      creditCardNo: 341768679371831
    },
    {
      userID: 2,
      creditCardNo: 341768679371831
    },
    {
      userID: 2,
      creditCardNo: 341768679371831
    },
    {
      userID: 2,
      creditCardNo: 6011948489198451
    },
    {
      userID: 3,
      creditCardNo: 4716275103937400
    },
    {
      userID: 3,
      creditCardNo: 4716275103937400
    },
    {
      userID: 3,
      creditCardNo: 4716275103937400
    }
  ];
  let orderProductLines = [
    {
      orderID: 1,
      productID: 1,
      salePrice: 9,
      quantity: 1
    },
    {
      orderID: 1,
      productID: 2,
      salePrice: 12.34,
      quantity: 2
    },
    {
      orderID: 2,
      productID: 4,
      salePrice: 34.99,
      quantity: 1
    },
    {
      orderID: 3,
      productID: 1,
      salePrice: 10.63,
      quantity: 2
    },
    {
      orderID: 3,
      productID: 3,
      salePrice: 15.39,
      quantity: 2
    },
    {
      orderID: 4,
      productID: 1,
      salePrice: 10.63,
      quantity: 1
    },
    {
      orderID: 4,
      productID: 2,
      salePrice: 12.34,
      quantity: 1
    },
    {
      orderID: 5,
      productID: 3,
      salePrice: 14.5,
      quantity: 1
    },
    {
      orderID: 6,
      productID: 1,
      salePrice: 10.63,
      quantity: 2
    },
    {
      orderID: 7,
      productID: 2,
      salePrice: 12.34,
      quantity: 1
    },
    {
      orderID: 7,
      productID: 3,
      salePrice: 15.39,
      quantity: 1
    },
    {
      orderID: 8,
      productID: 4,
      salePrice: 34.99,
      quantity: 1
    }
  ];
  let services = [
    {
      name: "Full-Service Bath",
      photo: "img/full-service-bath.jpeg",
      description:
        "Includes bath with natural shampoo, blow dry, 15-minute brush-out, ear cleaning, nail trim, gland expression & scented spritz.",
      retailPrice: 30
    },
    {
      name: "Full-Service Bath with Haircut",
      photo: "img/full-service-bath-haircut.jpeg",
      description:
        "Includes bath with natural shampoo, blow dry, 15-minute brush-out, ear cleaning, nail trim, gland expression & scented spritz. PLUS a cut and style to breed-specific standard or shave down.",
      retailPrice: 50
    },
    {
      name: "De-shedding Treatment",
      photo: "img/deshedding-treatment.jpeg",
      description:
        "Includes FURminator loose undercoat removal, natural shed-reducing shampoo and treatment, followed by another thorough FURminator brush-out and aloe hydrating treatment.",
      retailPrice: 25
    },
    {
      name: "Flea Relief",
      photo: "img/flea-relief.jpeg",
      description:
        "Protect your dog with your choice of a naturally medicated or flea shampoo, moisturizing coat conditioner and spritz.",
      retailPrice: 30
    }
  ];
  let products = [
    {
      name:
        "Sentry Natural Defense Natural Flea & Tick Shampoo for Dogs & Puppies, 12 fl. oz.",
      photo: "img/sentry-dog-shampoo.jpeg",
      description:
        "Sentry Natural Defense Natural Flea & Tick Shampoo for Dogs. Kills adult fleas using natural ingredients. Wonderful spice scent. Naturally cleans and conditions. Safe for use around children & pets.",
      retailPrice: 10.63,
      inventoryQty: 100,
      qtySold: 22
    },
    {
      name: "Fly Free Zone Natural Fly Repellent Dog Collar",
      photo: "img/fly-free-collar.jpeg",
      description:
        "Fly Free Zone Natural Fly Repellent Dog Collar. Naturally creates a no pest zone around your dog. Repels flies, fleas, ticks and mosquitoes. Easy to use and comfortable for your dog",
      retailPrice: 12.34,
      inventoryQty: 50,
      qtySold: 40
    },
    {
      name: "Adams Plus Flea & Tick Carpet Spray, 16 oz.",
      photo: "img/carpet-spray-adams.jpeg",
      description:
        "16 oz., Kills fleas, ticks, cockroaches & ants on contact while killing all four stages of the flea-adults, eggs, larvae and pupae. Breaks the flea life cycle and controls reinfestation for up to 7 months. Treats up to 1,000 sq. ft. Breaks the flea life cycle and controls reinfestation for up to 210 days. Use on carpets, rugs, upholstery, drapes & other places where fleas may hide. Treats up to 2,000 sq. ft. Adams Plus Flea & Tick Carpet Spray.",
      retailPrice: 15.39,
      inventoryQty: 20,
      qtySold: 10
    },
    {
      name: "Cabana Bay Tan Geometric-Print Staycationer Dog Bed, Small",
      photo: "img/small-cabana-bay.jpeg",
      description:
        "The Cabana Bay Collection hops into summer with vibrant essentials fit for a day of lounging in the sunshine. Breathable materials pair with resort-ready patterns to complement your fun-filled days together, whether you're spending a lazy afternoon by the pool or taking off on a spontaneous day trip. Tan Geometric-Print Staycationer Dog Bed from Cabana Bay. Suitable for indoor and outdoor spaces. Styled with the Cabana Bay Lounge Life Dog Bed Riser, available and sold separately. Mix and match with the rest of the Cabana Bay Collection. Lounger silhouette is perfect for dogs that love to stretch out in their sleep. Machine washable cover is made of water-resistant beige and white canvas. Features an eye-catching geometric print the along sides and mint piping at top",
      retailPrice: 34.99,
      inventoryQty: 10,
      qtySold: 1
    }
  ];
  db.putAll("user", users);
  db.putAll("pet", pets);
  db.putAll("order", orders);
  db.putAll("order-product-line", orderProductLines);
  db.putAll("service", services);
  db.putAll("product", products);
}
