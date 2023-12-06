// check file fn
var overlay3 = document.querySelector(".overlay3");
var storyUser = {};
var story = [];
var user = {};
var followers = [];
var followersIndx = 0;
let interval;
var time = 0;
var flag = 0;
var storys = document.querySelector(".story-section");
var checkFile = () => {
  // document.querySelector("#file_inp")
  var selected_inp = document.querySelector("#file_inp");
  if (!selected_inp) {
    return;
  }
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
  ];
  if (!allowedMimeTypes.includes(selected_inp.files[0].type)) {
    alert("Invalid file type ");
    selected_inp.value = "";
  }
};

// cross post button overlay
var post_area = document.querySelector(".post-area");
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
    overlay.style.transition = "all ease .5s";
  }
});

var posts = [];
var user = {};

var temp = "";
const likeHandler = async function (e) {
  const res = await axios.get(`/like/${e}`);
  loadPosts();
};

const loadPosts = async function () {
  try {
    const res = await axios.get("/posts");
    user = res.data.user;
    const likesCount = res.data.likesPopulate.map((e) => {
      if (e.likes.length !== 0) {
        // console.log(e.likes[(e.likes.length-1)].fullName)
        return e.likes[e.likes.length - 1].fullName;
      }
      return null;
    });
    // console.log(likesCount[likesCount.length-1])
    handle(res.data.posts, user);
  } catch (error) {
    console.error("Error loading posts:", error);
  }
};
loadPosts();

function timeAgo(input) {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
}

