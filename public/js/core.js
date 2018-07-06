$(document).ready(() => {
    checkLoggedUser();
});

function changePage(dest) {
    dest = dest;
    srcFile = "html/" + dest;
    console.log("Received request to change to page: '" + dest + "'.");

    // Change page aspect
    if (dest.search("admin_") === 0) {
        $("#bodyContent").load(srcFile, () => {
            if (dest === "admin_products.html") {
                showProducts();
                initializePhotoPicker("addProductPhotoSelect", "addProductInputPhoto");
                initializePhotoPicker(
                    "editProductPhotoSelect",
                    "editProductInputPhoto"
                );
            } else if (dest === "admin_services.html") {
                showServices();
                initializePhotoPicker("addServicePhotoSelect", "addServiceInputPhoto");
                initializePhotoPicker(
                    "editServicePhotoSelect",
                    "editServiceInputPhoto"
                );
                $("#addTimeSlotsServiceFormDatePicker").datetimepicker({
                    format: "DD-MM-YYYY h:mm a"
                });
            } else if (dest === "admin_user_roles.html") {
                showUsers();
            } else if (dest === "admin_reports.html") {
                showOrders();
            }
            checkLoggedUser();
        });
    } else {
        $("#root").load(srcFile, () => {
            if (dest === "register.html") {
                initializePhotoPicker("registerPhotoSelect", "registerPhotoElem");
            } else if (dest === "client_profile.html") {
                getUserData().then(userData => {
                    renderClientProfile(userData);
                });
                initializePhotoPicker("addPetPhotoSelect", "addPetInputPhoto");
                initializePhotoPicker("editPetPhotoSelect", "editPetInputPhoto");
            } else if (dest === "products.html") {
                showProductsUser();
            } else if (dest === "services.html") {
                showServicesUser();
            } else if (dest === "checkout.html") {
                showItemsInCart();
            }
            checkLoggedUser();
        });

        if (dest !== "home.html") {
            $("#navRow").attr("class", "new-row");
            $("#navList").attr("class", "main-nav black");
            $("#fullPage").attr("class", "all-bg");
            $("#cartIcon").attr("class", "ion-ios-cart icon-big");
            $("#userHomeIcon").attr("class", "ion-person icon-big");
        } else {
            $("#navRow").attr("class", "row");
            $("#navList").attr("class", "main-nav");
            $("#fullPage").attr("class", "home-bg");
            $("#cartIcon").attr("class", "ion-ios-cart icon-white");
            $("#userHomeIcon").attr("class", "ion-person icon-white");
        }
    }
}

function checkLoggedUser() {
    let token = localStorage.getItem("ds_logged_token");
    // Check if there's a logged user
    if (token) {
        $("#loginOption").hide();
        $("#logoutOption").show();
        $("#userHomepage").show();
    } else {
        $("#loginOption").show();
        $("#logoutOption").hide();
        $("#userHomepage").hide();
    }
}

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

    $.ajax({
        type: "POST",
        url: "/users",
        data: {
            name: fName + " " + lName,
            phone: phone,
            address: address,
            photo: photo,
            email: email,
            password: password
        },
        error: () => {
            alert("Something went wrong while adding new user!");
        },
        success: (data) => {
            alert("Your account was created successfully.");
            //Log user in automatically
            login(email, password);
        }
    });
}

function login(user, pass) {
    $.ajax({
        type: "POST",
        url: "/auth/login",
        data: {
            username: (user ? user : $("#loginInputEmail").val()),
            password: (pass ? pass : $("#loginInputPassword").val())
        },
        error: (jqXHR, exception) => {
            alert("Invalid username or password.");
        },
        success: (data, textStatus, jqXHR) => {
            localStorage.setItem("ds_logged_token", data.token);
            renderUserPage();
        }
    });
    $("#loginInputEmail").val("");
    $("#loginInputPassword").val("");
}

function getUserData() {
    let token = localStorage.getItem("ds_logged_token");

    return $.ajax({
        type: "GET",
        url: "/users/profile",
        headers: {
            "Authorization": 'Bearer ' + token
        },
        error: (jqXHR, exception) => {
            return exception;
        },
        success: (data, textStatus, jqXHR) => {
            return data;
        }
    });
}

function renderUserPage() {
    getUserData().then((userData) => {
        let role = userData.role;
        if (role === "admin") {
            $("#bodyContent").load('html/admin_profile.html', () => {
                renderAdminProfile(userData);
            });
        } else {
            $("#root").load('html/client_profile.html', () => {
                $("#navRow").attr("class", "new-row");
                $("#navList").attr("class", "main-nav black");
                $("#fullPage").attr("class", "all-bg");
                $("#cartIcon").attr("class", "ion-ios-cart icon-big");
                $("#userHomeIcon").attr("class", "ion-person icon-big");
                initializePhotoPicker("addPetPhotoSelect", "addPetInputPhoto");
                initializePhotoPicker("editPetPhotoSelect", "editPetInputPhoto");
                renderClientProfile(userData);
            });
        }
    });
}

