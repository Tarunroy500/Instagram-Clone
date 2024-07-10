
// var went_to = document.querySelector(".went_to");
// var degree = document.querySelector(".degree");
// var field_of_study = document.querySelector(".field_of_study");
// var website = document.querySelector(".website");
// var birthdate = document.querySelector(".birthdate");
// var lives_in = document.querySelector(".lives_in");
// var from = document.querySelector(".from");
// var popupOverlay = document.querySelector(".popup-overlay");
// var saveedit = document.querySelector(".save-edit");
// var went_to = document.querySelector(".went_to");
// var lives_in = document.querySelector(".lives_in");
// var from = document.querySelector(".from");
// var gender = document.querySelector(".gender");

// async function Saveedit() {
//   console.log("gender", gender.value);
//   const user = {
//     went_to: went_to.value,
//     lives_in: lives_in.value,
//     from: from.value,
//     field_of_study: field_of_study.value,
//     degree: degree.value,
//     website: website.value,
//     birthdate: birthdate.value,
//     gender: gender.value,
//   };

//   await axios.post("/save-edit", user).then((res) => {
//     if (res.data.message === "success") {
//       popupOverlay.style.display = "none";
//       went_to.innerHTML = res.data.user.went_to;
//       lives_in.innerHTML = res.data.user.lives_in;
//       from.innerHTML = res.data.user.from;
//     }
//   });
// }
// saveedit.addEventListener("click", Saveedit);

// follow & followers
document.querySelector(".followers-popup").addEventListener("click", () => {
  document.querySelector(".share-overlay2").style.display = "block";
});
document.querySelector(".following-popup").addEventListener("click", () => {
  document.querySelector(".share-overlay1").style.display = "block";
});
document.querySelector(".share-overlay2").addEventListener("click", (e) => {
  console.log(e.target);
  if (
    e.target.classList.contains("share-overlay2") ||
    e.target.classList.contains("cross1")
  ) {
    document.querySelector(".share-overlay2").style.display = "none";
    document.querySelector(".share-overlay2").style.transition = "all ease .5s";
  }
});
document.querySelector(".share-overlay1").addEventListener("click", (e) => {
  console.log(e.target);
  if (
    e.target.classList.contains("share-overlay1") ||
    e.target.classList.contains("cross11")
  ) {
    document.querySelector(".share-overlay1").style.display = "none";
    document.querySelector(".share-overlay1").style.transition = "all ease .5s";
  }
});
// function closePopup() {
//   var popupContainer = document.querySelector(".share-overlay");
//   popupContainer.style.display = "none";
// }


var editBtn = document.querySelector(".profile-edit-btn");
      var popupOverlay = document.querySelector(".popup-overlay");
      var closeBtn = document.querySelector(".close-btn");
      var cancelBtn = document.querySelector(".cancel-btn");

      editBtn.addEventListener("click", function () {
          popupOverlay.style.display = "block";
          editBtn.style.color="red"
      });

      closeBtn.addEventListener("click", function () {
        popupOverlay.style.display = "none";
      });

      cancelBtn.addEventListener("click", function () {
        popupOverlay.style.display = "none";
      });
// save edits
var fullName = document.querySelector(".name");
var bio = document.querySelector(".bio");
var links = document.querySelector(".links");
var popupOverlay = document.querySelector(".popup-overlay");
var saveedit = document.querySelector(".save-edit");

var profileUserName = document.querySelector(".profile-user-name");
var profileRealBio = document.querySelector(".profile-real-bio");
var profileRealLinks = document.querySelector(".profile-real-links");


async function Saveedit() {
  // console.log("name", fullName.value);
  // console.log(user.fullName);
  var x = fullName.value;
  if (fullName.value.trim() == "") {
    const res = await axios.get("/getloggedInUser")
    x = res.data.loggedInUser.fullName
  }
  const user = {
    fullName: x,
    links: links.value,
    bio: bio.value,
  };

  await axios.post("/save-edit", user).then((res) => {
    if (res.data.message === "success") {
      popupOverlay.style.display = "none";
      // console.log(res.data.user.fullName);
      profileUserName.innerHTML = res.data.user.fullName;
      profileRealBio.innerHTML = res.data.user.bio;
      profileRealLinks.innerHTML = res.data.user.links;
    }
  });
}
saveedit.addEventListener("click", Saveedit);

// profile photo upload

var profileInput = document.querySelector("#profile-input");
var profile_image = document.querySelector(".profile-image");
var profile = document.querySelector(".profile");
profile_image.onclick = function () {
  profileInput.click();
};
profileInput.onchange = function (e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function () {
    profile_image.src = reader.result;
  };
  reader.readAsDataURL(file);
  const formData = new FormData();
  formData.append("profilePhoto", file);
  axios
    .post("/uploadprofile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      // console.log(res);
      var temp = `
            <img src=" ${res.data.user.profile_picture} " alt="" />
          `;
      profile_image.innerHTML = temp;
    });
};

// profile auto play post
 function playVideo(element) {
   var video = element.querySelector("video");
   video.play();
 }

 function pauseVideo(element) {
   var video = element.querySelector("video");
   video.pause();
 }



    //   var Profile_images = document.getElementById("Profile_images");
    //   var Cover_image = document.getElementById("Cover_image");
    //   var coverimagebtn = document.getElementById("cover-image-btn");
    //   var inp_file = document.getElementById("inp_file");
    //   var inp_file2 = document.getElementById("inp_file2");
    //   Profile_images.onclick = function () {
    //     inp_file.click();
    //   };
    //   inp_file.onchange = function (e) {
    //     var file = e.target.files[0];
    //     var reader = new FileReader();
    //     reader.onload = function () {
    //       Profile_images.src = reader.result;
    //     };
    //     reader.readAsDataURL(file);
    //     const formData = new FormData();
    //     formData.append("profile_image", file);
    //     axios
    //       .post("/uploadprofile", formData, {
    //         headers: {
    //           "Content-Type": "multipart/form-data",
    //         },
    //       })
    //       .then((res) => {
    //         console.log(res);
    //       });
    //   };
    //   coverimagebtn.onclick = function () {
    //     inp_file2.click();
    //   };
    //   inp_file2.onchange = function (e) {
    //     var file = e.target.files[0];
    //     var reader = new FileReader();
    //     reader.onload = function () {
    //       Cover_image.src = reader.result;
    //     };
    //     reader.readAsDataURL(file);
    //     const formData = new FormData();
    //     formData.append("cover_image", file);
    //     axios
    //       .post("/uploadcover", formData, {
    //         headers: {
    //           "Content-Type": "multipart/form-data",
    //         },
    //       })
    //       .then((res) => {
    //         console.log(res);
    //       });
    //   };

// js new
function openSection(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName(
    "profile__section__tab__tabcontent"
  );
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

