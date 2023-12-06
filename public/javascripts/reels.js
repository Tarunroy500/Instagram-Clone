
$(document).ready(function () {
  var swiper;

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
          slideChange: function () {
            var previousSlide = this.slides[this.previousIndex];
        var currentSlide = this.slides[this.activeIndex];

        var previousVideo = $(previousSlide).find("video");
        if (previousVideo.length > 0) {
          previousVideo[0].pause();
        }
          },
        },
      });

      swiper.on("slideChange", function () {
        var currentSlide = this.slides[this.activeIndex];
    
        var currentVideo = $(currentSlide).find("video");
        if (currentVideo.length > 0) {
          currentVideo[0].play();
    
          currentVideo.on("ended", function () {
            swiper.slideNext();
          });
        }
      });
    
      

    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };


  var user = {};
  var temp = "";
  const loadreels = async function () {
    try {
      const res = await axios.get("/posts");
      user = res.data.user;
      handle(res.data.posts, user);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };
  document.querySelector(".swiper-wrapper").addEventListener("click",async function (e) {
    console.log(e.target);
    if(e.target.classList.contains("fa-bookmark")) {
      const res = await axios.get(`/bookmark-post/${e.target.id}`)
      console.log(res);
      loadreels()
    }else if(e.target.classList.contains("fa-heart")) {
      const res = await axios.get(`/like/${e.target.id}`)
      console.log(res);
      loadreels()
  }
  });
  
  loadreels();
  const handle = (data, user) => {
    temp = "";
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
              <a href="/singlepost/${e._id}"><i class="fa-regular fa-comment"></i></a>
              <a href="http://web.whatsapp.com/send?text=http://localhost:3000/singlepost/${e._id}" target="_blank"><i class="fas fa-share"></i></a> 
              ${
                user.bookmarks.includes(e._id)
                  ? `<a href=""><i class="fa-solid fa-bookmark" style="color: black;" id="${e._id}"></i></a>`
                  : `<i class="fa-regular fa-bookmark" id="${e._id}"></i>`
              }
            </div>
            <div class="video-info">
              <div class="author-photo">
                <a href="/profile/${e.author._id}"><img src="${e.author.profile_picture}" alt="${e.author.fullName}'s photo"></a>
              </div>
              <a href="/profile/${e.author._id}"><p><strong>${e.author.fullName}</strong></p></a>
              ${
                e.author._id.toString() === user._id.toString()
                  ? ''
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
    }
    else if (e.key === "ArrowDown") {
      swiper.slideNext();
    }
  });
  loadReelsAndInitializeSwiper();
});