function renderClientProfile(userData) {
    $(".btn-pref .btn").click(function () {
        $(".btn-pref .btn")
            .removeClass("btn-primary")
            .addClass("btn-default");
        $(this)
            .removeClass("btn-default")
            .addClass("btn-primary");
    });

    $("#client-cover-photo").attr("src", userData.photo);
    $("#client-profile-photo").attr("src", userData.photo);
    $("#client-profile-name").html(userData.name);
    $("#client-profile-phone").html(userData.phone);
    $("#client-profile-email").html(userData.email);
    $("#client-profile-address").html(userData.address);
    checkLoggedUser();
}

function renderAdminProfile(userData) {
    $("#admin-photo").attr("src", userData.photo);
    $("#admin-name").html(userData.name);
    $("#admin-phone").html(userData.phone);
    $("#admin-email").html(userData.email);
    $("#admin-address").html(userData.address);
    checkLoggedUser();
}

function userLogout() {
    let token = localStorage.getItem("ds_logged_token");
    localStorage.removeItem("ds_logged_token");

    $.ajax({
        type: "GET",
        url: "/auth/logout",
        headers: {
            "Authorization": 'Bearer ' + token
        },
        success: (data, textStatus, jqXHR) => {
            let role = data.role;
            if (role == "admin") {
                changePage('admin_logout.html');
            } else {
                changePage("home.html");
            }
        }
    });
}

//------- ADMIN product functions

function showProducts() {
    $.ajax({
        type: "GET",
        url: "/products",
        error: () => {
            alert("Error while trying to recover products from server.");
        },
        success: (products) => {
            let output = "";
            for (product of products) {
              output += "<li class='list-group-item' id='product-" + product._id + "'>";
              output += product.name;
              output +=
                "<a onclick=\'removeProduct(\"" +
                product._id +
                "\")\' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
              output +=
                "<a onclick=\'editProduct(\"" +
                product._id +
                "\")\' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
              output += "</li>";
            }
            $("#productsList").html(output);
        }
    });
}

function addProduct() {
    let product = new Object();
    product.name = $("#addProductInputName").val();
    product.photo = $("#addProductImgThumb").attr("src");
    product.description = $("#addProductInputDescription").val();
    product.retailPrice = $("#addProductInputRetailPrice").val();
    product.inventoryQty = $("#addProductInputInventoryQuantity").val();
    product.qtySold = 0;

    $("#addProductInputName").val("");
    $("#addProductImgThumb").attr("src", "img/no_image.png");
    $("#addProductInputDescription").val("");
    $("#addProductInputRetailPrice").val("");
    $("#addProductInputInventoryQuantity").val("");

    $.ajax({
        type: "POST",
        url: "/products",
        data: product,
        error: () => {
            alert("Error while trying to add product into the server.");
        },
        success: (productData) => {
            console.log("Success adding product of id #" + productData._id);
            $("#addProductForm").modal("toggle");
            showProducts();
        }
    });
};

function editProduct(prod_id) {
    $("#editProductForm").modal();
    $.ajax({
        type: "GET",
        url: "/products/" + prod_id,
        error: () => {
            alert("Error while trying to get product from server.");
        },
        success: (productData) => {
            console.log("Success on getting from the server the product id: #" + productData._id);
            console.log("The product name is : " + JSON.stringify(productData.name));
            $("#editProductInputID").attr("placeholder", productData._id);
            $("#editProductInputName").val(productData.name);
            $("#editProductImgThumb").attr("src", productData.photo);
            $("#editProductInputDescription").val(productData.description);
            $("#editProductInputRetailPrice").val(productData.retailPrice);
            $("#editProductInputInventoryQuantity").val(productData.inventoryQty);
            $("#editProductInputQuantitySold").val(productData.qtySold);
        }
    });
}

function saveProductChanges() {
    let prod_id = $("#editProductInputID").attr("placeholder");
    let product = new Object();

    product.name = $("#editProductInputName").val(),
    product.photo = $("#editProductImgThumb").attr("src"),
    product.description = $("#editProductInputDescription").val(),
    product.retailPrice = $("#editProductInputRetailPrice").val(),
    product.inventoryQty = $("#editProductInputInventoryQuantity").val(),
    product.qtySold = $("#editProductInputQuantitySold").val()

    $.ajax({
        type: "PUT",
        url: "/products/" + prod_id,
        data: product,
        success: (updatedProduct) => {
            console.log(
                "Successful saving changes for product #" +
                prod_id
            );
            $("#editProductForm").modal("toggle");
            showProducts();
        }
    });
}

function removeProduct(prod_id) {
  $.ajax({
      type: "DELETE",
      url: "/products/" + prod_id,
      success: (removedProduct) => {
          console.log("Product deleted with given id #" + prod_id);
          showProducts();
      }
  });
}

//------- ADMIN user-role functions

function showUsers() {
    let output = "";

    $.ajax({
        type: "GET",
        url: "users/",
        success: (users) => {
          console.log("Success getting list of users from server.");
          users.forEach((user) => {
              output += "<li class='list-group-item' id='user-" + user._id + "'>";
              output += user.name;
              output +=
                "<a onclick='removeUser(\"" +
                user._id +
                "\")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
              output +=
                "<a onclick='editUserRole(\"" +
                user._id +
                "\")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
              output += "</li>";

              $("#userList").html(output);
          });
        }
    });
}

