function changePage(dest) {
    console.log("Received request to change to page: '" + dest + "'.");

    // Change page aspect
    if (dest.search("admin_") === 0) {
        console.log("aqui...");
        $("#bodyContent").load(dest, () => {
            console.log("Change made...");

            if (dest === "admin_products.html") {
                showProducts();
            } else if (dest === "admin_user_roles.html") {
                showUsers();
            } else if (dest === "admin_profile.html") {
                showAdminProfile();
            }
        });
    } else {
        $("#test").load(dest, () => {
            console.log("Change made...");
        });
        if (dest !== 'home.html') {
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

    console.log("calling push state...");
    if (dest !== 'admin_logout.html') {
        history.pushState({
            foo: dest
        }, "", dest);
    } else {
        history.pushState({
            foo: dest
        }, "", 'home.html');
    }

    checkLoggedUser();
}

function checkLoggedUser() {
    let res = sessionStorage.getItem("userEmail");
    console.log("saved user email = " + res);
    // Check if there's a logged user
    if (res !== null) {
        $("#loginOption").hide();
        $("#logoutOption").show();
        $("#userHomepage").show();
    } else {
        $("#loginOption").show();
        $("#logoutOption").hide();
        $("#userHomepage").hide();
    }
}

function userHomepage() {
    let role = sessionStorage.getItem("userRole");
    if (role === 'client') {
        changePage("client_profile.html");
    } else {
        changePage("admin_profile.html");
    }
}

function userLogout() {
    let role = sessionStorage.getItem("userRole");
    sessionStorage.clear();
    if (role === 'admin') {
        changePage('admin_logout.html');
    } else {
        changePage('home.html');
    }
}