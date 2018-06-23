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

function login() {
    $.ajax({
        type: "POST",
        url: "/auth/login",
        data: {
            username: $("#loginInputEmail").val(),
            password: $("#loginInputPassword").val()
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
        url: "/user/profile",
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
}

function renderAdminProfile(userData) {
    $("#admin-photo").attr("src", userData.photo);
    $("#admin-name").html(userData.name);
    $("#admin-phone").html(userData.phone);
    $("#admin-email").html(userData.email);
    $("#admin-address").html(userData.address);
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