function editUserRole(user_id) {
    let userToken = localStorage.getItem("ds_logged_token");

    if (userToken) {
        $("#editUserRoleModal").modal();
        let userId = JSON.parse(atob(userToken.split(".")[1])).id;

        $.ajax({
            type: "GET",
            url: "/users/" + user_id,
            headers: {
                "Authorization": 'Bearer ' + userToken
            },
            error: () => {
                alert("Error while trying to get user from server.");
            },
            success: (userData) => {
                console.log("Success on getting from the server the user id: #" + user_id);
                console.log("The user object is : " + JSON.stringify(userData));
                $("#editUserRoleInputID").attr("placeholder", user_id);
                $("#editUserRoleInputName").val(userData.name);
                $("#editUserRoleInputEmail").val(userData.email);
                $("#editUserRoleCurRole").html(userData.role);
            }
        });
    } else {
        changePage("login.html");
    }
  }

function saveUserRoleChanges() {
    let user_id = $("#editUserRoleInputID").attr("placeholder");
    let role = $("input[name=user-role]:checked", "#editUserRoleForm").val();
    role = role === "administrator" ? "admin" : "client";

    $.ajax({
        type: "PUT",
        url: "/users/" + user_id,
        data: {role: role},
        success: (updatedUser) => {
            console.log(
                "Successful saving changes for product #" +
                user_id
            );
            $("#editUserRoleModal").modal("toggle");
            showUsers();
        }
    });
}

function removeUser(user_id) {
  $.ajax({
      type: "DELETE",
      url: "/users/" + user_id,
      success: (removedUser) => {
          console.log("User deleted with given id #" + user_id);
          showUsers();
      }
  });
}

//------- ADMIN service functions

function showServices() {
    $.ajax({
        type: "GET",
        url: "/services",
        error: () => {
            alert("Error while trying to recover services from server.");
        },
        success: (services) => {
            let output = "";
            for (service of services) {
              output += "<li class='list-group-item' id='service-" + service.id + "'>";
              output += service.name;
              output +=
                "<a onclick='removeService(\"" +
                service._id +
                "\")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
              output +=
                "<a onclick='initAddTimeSlotsServiceForm(\"" +
                service._id +
                "\")' href='#'><span class='mini glyphicon glyphicon-time'></span></a>";
              output +=
                "<a onclick='editService(\"" +
                service._id +
                "\")' href='#'><span class='mini glyphicon glyphicon-pencil'></span></a>";
              output += "</li>";
            }
            $("#servicesList").html(output);
        }
    });
}

function addService() {
    let service = new Object();
    service.name = $("#addServiceInputName").val();
    service.photo = $("#addServiceImgThumb").attr("src");
    service.description = $("#addServiceInputDescription").val();
    service.retailPrice = $("#addServiceInputRetailPrice").val();

    $("#addServiceInputName").val("");
    $("#addServiceImgThumb").attr("src", "img/no_image.png");
    $("#addServiceInputDescription").val("");
    $("#addServiceInputRetailPrice").val("");

    $.ajax({
        type: "POST",
        url: "/services",
        data: service,
        error: () => {
            alert("Error while trying to add product into the server.");
        },
        success: (serviceData) => {
            console.log("Success adding product of id #" + serviceData._id);
            $("#addServiceForm").modal("toggle");
            showServices();
        }
    });
};

function editService(serviceId) {
    $("#editServiceForm").modal();
    $.ajax({
        type: "GET",
        url: "/services/" + serviceId,
        error: () => {
            alert("Error while trying to get service from server.");
        },
        success: (serviceData) => {
            console.log("Success on getting from the server the service id: #" + serviceData._id);
            $("#editServiceInputID").attr("placeholder", serviceData._id);
            $("#editServiceInputName").val(serviceData.name);
            $("#editServiceImgThumb").attr("src", serviceData.photo);
            $("#editServiceInputDescription").val(serviceData.description);
            $("#editServiceInputRetailPrice").val(serviceData.retailPrice);
        }
    });
}

function saveServiceChanges() {
    let serviceId = $("#editServiceInputID").attr("placeholder");

    $.ajax({
        type: "PUT",
        url: "/services/" + serviceId,
        data: {
            name: $("#editServiceInputName").val(),
            photo: $("#editServiceImgThumb").attr("src"),
            description: $("#editServiceInputDescription").val(),
            retailPrice: $("#editServiceInputRetailPrice").val()
        },
        success: (updatedService) => {
            console.log(
                "Successful saving changes for service #" +
                serviceId
            );
            $("#editServiceForm").modal("toggle");
            showServices();
        }
    });
}

function removeService(serviceId) {
  $.ajax({
      type: "DELETE",
      url: "/services/" + serviceId,
      success: (removedService) => {
          console.log("Service deleted with given id #" + serviceId);
          showServices();
      }
  });
}

