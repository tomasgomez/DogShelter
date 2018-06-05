function changePage(dest) {
  console.log("Received request to change to page: '" + dest + "'.");

  // Change page aspect
  if (dest.search("admin_") === 0) {
    $("#bodyContent").load(dest, () => {
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
      } else if (dest === "admin_user_roles.html") {
        showUsers();
      } else if (dest === "admin_profile.html") {
        showAdminProfile();
      } else if (dest === "admin_reports.html") {
        showOrders();
      }
    });
  } else {
    $("#test").load(dest, () => {
      if (dest === "register.html") {
        initializePhotoPicker("registerPhotoSelect", "registerPhotoElem");
      } else if (dest === "client_profile.html") {
        showClientProfile();
        initializePhotoPicker("addPetPhotoSelect", "addPetInputPhoto");
        initializePhotoPicker("editPetPhotoSelect", "editPetInputPhoto");
      } else if (dest === "products.html") {
        showProductsUser();
      } else if (dest === "services.html") {
        showServicesUser();
      } else if (dest === "orders.html") {
        showOrder();
      }
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

  if (dest !== "admin_logout.html") {
    history.pushState(
      {
        foo: dest
      },
      "",
      dest
    );
  } else {
    history.pushState(
      {
        foo: dest
      },
      "",
      "home.html"
    );
  }

  checkLoggedUser();
}

function checkLoggedUser() {
  let res = sessionStorage.getItem("userEmail");
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
  if (role === "client") {
    changePage("client_profile.html");
  } else {
    changePage("admin_profile.html");
  }
}

function userLogout() {
  let role = sessionStorage.getItem("userRole");
  // sessionStorage.clear();
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userID");
  sessionStorage.removeItem("userRole");
  if (role === "admin") {
    changePage("admin_logout.html");
  } else {
    changePage("home.html");
  }
}

function initializePhotoPicker(fileSelectID, fileElemID) {
  let photoSelect = document.getElementById(fileSelectID),
    photoElem = document.getElementById(fileElemID);

  photoSelect.addEventListener(
    "click",
    function(e) {
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
    reader.onload = (function(aImg) {
      return function(e) {
        aImg.src = e.target.result;
      };
    })(img);
    reader.readAsDataURL(file);
  }
}

function calendar() {
  jQuery(".calendar7").Calendar7({
    allowTimeStart: "6:00",
    allowTimeEnd: "20:00"
  });
}

function sendMessage() {
  $("#contact-name").val("");
  $("#contact-email").val("");
  $("#contact-find-us").prop("selectedIndex", 0);
  $("#contact-news").prop("checked", true);
  $("#contact-message").val("");

  alert("We received your message! Thanks for the feedback.");
}
