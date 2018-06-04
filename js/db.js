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
 *   It's a child of 'User'.
 */
let delivery_address_store_schema = {
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
};

/* Table 'Pet'
 *   It's a child of 'User'.
 */
let pet_store_schema = {
  name: "pet",
  keyPath: "id",
  autoIncrement: true,
  indexes: [{
      keyPath: "userID",
    }, {
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
  indexes: [{
    keyPath: "userID",
  }, {
    keyPath: "creditCardNo"
  }]
};

/* Table 'Order Service Line'
 */
let order_service_line_store_schema = {
  name: "order-service-line",
  keyPath: "id",
  autoIncrement: true,
  indexes: [{
      keyPath: "orderID"
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
  indexes: [{
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
    // Insert a default admin user
    db.put("user", {
      name: "admin",
      phone: "+55 (16) 25851253",
      photo: "img/unknown_person.jpg",
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
          ")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
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
      }
    );
}

//-------- Manipulate the USER store
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
        sessionStorage.setItem("userEmail", userEmail);
        sessionStorage.setItem("userID", userInfo.id);
        sessionStorage.setItem("userRole", userInfo.role);
        if (userInfo.role === "client") {
          changePage("client_profile.html");
        } else {
          changePage("admin_profile.html");
        }
      }
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
          ")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
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
    }
  );
}

function showClientProfile() {
  $(".btn-pref .btn").click(function () {
    $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
    // $(".tab").addClass("active"); // instead of this do the below 
    $(this).removeClass("btn-default").addClass("btn-primary");
  });

  let userEmail = sessionStorage.getItem("userEmail");
  // Search for user email in client_table
  let key_range = ydn.db.KeyRange.only(userEmail);
  db.values("user", "email", key_range).then(
    record => {
      if (record.length > 0) {
        $("#client-cover-photo").attr("src", record[0].photo);
        $("#client-profile-photo").attr("src", record[0].photo);
        $("#client-profile-name").html(record[0].name);
        $("#client-profile-phone").html(record[0].phone);
        $("#client-profile-email").html(record[0].email);
      }
    }
  );
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

  db
    .put("pet", {
      userID: userID,
      name: name,
      photo: photo,
      breed: breed,
      age: age,
    })
    .then(
      key => {
        console.log("Success adding pet of id #" + key);
      }
    );

  showPets();
}

function showPets() {
  let output = "";

  let iter = new ydn.db.ValueIterator("pet");
  db
    .open(
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
    )
    .then(() => {
      $("#petList").html(output);
    });
}

function removePet(id) {
  db.remove("pet", id).then(
    n => {
      console.log(
        n.toString() + " pets deleted with given id #" + id.toString()
      );
      showPets();
    }
  );
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
  db
    .put("pet", {
      id: parseInt($("#editPetInputID").html()),
      userID: parseInt(sessionStorage.getItem("userID")),
      name: $("#editPetInputName").val(),
      photo: $("#editPetImgThumb").attr("src"),
      breed: $("#editPetInputBreed").val(),
      age: $("#editPetInputAge").val(),
    })
    .then(
      key => {
        console.log("Success editting pet of id #" + key);
        $("#editPetForm").modal("toggle");
        showPets();
      }
    );
}