function showTimeSlots(serviceId) {
  let output = "";

  $.ajax({
      type: "GET",
      url: "services/" + serviceId + "/time-slots",
      success: (timeSlotsData) => {
          for (timeSlot of timeSlotsData) {
            output += "<li class='list-group-item'>";
            output += timeSlot.date;
            output +=
              "<span onclick='removeTimeSlotFromService(\"" +
              timeSlot._id +
              "\")' class='mini glyphicon red glyphicon-remove' style='cursor: pointer;'></span>";
            output += "</li>";
          }
          $("#time-slots-service").html(output);
      }
  });
}

function initAddTimeSlotsServiceForm(serviceId) {
  $("#addTimeSlotsServiceForm").modal("show");
  $("#addTimeSlotsServiceInputID").attr("placeholder", serviceId.toString());

  $.ajax({
      type: "GET",
      url: "/services/" + serviceId,
      error: () => {
          alert("Error while trying to get service from server.");
      },
      success: (serviceData) => {
          console.log("Success on getting time slots from service id: #" + serviceData._id);
          $("#addTimeSlotsServiceInputName").val(serviceData.name);
          showTimeSlots(serviceId);
      }
  });
}

function addTimeSlotToService() {
  let serviceId = $("#addTimeSlotsServiceInputID").attr("placeholder");
  let timeSlot = $("#addTimeSlotsServiceInputDate").val();

  $.ajax({
      type: "PUT",
      url: "/services/time-slots/" + serviceId,
      data: {
          date: timeSlot,
          orderServiceLineID: null
      },
      success: (timeSlotData) => {
          console.log("Time slot updated.");
          showTimeSlots(serviceId);
      }
  });
}

function removeTimeSlotFromService(timeSlotID) {
  let serviceId = $("#addTimeSlotsServiceInputID").attr("placeholder");
  $.ajax({
      type: "DELETE",
      url: "services/time-slots/" + timeSlotID,
      success: (timeSlotRemoved) => {
          console.log("Time-Slot " + timeSlotID + " deleted.");
          showTimeSlots(serviceId);
      }
  });
}

//Working but not refreshing when removing.
function deleteAllTimeSlotsFromService() {
  let serviceId = $("#addTimeSlotsServiceInputID").attr("placeholder");

  $.ajax({
      type: "GET",
      url: "services/" + serviceId + "/time-slots",
      success: (timeSlotsToRemove) => {
          $.ajax({
              type: "DELETE",
              url: "services/" + serviceId + "/time-slots",
              data: {
                timeSlots: JSON.stringify(timeSlotsToRemove)
              },
              success: (info) => {
                  console.log("TimeSlots were removed.");
                  showTimeSlots(serviceId);
                }
          });
      }
  });
}

//-------- Admin reports

function showOrders(){
  let totalSum = 0;
  let totalSumProduct = 0;
  let totalSumService = 0;
  let totalQtyProduct = 0;
  let totalQtyService = 0;

  $.ajax({
      type: "GET",
      url: "orders/",
      success: (orders) => {
        for (order of orders){
          console.log(JSON.stringify(order));
          let userToken = localStorage.getItem("ds_logged_token");
          if (userToken) {
              let userId = JSON.parse(atob(userToken.split(".")[1])).id;
              //getting user name from the order
              $.ajax({
                  type: "GET",
                  url: "users/" + order.userID,
                  headers: {
                      "Authorization": 'Bearer ' + userToken
                  },
                  success: (user) => {

                      if(user.name != "Error"){
                      let userName = user.name;
                      let sum = 0;
                      let qty = 0;
                      let qtyService = 0;
                      //getting products from the order
                      //if(order._id != "_design/docs"){
                        console.log("Order ID" + order._id);
                      $.ajax({
                          type: "GET",
                          url: "orders/" + order._id+ "/products/",
                          success: (products) => {
                              console.log("The PRODUCT LINE : " + JSON.stringify(products));
                              for (productLine of products) {
                                  sum += productLine.salePrice * productLine.quantity;
                                  totalSumProduct += productLine.salePrice * productLine.quantity;
                                  qty += productLine.quantity;
                              }
                              //getting services from the order
                              $.ajax({
                                  type: "GET",
                                  url: "orders/" + order._id+ "/services/",
                                  success: (services) => {
                                      for (serviceLine of services) {
                                        sum += serviceLine.salePrice;
                                        totalSumService += serviceLine.salePrice;
                                        qtyService += 1;
                                      }

                                      let output = "";
                                      output += "<li class='list-group-item' id='order-" + order._id + "'>";
                                      output +=
                                        userName +
                                        " (" +
                                        qty +
                                        " products | " +
                                        qtyService +
                                        " services | total = $" +
                                        sum.toFixed(2) +
                                        ")";
                                      output += "</li>";
                                      $("#ordersList").append(output);
                                      totalSum += sum;
                                      totalQtyProduct += qty;
                                      totalQtyService += qtyService

                                      $("#reports-no-prod-sold").html(totalQtyProduct.toString());
                                      $("#reports-sum-prod-sold").html(totalSumProduct.toFixed(2).toString());
                                      $("#reports-no-serv-sold").html(totalQtyService.toString());
                                      $("#reports-sum-serv-sold").html(totalSumService.toFixed(2).toString());
                                      $("#reports-sum-orders-values").html(totalSum.toFixed(2));
                                  }
                              });
                          }
                      });
                    //}
                  }
                  }
              });
          }
        }
      }
  });
}

