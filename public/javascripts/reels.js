var checkFile = (id) => {
  var selected_inp = document.getElementById(id);
  // console.log(selected_inp.files.length);
  // console.log(selected_inp[0]?.files?.length);

  if (!selected_inp.files.length) {
    toastr.error("Please select a file.");
    return false;
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/avif",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
  ];
  // console.log(selected_inp?.files[0].type)
  if (!allowedMimeTypes.includes(selected_inp?.files[0]?.type)) {
    toastr.error("Please select a valid file type.");
    selected_inp.value = "";
    return false;
  }
  return true;
};

$(document).ready(function () {
  var swiper;
  var liking = false;
  var bookmarking = false;

  const loadReelsAndInitializeSwiper = async function () {
    try {
      const res = await axios.get("/posts");
      const user = res.data.user;
      handle(res.data.posts, user);

      if (swiper) {
        swiper.destroy();
      }

      swiper = new Swiper(".mySwiper", {
        direction: "vertical",
        slidesPerView: 1,
        spaceBetween: 30,
        mousewheel: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        on: {
          init: function () {
            handleVideo(this);
          },
          slideChange: function () {
            handleVideo(this);
          },
        },
      });
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const handleVideo = function (swiperInstance) {
    var activeSlide = swiperInstance.slides[swiperInstance.activeIndex];
    var activeVideo = $(activeSlide).find("video");

    swiperInstance.slides.forEach(function (slide) {
      var video = $(slide).find("video");
      if (video.length > 0) {
        video[0].pause();
      }
    });

    if (activeVideo.length > 0) {
      activeVideo[0].play();

      activeVideo.on("ended", function () {
        swiperInstance.slideNext();
      });
    }
  };

  document
    .querySelector(".swiper-wrapper")
    .addEventListener("click", async function (e) {
      if (e.target.classList.contains("fa-bookmark") && !bookmarking) {
        bookmarking = true;
        const postId = e.target.id;
        const currentSlide = swiper.slides[swiper.activeIndex];
        const currentVideo = $(currentSlide).find("video");

        if (currentVideo.length > 0) {
          currentVideo[0].pause();
        }
        const bookmarkIcon = $(e.target);
        bookmarkIcon.toggleClass("fa-regular fa-solid");
        bookmarkIcon.css(
          "color",
          bookmarkIcon.hasClass("fa-solid") ? "black" : ""
        );

        const res = await axios.get(`/bookmark-post/${postId}`);
        // console.log(res);
        setTimeout(() => {
          bookmarking = false;
          handleVideo(swiper);
        }, 0);
      } else if (e.target.classList.contains("fa-heart") && !liking) {
        liking = true;

        const postId = e.target.id;
        const currentSlide = swiper.slides[swiper.activeIndex];
        const currentVideo = $(currentSlide).find("video");

        if (currentVideo.length > 0) {
          currentVideo[0].pause();
        }

        const likeIcon = $(e.target);
        likeIcon.toggleClass("fa-regular fa-solid");
        likeIcon.css("color", likeIcon.hasClass("fa-solid") ? "red" : "");

        const res = await axios.get(`/like/${postId}`);
        // console.log(res);

        setTimeout(() => {
          liking = false;
          handleVideo(swiper);
        }, 0);
      }
    });

  loadReelsAndInitializeSwiper();

  const handle = (data, user) => {
    var temp = "";
    data.forEach((e) => {
      if (e.filetype === "video") {
        temp += `
          <div class="swiper-slide">
            <video controls src="${e.file}"></video>
            <div class="icon-container">
              ${
                e.likes.includes(user._id)
                  ? `<i class="fa-solid fa-heart" style="color: red;" id="${e._id}"></i>`
                  : `<i class="fa-regular fa-heart like" id="${e._id}"></i>`
              }
              <a href="/singlepost/${
                e._id
              }"><i class="fa-regular fa-comment"></i></a>
              <a href="http://web.whatsapp.com/send?text=http://localhost:3000/singlepost/${
                e._id
              }" target="_blank"><i class="fas fa-share"></i></a> 
              ${
                user.bookmarks.includes(e._id)
                  ? `<a href=""><i class="fa-solid fa-bookmark" style="color: black;" id="${e._id}"></i></a>`
                  : `<i class="fa-regular fa-bookmark" id="${e._id}"></i>`
              }
            </div>
            <div class="video-info">
              <div class="author-photo">
                <a href="/profile/${e.author._id}"><img src="${
          e.author.profile_picture
        }" alt="${e.author.fullName}'s photo"></a>
              </div>
              <a href="/profile/${e.author._id}"><p><strong>${
          e.author.fullName
        }</strong></p></a>
              ${
                e.author._id.toString() === user._id.toString()
                  ? ""
                  : e.author.followers.includes(user._id)
                  ? `<a href="/follow/${e.author._id}"><button class="follow-btn">unFollow</button></a>`
                  : `<a href="/follow/${e.author._id}"><button class="follow-btn">Follow</button></a>`
              }
            </div>
          </div>`;
      }
    });
    document.querySelector(".swiper-wrapper").innerHTML = temp;
  };

  $(document).on("keydown", function (e) {
    if (e.key === "ArrowUp") {
      swiper.slidePrev();
    } else if (e.key === "ArrowDown") {
      swiper.slideNext();
    }
  });
});

// search
var content = document.querySelector(".search-content");
document.querySelector(".search-btn").addEventListener("click", () => {
  // console.log("clicked");
  if (document.querySelector(".search-card").style.left == "65px") {
    document.querySelector(".search-card").style.left = "-600px";
    document.querySelector(".search-btn").classList.remove("active");
    document.querySelector(".reel-btn").classList.add("active");

  } else {
    content.innerHTML = "";
    document.querySelector(".search-card").style.left = "65px";
    document.querySelector(".mdl-textfield__input").focus();
    document.querySelector(".mdl-textfield__input").value = "";
       document.querySelector(".search-btn").classList.add("active");
       document.querySelector(".reel-btn").classList.remove("active");
  }
});
document.querySelector(".swiper").addEventListener("click", (e) => {
  // console.log(e.target);
  if (
    e.target.classList.contains("swiper-wrapper") ||
    e.target.classList.contains("swiper")
  ) {
    document.querySelector(".search-card").style.left = "-600px";

    document.querySelector(".search-btn").classList.remove("active");
    document.querySelector(".notification").style.left = "-600px";
    document.querySelector(".notification-btn").classList.remove("active");
    document.querySelector(".reel-btn").classList.add("active");
    document.querySelector(".menu-overlay").style.display = "none";
    document.querySelector(".menu-btn").classList.remove("active")
  }
});
document.querySelector(".search-inp").addEventListener("keydown", function (e) {
  // console.log(e.target.value);
  if (e.target.value.length > 0) {
    axios.get(`/username/${e.target.value}`).then((res) => {
      content.innerHTML = "";
      // console.log(res.data);
      res.data.foundUser.forEach((user) => {
        content.innerHTML += `
        <a href="/profile/${user._id}"> <div class="search-img">
          <img src="${user.profile_picture}" alt="">
        </div>
        <div class="search-name">
          <h3>${user.fullName}</h3>
        </div></a>`;
      });
    });
  }
});
// notification
document.querySelector(".notification-btn").addEventListener("click", () => {
  if (document.querySelector(".notification").style.left == "65px") {
    document.querySelector(".notification").style.left = "-600px";
    document.querySelector(".notification-btn").classList.remove("active");
    document.querySelector(".reel-btn").classList.add("active");
    document.querySelector("body").style.position = "initial";
  } else {
    document.querySelector(".notification").style.left = "65px";
    document.querySelector(".notification-btn").classList.add("active");
    document.querySelector(".reel-btn").classList.remove("active");
    document.querySelector("body").style.position = "sticky";
  }
});

// create post
var overlay = document.querySelector(".overlay");
var btnoverlay = document.querySelector(".createpost");

btnoverlay.addEventListener("click", () => {
  overlay.style.display = "block";
  overlay.style.transition = "all ease .5s";
});
overlay.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("overlay") ||
    e.target.classList.contains("cross")
  ) {
    overlay.style.display = "none";
    document.querySelector(".upload-nav").style.display = "flex";
    document.querySelector(".main-nav").style.display = "initial";
    document.querySelector(".post-img").style.display = "none";
    document.querySelector(".image-preview").style.display = "none";
    document.querySelector(".vdo").style.display = "none";
    document.querySelector(".vdo-preview").style.display = "none";
    document.querySelector(".imgg").style.display = "none";
    document.querySelector("#file_inp-reels").value = "";
    overlay.style.transition = "all ease .5s";
  }
});
document.querySelector(".upload-nav").addEventListener("click", () => {
  document.querySelector("#file_inp-reels").click();
});
// menu overlay
document.querySelector(".menu-section").addEventListener("click", (e) => {
  if (document.querySelector(".menu-overlay").style.display === "block") {
    document.querySelector(".menu-overlay").style.display = "none";
    document.querySelector(".menu-btn").classList.remove("active");
    document.querySelector(".reel-btn").classList.add("active");
  } else {
    document.querySelector(".menu-overlay").style.display = "block";
    document.querySelector(".menu-btn").classList.add("active");
    document.querySelector(".reel-btn").classList.remove("active");
  }
});

// post preview
document.querySelector("#file_inp-reels").addEventListener("change", (e) => {
  if (e.target.files[0].type === "video/mp4") {
    // console.log(e.target.files[0].type);
    document.querySelector(".main-nav").style.display = "none";
    document.querySelector(".upload-nav").style.display = "none";
    document.querySelector(".post-img").style.display = "flex";
    document.querySelector(".vdo-post").style.display = "block";
  } else {
    document.querySelector(".upload-nav").style.display = "none";
    document.querySelector(".main-nav").style.display = "none";
    document.querySelector(".post-img").style.display = "flex";
    document.querySelector(".imgg-post").style.display = "block";
  }
  if (e.target.files && e.target.files[0]) {
    var reader = new FileReader();
    reader.onload = function (event) {
      // var fileContent = event.target.result;
      // console.log(fileContent);
      if (e.target.files[0].type === "video/mp4") {
        document.querySelector(".vdo-post").src = event.target.result;
      } else {
        document.querySelector(".imgg-post").src = event.target.result;
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});