const handle = (data, user) => {
  temp = "";
  data.reverse().forEach((e, index) => {
    // console.log(like[index]);
    temp += `<div  class="post-main" >
              <div class="post-header">
                <div class="post-left-header">  
                  <div class="post-image">
                    <img src="${e.author.profile_picture}" alt="" />
                  </div>
                  <a href="/profile/${e.author._id} "
                    ><p class="post-username">${e.author.fullName}</p></a
                  >
                  <i class="fa-solid fa-certificate"></i>
                  <span class="one-day"
                    > ${
                      timeAgo(e.time) ? timeAgo(e.time) : "1 second ago"
                    } </span
                  >
                </div>
                <i class="fa-solid fa-grip-lines"></i>
              </div>
              <div class="post-main-image">
                ${
                  e.filetype == "video"
                    ? `<a href="/singlepost/${e._id}">
                    <video class="feeds" controls loop src="${e.file}"></video> 
                    </a>`
                    : `<a href="/singlepost/${e._id}">
                      <img class="feeds" src="${e.file}" alt="" />
                    </a>`
                }
              </div>
              <div class="post-fotter">
                <div class="post-fotter-left">
                  ${
                    e.likes.includes(user._id)
                      ? `<i class="fa-solid fa-heart like " style="color: red;" id="${e._id}"></i>`
                      : `<i class="fa-regular fa-heart like" id="${e._id}"></i>`
                  }
                  <i class="fa-regular fa-message comment " id=${e._id}></i>
                  <i class="fa-regular fa-paper-plane" id=${e._id}></i>
                </div>
                ${
                  user.bookmarks.includes(e._id)
                    ? ` <i class="fa-solid fa-bookmark" id="${e._id}"></i>`
                    : `<i class="fa-regular fa-bookmark" id="${e._id}"></i>`
                }
              </div>
              <div class="post-description">
                <p class="post-liked">Liked by <b>${
                  e.likes.length
                }</b> people</p>
                <p class="title">
                  <span>${e.title} </span>
                </p>
                <a href="/singlepost/${e._id}">
                  <p class="comments">view all ${e.comments.length} comments</p> 
                </a>
              </div>
            </div>`;
  });
  post_area.innerHTML = temp;
};
var qr = document.querySelector(".share-menu");
qr.addEventListener("click", (e) => {
  if (e.target.classList.contains("share-menu")) {
    qr.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
var qr_btn = document.querySelector(".share-btn");
qr_btn.addEventListener("click", (e) => {
  if (e.target.classList.contains("share-btn")) {
    qr_btn.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
var overlay2 = document.querySelector(".overlay2");
var handdleBookmark = async (e) => {
  const res = await axios.get(`/bookmark-post/${e}`);
  loadPosts();
};
const shareHandler = async (e) => {
  const res = await axios.get(`/shareqr/${e}`);
  // console.log(res);
  document.querySelector(".share-btn").style.display = "block";
  document.querySelector(
    ".whatsapp-a"
  ).href = `http://web.whatsapp.com/send?text=http://localhost:3000/singlepost/${e}`;
  document
    .querySelector(".ri-qr-scan-2-line")
    .addEventListener("click", (e) => {
      document.querySelector(".share-btn").style.display = "none";
      document.querySelector(".qrimg").src = `${res.data.qrCode}`;
      document.querySelector(".share-menu").style.display = "block";
    });
};
post_area.addEventListener("click", async (e) => {
  if (e.target.classList.contains("like")) {
    likeHandler(e.target.id);
  } else if (e.target.classList.contains("fa-bookmark")) {
    handdleBookmark(e.target.id);
  } else if (e.target.classList.contains("fa-paper-plane")) {
    // console.log(e.target.id);
    shareHandler(e.target.id);
  } else if (e.target.classList.contains("comment")) {
    document.body.style.overflow = "hidden";
    const { data } = await axios.get(`/post/${e.target.id}`);
    overlay2.style.display = "block";
    overlay2.innerHTML = `<div class="comment-popup-container">
    <ul class="comments-list">
    ${
      data.post.comments.length === 0
        ? `<li class="comment">
      <div class="comment-details">
        <h4 class="comment-username">No Comments</h4>
      </div>
    </li>`
        : ""
    }
      ${data.post.comments.map(
        (comment) =>
          `<li class="comment">
        <img class="comment-avatar" src="${
          comment.author.profile_picture
        }" alt="" />
        <a class="comment-details" href="/profile/${comment.author._id}">
          <h4 class="comment-username">${comment.author.fullName}</h4>
          <p class="comment-text">${comment.comment}</p>
        </a>
        ${
          comment.author._id === data.user._id || data.user._id === data.post.author._id
            ? `<a href="/deletecomment/${data.post._id}/${comment._id}">
        <button class="delete-comment">Delete</button>
      </a>`
            : ""
        } 
      </li>`
      )}
    </ul>
    <form class="comment-form" action="/comment/${data.post._id}" method="POST">
      <textarea name="comment" class="comment-textarea" placeholder="Write a comment..."></textarea>
      <button class="comment-button">Post</button>
    </form>
  </div>`;
  }
});

overlay2.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("overlay2") ||
    e.target.classList.contains("cross")
  ) {
    overlay2.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
var overlay4 = document.querySelector(".overlay4");
overlay4.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("overlay4") ||
    e.target.classList.contains("cross")
  ) {
    overlay4.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
var content = document.querySelector(".search-content");
document.querySelector(".search-btn").addEventListener("click", () => {
  // console.log("clicked");
  if(document.querySelector(".search-card").style.left == "-600px"){
    content.innerHTML = "";
    document.querySelector(".search-card").style.left = "65px";
    document.querySelector(".search-card").style.display = "flex"
  document.querySelector(".main").style.position = "fixed";

    document.querySelector(".mdl-textfield__input").focus();
    document.querySelector(".mdl-textfield__input").value = "";
  }else{
    document.querySelector(".search-card").style.left = "-600px";
    document.querySelector(".search-card").style.display = "none";
  document.querySelector(".main").style.position = "initial";

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


document.querySelector(".middle-section").addEventListener("click", () => {
  document.querySelector(".menu-overlay").style.display = "none";
});
var toggleMenu = function (e) {
  var menu_overlay = document.querySelector(".menu-overlay");
  if (menu_overlay.style.display === "flex") {
    menu_overlay.style.display = "none";
  } else {
    menu_overlay.style.display = "flex";
  }
};
document
  .querySelector(".story-section")
  .addEventListener("click", async (e) => {
    console.log(e.target);
    if (e.target.classList.contains("add_story_btn")) {
      document.querySelector(".overlay4").style.display = "flex";
      document.body.style.height = "100%";
      document.body.style.overflow = "hidden";
    } else {
      followersIndx = e.target.getAttribute("key");
      if (!e.target.id) return;
      console.log(e.target.id);
      const { data } = await axios.get(`/story/${e.target.id}`);
      story = data.user.stories;
      storyUser = data.user;
      if (story.length == 0) return;
      showStory(0);
      document.body.style.overflow = "hidden";
    }
  });

const startTimer = (index) => {
  if (index === null) {
    overlay3.style.display = "none";
    document.body.style.overflow = "auto";
    return;
  }
  clearInterval(interval);
  time = 0;
  interval = setInterval(() => {
    if (time == 450) {
      clearInterval(interval);
      showStory(index + 1);
    }
    time++;
    document.querySelector(".progress_bar").style.width = `${
      (time / 450) * 100
    }%`;
  }, 10);
  const videoElement = document.querySelector(".story_img");
  if (videoElement && videoElement.tagName === "VIDEO") {
    videoElement.play();
  }
};

const pauseTimer = (index) => {
  if (flag == 0) {
    clearInterval(interval);
    flag = 1;
    document.querySelector(".play_btn").classList.remove("ri-pause-fill");
    document.querySelector(".play_btn").classList.add("ri-play-fill");
    const videoElement = document.querySelector(".story_img");
    if (videoElement && videoElement.tagName === "VIDEO") {
      videoElement.pause();
    }
  } else {
    flag = 0;
    interval = setInterval(() => {
      if (time == 450) {
        clearInterval(interval);
        showStory(index + 1);
      }
      time++;
      document.querySelector(".progress_bar").style.width = `${
        (time / 450) * 100
      }%`;
    }, 10);
    const videoElement = document.querySelector(".story_img");
    if (videoElement && videoElement.tagName === "VIDEO") {
      videoElement.play();
    }
    document.querySelector(".play_btn").classList.remove("ri-play-fill");
    document.querySelector(".play_btn").classList.add("ri-pause-fill");
  }
};

const showStory = async (index) => {
  flag = 0;
  if (index === null) {
    overlay3.style.display = "none";
    document.body.style.overflow = "auto";
    clearInterval(interval);
    return;
  }
  if (story[index]) {
    console.log(index);
    var close = `<div class="cross-icon">
    <img src="../images/cross.png" alt="" class="cross" />
  </div>`;
    var card = `<div class="card">
    <div class="progress_bar_wrap">
        <div class="progress_bar" style="width:0%;"></div>
    </div>
    <div class="card_controls">
        <i class="ri-pause-fill play_btn" onclick="pauseTimer(${index})"></i>
        <div class="profile">
            <img src="${storyUser.profile_picture}" alt="" class="profile_img" />
            <span class="yours">${storyUser.fullName}</span>
            <span class="time">${ timeAgo(story[index].time) ? timeAgo(story[index].time) : "1 second ago"}</span>
        </div>
    </div>
  </div>`;
    console.log(story[index].filetype);
    var img;
    if (
      typeof story[index].filetype === "undefined" ||
      story[index].filetype === "video"
    ) {
      img = `<video autoplay loop src="/uploads/${story[index].file}" alt="" class="story_img"></video>`;
    } else {
      img = `<img src="/uploads/${story[index].file}" alt="" class="story_img" />`;
    }

    console.log("Image Path:", story[index].file);
    var next = `<button class="next-btn" onclick="showStory(${
      index + 1
    })"> <i class="ri-arrow-right-line"></i> </button>`;
    var prev = `<button class="prev-btn" onclick="showStory(${
      index - 1
    })"> <i class="ri-arrow-left-line"></i> </button>`;
    overlay3.style.display = "flex";
    if (index == story.length - 1)
      next = `<button class="next-btn" onclick="showStory(${
        index + 1
      })"> </button>`;
    if (index == 0)
      prev = `<button class="prev-btn" onclick="showStory(${
        index - 1
      })"> </button>`;
    if (index == story.length - 1) {
      if (
        typeof story[index].filetype === "undefined" ||
        story[index].filetype === "video"
      ) {
        img = `<video autoplay loop src="/uploads/${story[index].file}" alt="" class="story_img"></video>`;
      } else {
        img = `<img src="/uploads/${story[index].file}" alt="" class="story_img" />`;
      }
    }

    overlay3.innerHTML = close + card + img + next + prev;
    startTimer(index);
  } else {
    if (index === -1) followersIndx--;
    else followersIndx++;
    if (followers[followersIndx]?._id) {
      const { data } = await axios.get(
        `/story/${followers[followersIndx]._id}`
      );
      story = data.user.stories;
      storyUser = data.user;
      if (story.length == 0) return;
      showStory(0);
    } else {
      const videoElement = document.querySelector(".story_img");
      if (videoElement && videoElement.tagName === "VIDEO") {
        videoElement.pause();
      }
      overlay3.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }
};
overlay3.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("cross") ||
    e.target.classList.contains("overlay3")
  ) {
    const videoElement = document.querySelector(".story_img");
    if (videoElement && videoElement.tagName === "VIDEO") {
      videoElement.pause();
    }
    overlay3.style.display = "none";
    document.body.style.overflow = "hidden";
    showStory(null);
    startTimer(null);
    clearInterval(interval);
  }
});

const fetchStories = async () => {
  const { data } = await axios.get("/story");
  // console.log(data);
  var temp = `<div class="story" key="${-1}" id="${data.user._id}">
  <div class="story-image"  key="${-1}" id="${data.user._id}">
    <img  key="${-1}" id="${data.user._id}"
      src="${data.user.profile_picture}"
      alt=""
    />
  </div>
  <div class="add_story add_story_btn">
    <i class="fa-solid fa-plus add_story_btn"></i>
  </div>
  <span>${data.user.fullName}</span>
</div>`;
  data.followers.forEach((follow, i) => {
    if (follow?.stories[0]) {
      temp += `<div class="story" key="${i}" id="${follow._id}">
      <div class="story-image"  key="${i}" id="${follow._id}">
        <img  key="${i}" id="${follow._id}"
          src="${follow.profile_picture}"
          alt=""
        />
      </div>
      <span>${follow.fullName}</span>
    </div>`;
      followers.push(follow);
    }
  });
  storys.innerHTML = temp;
};
fetchStories();
var middle = document.querySelector(".middle-section");
middle.addEventListener("click", (e) => {
  document.querySelector(".search-card").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";

}
);
var follow = document.querySelector(".follow-section");
follow.addEventListener("click", (e) => {
  document.querySelector(".search-card").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";

}
);

middle.addEventListener("click", (e) => {
  document.querySelector(".notification").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";

}
);
follow.addEventListener("click", (e) => {
  document.querySelector(".notification").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";

}
);
document.querySelector(".notification-btn").addEventListener("click", () => {
  if(document.querySelector(".notification").style.left == "-600px"){
    document.querySelector(".notification").style.left = "65px";
    document.querySelector(".notification").style.display = "flex"
  document.querySelector(".main").style.position = "fixed";

  }else{
    document.querySelector(".notification").style.left = "-600px";
    document.querySelector(".notification").style.display = "none";
  document.querySelector(".main").style.position = "initial";

  }
});

// notifcation