function initializePhotoPicker(fileSelectID, fileElemID) {
    let photoSelect = document.getElementById(fileSelectID),
        photoElem = document.getElementById(fileElemID);

    photoSelect.addEventListener(
        "click",
        function (e) {
            if (photoElem) {
                photoElem.click();
            }
        },
        false
    );
}

function handleFiles(files, imgID) {
    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (!file.type.startsWith("image/")) {
            continue;
        }

        var img = document.getElementById(imgID);
        img.classList.add("obj");
        img.file = file;

        var reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(img);
        reader.readAsDataURL(file);
    }
}

function sendMessage() {
    $("#contact-name").val("");
    $("#contact-email").val("");
    $("#contact-find-us").prop("selectedIndex", 0);
    $("#contact-news").prop("checked", true);
    $("#contact-message").val("");

    alert("We received your message! Thanks for the feedback.");
}

function addTimeSlot() {
    let newTimeSlot = $("#addTimeSlotsServiceInputDate").val();
    let timeSlots = $("#addTimeSlotsServiceInputTimeSlots");

    if (newTimeSlot !== "") {
        let curTimeSlots = timeSlots.val();
        if (curTimeSlots !== "") {
            timeSlots.val(curTimeSlots + "\n" + newTimeSlot);
        } else {
            timeSlots.val(newTimeSlot);
        }
    } else {
        alert("Invalid date!");
    }
}

function deleteAllTimeSlots() {
    $("#addTimeSlotsServiceInputTimeSlots").val("");
}

function showProductsUser() {
    $.ajax({
        type: "GET",
        url: "/products",
        error: () => {
            alert("Error while trying to recover products from server.");
        },
        success: (products) => {
            let output = "";
            for (product of products) {
                output +=
                    "<div class='col-md-4'><div class='product'>" +
                    "<div class='link-to-prod' onclick='showSelectedProd(\"" +
                    product._id +
                    "\");'>";
                output += "<img src='" + product.photo + "' class='image'>";
                output += "<p><span>" + product.name + "</span></p></div>";
                output +=
                    "<p><span class='product-price'> $" +
                    product.retailPrice +
                    "</span></p></div></div>";
            }
            $("#productsPanel").html(output);
        }
    });
}

function showSelectedProd(id) {
    $("#root").load("html/prod1.html", () => {
        $.ajax({
            type: "GET",
            url: "/products/" + id,
            error: () => {
                alert("Error while trying to recover product #" + id + " from server.");
            },
            success: (product) => {
                $("#buyBtn").attr("onclick", "buyProduct(\"" + id + "\")");
                $("#productName").html(product.name);
                $("#productPhoto").attr("src", product.photo);
                $("#productDescription").html(product.description);
                $("#productPrice").html(product.retailPrice);
                $("#productStock").html(product.inventoryQty);
                $("#productQuantity").attr("max", product.inventoryQty);
            }
        });
    });
}

