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

// function removeProduct(id) {
//     let userToken = localStorage.getItem("ds_logged_token");
//     $.ajax({
//         type: "DELETE",
//         url: "/products/" + id,
//         headers: {
//             "Authorization": 'Bearer ' + userToken
//         },

//     });
// }

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
function showPetAppointments() {
    // let userToken = localStorage.getItem("ds_logged_token");
    // let userID = JSON.parse(atob(userToken.split(".")[1])).id;
    // let output = "";

    // $.ajax({
    //     type: "GET",
    //     url: "users/" + userID + "/pets",
    //     headers: {
    //         "Authorization": 'Bearer ' + userToken
    //     },
    //     success: (pets) => {
    //         for (pet of pets) {
    //             output += "<li class='list-group-item' id='pet-" + pet._id + "'>";
    //             output += pet.name;
    //             output +=
    //                 "<a onclick='removePet(\"" +
    //                 pet._id +
    //                 "\")' href='#'><span class='mini glyphicon red glyphicon-remove'></span></a>";
    //             output +=
    //                 "<a onclick='editPet(\"" +
    //                 pet._id +
    //                 "\")' href='#'><span class='mini glyphicon glyphicon-wrench'></span></a>";
    //             output += "</li>";
    //         }
    //         $("#petList").html(output);
    //     }
    // });
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