function buyProduct(id) {
    let qty = parseFloat($("#productQuantity").val());
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

function showServicesUser() {
    $.ajax({
        type: "GET",
        url: "/services",
        error: () => {
            alert("Error while trying to recover services from server.");
        },
        success: (services) => {
            let output = "";
            for (service of services) {
                output +=
                    "<div class='col-md-4'><div class='service'>" +
                    "<div class='link-to-prod' onclick='showSelectedServ(\"" +
                    service._id +
                    "\");'>";
                output += "<img src='" + service.photo + "' class='image'>";
                output += "<p><span>" + service.name + "</span></p></div>";
                output +=
                    "<p><span class='service-price'> $" +
                    service.retailPrice +
                    "</span></p></div></div>";
            }
            $("#servicePanel").html(output);
        }
    });
}

function showSelectedServ(serviceID) {
    $("#root").load("html/service1.html", () => {
        $("#service-page-id").html(serviceID);
        $.ajax({
            type: "GET",
            url: "/services/" + serviceID,
            error: () => {
                alert("Error while trying to recover services from server.");
            },
            success: (service) => {
                $("#serviceName").html(service.name);
                $("#servicePhoto").attr("src", service.photo);
                $("#serviceDescription").html(service.description);
                $("#servicePrice").html(service.retailPrice);
            }
        });

        //Get available dates for the service
        let enabledDates = [];

        $.ajax({
            type: "GET",
            url: "/services/" + serviceID + "/time-slots",
            error: () => {
                alert("Error while trying to recover service time slots from server.");
            },
            success: (timeSlots) => {
                for (timeSlot of timeSlots) {
                    if (timeSlot.orderServiceLineID === null) {
                        enabledDates.push(moment(timeSlot.date.split(" ")[0], "DD-MM,YYYY"));
                    }
                }

                //Config date time picker
                if (enabledDates.length > 0) {
                    $("#service-booking-date-picker").datetimepicker({
                        format: "DD-MM-YYYY",
                        inline: true,
                        minDate: moment(new Date()),
                        enabledDates: enabledDates
                    });
                } else {
                    $("#service-booking-date-picker").datetimepicker({
                        format: "DD-MM-YYYY",
                        inline: true
                    });
                    let current = moment();
                    $("#service-booking-date-picker")
                        .data("DateTimePicker")
                        .minDate(current)
                        .maxDate(current)
                        .disabledDates([current]);
                }
            }
        });

        //Change available time slots when user changes date
        $("#service-booking-date-picker").on("dp.change", e => {
            let selectedDate = e.date.format("DD-MM-YYYY");

            $.ajax({
                type: "GET",
                url: "/services/" + serviceID + "/time-slots",
                error: () => {
                    alert("Error while trying to recover service time slots from server.");
                },
                success: (timeSlots) => {
                    let output =
                        "<option value='' disabled selected>Select your option</option>";
                    for (timeSlot of timeSlots) {
                        let datetime = timeSlot.date.split(" ");
                        let date = datetime[0];
                        let time = datetime[1] + " " + datetime[2];
                        if (date === selectedDate && timeSlot.orderServiceLineID === null) {
                            output +=
                                "<option value='time-slot-" +
                                timeSlot._id +
                                "'>" +
                                time +
                                "</option>";
                        }
                    }
                    $("#service-booking-time-slot").html(output);
                }
            });
        });
    });
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
                    $.ajax({
                        type: "GET",
                        url: "/products/" + cartItem.id,
                        success: (product) => {
                            let output = "";

                            output += "<div class='row cart-prod'><div class='col-md-2'>";
                            output += "<img src='" + product.photo + "' class='img-thumbnail '>";
                            output += "</div>";
                            output +=
                                "<div class='col-md-8'><p class='name-in-cart'>" +
                                product.name +
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

                            totalOrder += product.retailPrice * cartItem.qty;
                            sessionStorage.setItem("totalOrder", totalOrder.toFixed(2));

                            $("#cartItemsList").append(output);
                            $("#cart-total-order").html(totalOrder.toFixed(2).toString());
                        }
                    });
                } else {
                    $.ajax({
                        type: "GET",
                        url: "/services/" + cartItem.serviceID,
                        success: (service) => {
                            let output = "";

                            output +=
                                "<div class='row cart-prod'><div class='col-md-2'>" +
                                "<img src='" +
                                service.photo +
                                "' class='img-thumbnail '>" +
                                "</div>";
                            output +=
                                "<div class='col-md-8'><p class='name-in-cart'>" +
                                service.name +
                                "<br>Reserved for your pet: " +
                                cartItem.petName +
                                "<br>Scheduled time: " +
                                cartItem.date +
                                " " +
                                cartItem.time +
                                "</p></div>";
                            output += "<div class='col-md-2'>";
                            // output += "<span class='glyphicon glyphicon-remove cart-glyphicon' onclick='removeCartProduct(" + prod.id + ")'></span>";
                            output +=
                                "<p>" +
                                "1 x " +
                                service.retailPrice +
                                " =<br>" +
                                service.retailPrice +
                                "</p>";
                            output += "</div></div>";

                            totalOrder += service.retailPrice;
                            sessionStorage.setItem("totalOrder", totalOrder.toFixed(2));

                            $("#cartItemsList").append(output);
                            $("#cart-total-order").html(totalOrder.toFixed(2).toString());
                        }
                    });
                }
            })(cartItem);
        }
    }
}

function emptyCart() {
    let ans = confirm("Are you sure you want to empty your cart?");
    if (ans == true) {
        sessionStorage.removeItem("selectedItemsInCart");
        sessionStorage.removeItem("totalOrder");
    }
    changePage("checkout.html");
}

function initPayment() {
    let userToken = localStorage.getItem("ds_logged_token");
    if (userToken) {
        let userId = JSON.parse(atob(userToken.split(".")[1])).id;

        $("#cartCheckoutForm").modal("show");
        $.ajax({
            type: "GET",
            url: "/users/" + userId,
            headers: {
                "Authorization": 'Bearer ' + userToken
            },
            success: (user) => {
                $("#deliveryAddress").val(user.address);
                $("#totalProducts").val(sessionStorage.getItem("totalOrder").toString());
            }
        });
    } else {
        changePage("login.html");
    }
}

function addOrderProductLine(orderId, cartItem) {
    // Create new order-product-line
    $.ajax({
        type: "POST",
        url: "/orders/" + orderId + "/products",
        data: {
            productID: cartItem.id,
            salePrice: cartItem.rPrice,
            quantity: cartItem.qty
        },
        success: (productLineData) => {
            // Update product 'qtySold' and 'inventoryQty'
            $.ajax({
                type: "GET",
                url: "/products/" + cartItem.id,
                success: (product) => {
                    let qtySold = cartItem.qty;
                    product.qtySold += qtySold;
                    product.inventoryQty -= qtySold;
                    $.ajax({
                        type: "PUT",
                        url: "/products/" + product._id,
                        data: product,
                        success: (updatedProduct) => {
                            console.log(
                                "Successful saving inventory quantities for product #" +
                                product._id
                            );
                        }
                    });
                }
            });
        }
    });
}

function addOrderServiceLine(orderId, cartItem) {
    $.ajax({
        type: "POST",
        url: "/orders/" + orderId + "/services",
        data: {
            serviceID: cartItem.serviceID,
            salePrice: cartItem.sPrice,
            date: cartItem.date + " " + cartItem.time,
            petID: cartItem.petID
        },
        success: (serviceLineData) => {
            $.ajax({
                type: "GET",
                url: "/services/time-slots/" + cartItem.timeSlotID,
                success: (timeSlot) => {
                    timeSlot.orderServiceLineID = serviceLineData.orderServiceLineID;
                    $.ajax({
                        type: "PUT",
                        url: "/services/time-slots/" + cartItem.timeSlotID,
                        data: timeSlot,
                        success: (updatedTimeSlot) => {
                            console.log(
                                "Successful adding service line to time slot #" + timeSlot._id
                            );
                        }
                    });
                }
            });
        }
    });
}

function savePurchase() {
    let userToken = localStorage.getItem("ds_logged_token");
    let userID = JSON.parse(atob(userToken.split(".")[1])).id;
    let creditCardNo = parseInt($("#creditCard").val());

    $.ajax({
        type: "POST",
        url: "orders/",
        data: {
            userID: userID,
            creditCardNo: creditCardNo
        },
        success: (orderData) => {
            let orderId = orderData.orderID;
            let cartItems = JSON.parse(sessionStorage.getItem("selectedItemsInCart"));
            for (cartItem of cartItems) {
                (cartItem => {
                    if (cartItem.store === "product") {
                        //Add a product line to the order
                        addOrderProductLine(orderId, cartItem);
                    } else {
                        //Add a service line to the order
                        addOrderServiceLine(orderId, cartItem);
                    }
                })(cartItem);
            }
            sessionStorage.removeItem("selectedItemsInCart");
            alert("Your order was approved! Redirecting to your profile...");
            $("#cartCheckoutForm").modal("hide");
            $("#cartCheckoutForm").on("hidden.bs.modal", e => {
                getUserData().then((userData) => {
                    let userRole = userData.role;
                    if (userRole === "client") {
                        changePage("client_profile.html");
                    } else {
                        changePage("admin_profile.html");
                    }
                });
            });
        }
    });
}

function initServiceBooking() {
    let userToken = localStorage.getItem("ds_logged_token");
    if (userToken) {
        let userID = JSON.parse(atob(userToken.split(".")[1])).id;

        $("#serviceBookingForm").modal("show");
        $.ajax({
            type: "GET",
            url: "/users/" + userID + "/pets",
            headers: {
                "Authorization": 'Bearer ' + userToken
            },
            success: (pets) => {
                let output = "";
                for (pet of pets) {
                    output +=
                        "<option value='pet-" + pet._id + "'>" + pet.name + "</option>";
                }
                $("#service-booking-pet").html(output);
            }
        });
    } else {
        alert("You need to login to make an appointment.");
        changePage("login.html");
    }
}

function addAppointmentToCart() {
    let service = {
        serviceID: $("#service-page-id").html(),
        serviceName: $("#serviceName").html(),
        sPrice: parseFloat($("#servicePrice").html()),
        petID: $("#service-booking-pet")
            .find(":selected")
            .attr("value")
            .split("-")[1],
        petName: $("#service-booking-pet")
            .find(":selected")
            .text(),
        timeSlotID: $("#service-booking-time-slot")
            .find(":selected")
            .attr("value")
            .split("-")[2],
        date: $("#service-booking-date-picker")
            .data("DateTimePicker")
            .date()
            .format("DD-MM-YYYY"),
        time: $("#service-booking-time-slot")
            .find(":selected")
            .text(),
        store: "service"
    };

    let itemsInCart = JSON.parse(sessionStorage.getItem("selectedItemsInCart"));
    if (itemsInCart === null) {
        sessionStorage.setItem("selectedItemsInCart", JSON.stringify([service]));
    } else {
        itemsInCart.push(service);
        sessionStorage.setItem("selectedItemsInCart", JSON.stringify(itemsInCart));
    }
    $("#serviceBookingForm").modal("hide");
    alert("Your appointment was added to the cart :)");
}

//-------- Manipulate the PET store
function getPetAppointments() {
    let userToken = localStorage.getItem("ds_logged_token");
    let userID = JSON.parse(atob(userToken.split(".")[1])).id;

    return $.ajax({
        type: "GET",
        url: "users/" + userID + "/pet-appointments",
        headers: {
            "Authorization": 'Bearer ' + userToken
        }
    });
}

function getPetAppointmentById(id) {
    let userToken = localStorage.getItem("ds_logged_token");

    return $.ajax({
        type: "GET",
        url: "users/pet-appointments/" + id,
        headers: {
            "Authorization": 'Bearer ' + userToken
        }
    });
}

function getPetData(petId) {
    let userToken = localStorage.getItem("ds_logged_token");
    let userID = JSON.parse(atob(userToken.split(".")[1])).id;
    return $.ajax({
        type: "GET",
        url: "users/pets/" + petId,
        headers: {
            "Authorization": 'Bearer ' + userToken
        }
    });
}

function getServiceData(serviceId) {
    return $.ajax({
        type: "GET",
        url: "services/" + serviceId
    });
}

function showPetAppointments() {
    let output = "";

    getPetAppointments().done(petAppointments => {
        for (petAppointment of petAppointments) {
            ((petAppointment) => {
                getPetData(petAppointment.petID).done(pet => {
                    getServiceData(petAppointment.serviceID).done(service => {
                        output += "<li class='list-group-item' id='pet-" + petAppointment._id + "'>";
                        output += "'" + service.name + "' for your pet '" + pet.name + "' at '" + petAppointment.date + "'";
                        output +=
                            "<a onclick='expandPetAppointmentInfo(\"" +
                            petAppointment._id +
                            "\")' href='#'><span class='mini glyphicon glyphicon-eye-open'></span></a>";
                        output += "</li>";
                        $("#petAppointmentsList").html(output);
                    });
                });
            })(petAppointment);
        }
    });
}

function expandPetAppointmentInfo(petAppointmentId) {
    getPetAppointmentById(petAppointmentId).done(petAppointment => {
        getPetData(petAppointment.petID).done(pet => {
            getServiceData(petAppointment.serviceID).done(service => {
                $("#petName").html(pet.name);
                $("#petPhoto").attr("src", pet.photo);
                $("#serviceName").html(service.name);
                $("#serviceDate").html(petAppointment.date);
                $("#servicePrice").html(petAppointment.salePrice);
                $("#servicePhoto").attr("src", service.photo);
                $("#petAppointmentInfo").modal();
            });
        });
    });
}

function addPet() {
    let name = $("#addPetInputName").val();
    let photo = $("#addPetImgThumb").attr("src");
    let breed = $("#addPetInputBreed").val();
    let age = parseInt($("#addPetInputAge").val());
    let userToken = localStorage.getItem("ds_logged_token");
    let userID = JSON.parse(atob(userToken.split(".")[1])).id;

    $("#addPetInputName").val("");
    $("#addPetImgThumb").attr("src", "img/no_image.png");
    $("#addPetInputBreed").val("");
    $("#addPetInputAge").val("");

    $.ajax({
        type: "POST",
        url: "users/" + userID + "/pets",
        headers: {
            "Authorization": 'Bearer ' + userToken
        },
        data: {
            name: name,
            photo: photo,
            breed: breed,
            age: age
        },
        success: (petData) => {
            console.log("Success adding pet for user #" + userID);
            showPets();
        }
    });
}

function showPets() {
    let userToken = localStorage.getItem("ds_logged_token");
    let userID = JSON.parse(atob(userToken.split(".")[1])).id;
    let output = "";

    $.ajax({
        type: "GET",
        url: "users/" + userID + "/pets",
        headers: {
            "Authorization": 'Bearer ' + userToken
        },
        success: (pets) => {
            for (pet of pets) {
                output += "<li class='list-group-item' id='pet-" + pet._id + "'>";
                output += pet.name;
                output +=
                    "<a onclick='removePet(\"" +
                    pet._id +
                    "\")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
                output +=
                    "<a onclick='editPet(\"" +
                    pet._id +
                    "\")' href='#'><span class='mini glyphicon glyphicon-wrench'></span></a>";
                output += "</li>";
            }
            $("#petList").html(output);
        }
    });
}

function removePet(id) {
    let userToken = localStorage.getItem("ds_logged_token");
    $.ajax({
        type: "DELETE",
        url: "/users/pets/" + id,
        headers: {
            "Authorization": 'Bearer ' + userToken
        },
        success: (petData) => {
            console.log("Pet #" + id + " was deleted.");
            showPets();
        }
    });
}

function editPet(id) {
    let userToken = localStorage.getItem("ds_logged_token");

    $("#editPetForm").modal();
    $.ajax({
        type: "GET",
        url: "users/pets/" + id,
        headers: {
            "Authorization": 'Bearer ' + userToken
        },
        success: (pet) => {
            $("#editPetInputID").html(pet._id);
            $("#editPetInputName").val(pet.name);
            $("#editPetImgThumb").attr("src", pet.photo);
            $("#editPetInputBreed").val(pet.breed);
            $("#editPetInputAge").val(pet.age);
        }
    });
}

function savePetChanges() {
    let userToken = localStorage.getItem("ds_logged_token");
    let userID = JSON.parse(atob(userToken.split(".")[1])).id;
    let petId = $("#editPetInputID").html();

    $.ajax({
        type: "PUT",
        url: "users/pets/" + petId,
        headers: {
            "Authorization": 'Bearer ' + userToken
        },
        data: {
            userID: userID,
            name: $("#editPetInputName").val(),
            photo: $("#editPetImgThumb").attr("src"),
            breed: $("#editPetInputBreed").val(),
            age: $("#editPetInputAge").val()
        },
        success: (petData) => {
            console.log("Success editting pet of id #" + petId);
            $("#editPetForm").modal("toggle");
            showPets();
        }
    });
}
