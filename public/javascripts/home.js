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
// cross post button overlay
var post_area = document.querySelector(".post-area");
var overlay = document.querySelector(".overlay");
var btnoverlay = document.querySelector(".createpost");

btnoverlay.addEventListener("click", () => {
  overlay.style.display = "block";
  document.querySelector(".createpost").classList.add("active");
  document.querySelector(".home-btn").classList.remove("active");
  overlay.style.transition = "all ease .5s";
});
overlay.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) {
    overlay.style.display = "none";
    document.querySelector(".createpost").classList.remove("active");
    document.querySelector(".home-btn").classList.add("active");
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
async function openStory(e) {
  // console.log("hello")
  const { data } = await axios.get(`/story/${e}`);
  // console.log(res);
  story = data.user.stories;
  storyUser = data.user;
  if (story.length == 0) {
    window.location.href = `/profile/${e}`;
    return;
  }
  showStory(0);
  document.body.style.overflow = "hidden";
}
const handle = (data, user) => {
  temp = "";
  data.reverse().forEach((e) => {
    // console.log(like[index]);
    if (!(user.blockedUsers.includes(e.author._id) || e.author.blockedUsers.includes(user._id))) {
      temp += `<div  class="post-main" >
                <div class="post-header">
                  <div class="post-left-header">  
                    <div class="post-image"  onclick="openStory('${
                      e.author._id
                    }')">
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
                  <i class="fa-solid fa-grip-lines" id="${e._id}"></i>
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
                    <p class="comments">view all ${
                      e.comments.length
                    } comments</p> 
                  </a>
                </div>
              </div>`;
    }
  });
  post_area.innerHTML = temp;
};
async function postComment(postId) {
  const commentForm = document.getElementById(`comment-form-${postId}`);
  const commentInput = commentForm.querySelector("textarea");
  const commentText = commentInput.value.trim();

  if (commentText !== "") {
    try {
      const res = await axios.post(`/comment/${postId}`, {
        comment: commentText,
      });
      // console.log(res.data);
      commentInput.value = "";
      loadComments(postId);
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  }
}
async function deleteComment(postId, commentId) {
  try {
    await axios.get(`/deletecomment/${postId}/${commentId}`);
    loadComments(postId);
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

async function loadComments(postId) {
  try {
    const { data } = await axios.get(`/post/${postId}`);
    const commentsList = document.querySelector(".comments-list");
    commentsList.innerHTML = data.post.comments
      .map(
        (comment) => `<li class="comment">
          <img class="comment-avatar" src="${
            comment.author.profile_picture
          }" alt="" />
          <a class="comment-details" href="/profile/${comment.author._id}">
            <h4 class="comment-username">${comment.author.fullName}</h4>
            <p class="comment-text">${comment.comment}</p>
            ${
              comment.author._id === data.user._id ||
              data.user._id === data.post.author._id
                ? `<a href="javascript:void(0);" onclick="deleteComment('${data.post._id}', '${comment._id}')">
                      <button class="delete-comment">Delete</button>
                    </a>`
                : ""
            } 
          </a>
        </li>`
      )
      .join("");
  } catch (error) {
    console.error("Error loading comments:", error);
  }
}
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
  postId = e;
  document.querySelector(".share-btn").style.display = "block";
  const qrScanElement = document.querySelector(".ri-qr-scan-2-line");
  const msgShareElement = document.querySelector(".msg-share");
  const popupContainer = document.querySelector("#popup-container");
  const handleSendButtonClick = async (event) => {
    if (event.target.classList.contains("send-button")) {
      receiver_id = event.target.id;
      const shareChatMsgResponse = await axios.get(
        `/share-chat-msg/${receiver_id}/${postId}`
      );
      if (shareChatMsgResponse.data.success) {
        closePopup();
        toastr.success(
          `Post Sent to ${shareChatMsgResponse.data.data.receiver_id.fullName}`
        );
      } else {
        toastr.error(shareChatMsgResponse.data.msg);
      }
      popupContainer.removeEventListener("click", handleSendButtonClick);
    }
  };
  const handleQrScanClick = () => {
    document.querySelector(".share-btn").style.display = "none";
    document.querySelector(".qrimg").src = `${res.data.qrCode}`;
    document.querySelector(".share-menu").style.display = "block";
    qrScanElement.removeEventListener("click", handleQrScanClick);
    popupContainer.removeEventListener("click", handleSendButtonClick);
  };

  const handleMsgShareClick = () => {
    document.querySelector(".share-btn").style.display = "none";
    document.querySelector(".share-overlay").style.display = "block";
    msgShareElement.removeEventListener("click", handleMsgShareClick);
    // popupContainer.removeEventListener("click", handleSendButtonClick);
  };
  const handleWhatsAppShare = () => {
    document.querySelector(".share-btn").style.display = "none";
    // Replace this URL with the appropriate URL for WhatsApp sharing
    document.querySelector(
      ".whatsapp-a"
    ).href = `http://web.whatsapp.com/send?text=http://localhost:3000/singlepost/${postId}`;
    // Show the WhatsApp share menu or perform any other actions needed
    // For example: document.querySelector(".whatsapp-share-menu").style.display = "block";
    document
      .querySelector(".whatsapp-a")
      .removeEventListener("click", handleWhatsAppShare);
    popupContainer.removeEventListener("click", handleSendButtonClick);
  };
  qrScanElement.removeEventListener("click", handleQrScanClick);
  msgShareElement.removeEventListener("click", handleMsgShareClick);
  popupContainer.removeEventListener("click", handleSendButtonClick);
  document
    .querySelector(".whatsapp-a")
    .removeEventListener("click", handleWhatsAppShare);
  // Add event listeners
  qrScanElement.addEventListener("click", handleQrScanClick);
  msgShareElement.addEventListener("click", handleMsgShareClick);
  document
    .querySelector(".whatsapp-a")
    .addEventListener("click", handleWhatsAppShare);
  popupContainer.addEventListener("click", handleSendButtonClick);
};
const menuHandler = async (postId) => {
  const postMenu = document.querySelector(".post-menu");
  const response = await axios.get(`/post/${postId}`);
  if (response.data.user.posts.includes(postId)) {
    document.querySelector(".delete").style.display = "block";
  } else {
    document.querySelector(".delete").style.display = "none";
  }
  // Remove existing event listener to avoid multiple bindings
  postMenu.removeEventListener("click", menuClickHandler);

  postMenu.style.display = "block";
  postMenu.addEventListener("click", menuClickHandler);

  async function menuClickHandler(e) {
    if (
      e.target.classList.contains("post-menu") ||
      e.target.classList.contains("cancel")
    ) {
      postMenu.style.display = "none";
      postMenu.style.transition = "all ease .5s";
      postMenu.removeEventListener("click", menuClickHandler);
    } else if (e.target.classList.contains("goto")) {
      window.location.href = `/singlepost/${postId}`;
      postMenu.removeEventListener("click", menuClickHandler);
    } else if (e.target.classList.contains("about-account")) {
      const res = await axios.get(`/post/${postId}`);
      window.location.href = `/profile/${res.data.post.author._id}`;
      postMenu.removeEventListener("click", menuClickHandler);
    } else if (e.target.classList.contains("delete")) {
      // console.log("hello");
      const res = await axios.get(`/deletepost/${postId}`);
      console.log(res.data);
      if (res.data.success) {
        postMenu.style.display = "none";
        loadPosts();
        toastr.success(res.data.message);
      }
      postMenu.removeEventListener("click", menuClickHandler);
    } else if (e.target.classList.contains("copy")) {
      const res = await axios.get(`/cpy-link/${postId}`);
      if (res.data.success) {
        toastr.success("link copied to clipboard");
        postMenu.style.display = "none";
      }
      postMenu.removeEventListener("click", menuClickHandler);
    }

    
  }
};
``;

post_area.addEventListener("click", async (e) => {
  if (e.target.classList.contains("like")) {
    likeHandler(e.target.id);
  } else if (e.target.classList.contains("fa-bookmark")) {
    handdleBookmark(e.target.id);
  } else if (e.target.classList.contains("fa-grip-lines")) {
    menuHandler(e.target.id);
  } else if (e.target.classList.contains("fa-paper-plane")) {
    // console.log(e.target.id);
    shareHandler(e.target.id);
  } else if (e.target.classList.contains("comment")) {
    document.body.style.overflow = "hidden";
    const postId = e.target.id;
    const { data } = await axios.get(`/post/${postId}`);
    // console.log(data);
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
        ${data.post.comments
          .map(
            (comment) => `<li class="comment">
              <img class="comment-avatar" src="${
                comment.author.profile_picture
              }" alt="" />
              <a class="comment-details" href="/profile/${comment.author._id}">
                <h4 class="comment-username">${comment.author.fullName}</h4>
                <p class="comment-text">${comment.comment}</p>
                ${
                  comment.author._id === data.user._id ||
                  data.user._id === data.post.author._id
                    ? `<a href="javascript:void(0);" onclick="deleteComment('${data.post._id}', '${comment._id}')">
                          <button class="delete-comment">Delete</button>
                        </a>`
                    : ""
                } 
              </a>
            </li>`
          )
          .join("")}
      </ul>
      <form class="comment-form" id="comment-form-${postId}">
        <textarea name="comment" class="comment-textarea" placeholder="Write a comment..."></textarea>
        <button type="button" class="comment-button" onclick="postComment('${postId}')">Post</button>
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
    // console.log("chancel in input");
    overlay4.style.display = "none";
    document.querySelector(".upload-nav").style.display = "flex";
    document.querySelector(".main-nav").style.display = "initial";
    document.querySelector(".story-img").style.display = "none";
    document.querySelector(".vdo").style.display = "none";
    document.querySelector(".imgg").style.display = "none";
    document.querySelector("#file_inp-story").value = "";
    document.body.style.overflow = "auto";
  } else if (
    e.target.classList.contains("upload-nav") ||
    e.target.classList.contains("svgg")
  ) {
    document.querySelector("#file_inp-story").click();
    // document.querySelector(".story-img").style.display = "flex";
  }
});
var content = document.querySelector(".search-content");
document.querySelector(".navbar").addEventListener("click", (e) => {
  if (e.target.classList.contains("search-btn")) {
    if (document.querySelector(".search-card").style.left === "65px") {
      content.innerHTML = "";
      document.querySelector(".search-card").style.left = "-600px";
      document.querySelector(".search-btn").classList.remove("active");
      document.querySelector(".home-btn").classList.add("active");
      document.querySelector(".main").style.position = "initial";
    } else {
      document.querySelector(".search-card").style.left = "65px";
      document.querySelector(".search-btn").classList.add("active");
      document.querySelector(".main").style.position = "fixed";
      document.querySelector(".home-btn").classList.remove("active");
      document.querySelector(".mdl-textfield__input").focus();
      document.querySelector(".mdl-textfield__input").value = "";
    }
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
  document.querySelector(".menu-section").classList.remove("active");
  document.querySelector(".home-btn").classList.add("active");
});
var toggleMenu = function (e) {
  var menu_overlay = document.querySelector(".menu-overlay");
  if (menu_overlay.style.display === "flex") {
    menu_overlay.style.display = "none";
    document.querySelector(".menu-section").classList.remove("active");
    document.querySelector(".home-btn").classList.add("active");
  } else {
    document.querySelector(".menu-section").classList.add("active");
    document.querySelector(".home-btn").classList.remove("active");
    menu_overlay.style.display = "flex";
  }
};
document
  .querySelector(".story-section")
  .addEventListener("click", async (e) => {
    // console.log(e.target);
    if (e.target.classList.contains("add_story_btn")) {
      document.querySelector(".overlay4").style.display = "flex";
      document.body.style.height = "100%";
      document.body.style.overflow = "hidden";
    } else {
      followersIndx = e.target.getAttribute("key");
      if (!e.target.id) return;
      // console.log(e.target.id);
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
const pauseTimereye = (index) => {
  flag = 1;
  clearInterval(interval);
  document.querySelector(".play_btn").classList.remove("ri-pause-fill");
  document.querySelector(".play_btn").classList.add("ri-play-fill");
  const videoElement = document.querySelector(".story_img");
  if (videoElement && videoElement.tagName === "VIDEO") {
    videoElement.pause();
  }
};
const pauseTimereye2 = (index) => {
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
};
const PopClose = (index) => {
  const viewPopup = document.getElementById("view-popup");
  viewPopup.classList.toggle("show-popup");
  pauseTimereye2(index);
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
    // console.log(index);
    var viewers = story[index].views.map((view) => {
      return `<a href="/profile/${view._id}" class="viewer-item">
      <div class="profile-pic">
        <img src="${view.profile_picture}" alt="User 1" class="user-avatar" />
      </div>
      <span>${view.fullName}</span>
    </a>`;
    });
    var close = `<div class="cross-icon">
    <img src="../images/cross.png" alt="" class="cross" />
  </div>`;
    var card = `<div class="card">
    ${
      storyUser._id === user._id
        ? `<a href="/deletestory/${story[index]._id}" class="delete-story-btn">
      <i class="ri-delete-bin-fill"></i>
    </a>
    <div class="view-info" onclick="toggleViewPopup(${index})">
      <i class="ri-eye-fill"></i>
      <span class="viewer-count">${story[index].views.length}</span>
    </div>`
        : ""
    }
    <div class="progress_bar_wrap">
        <div class="progress_bar" style="width:0%;"></div>
    </div>
    <div class="card_controls">
        <i class="ri-pause-fill play_btn" onclick="pauseTimer(${index})"></i>
        <div class="profile">
            <img src="${
              storyUser.profile_picture
            }" alt="" class="profile_img" />
            <span class="yours">${storyUser.fullName}</span>
            <span class="time">${
              timeAgo(story[index].time)
                ? timeAgo(story[index].time)
                : "1 second ago"
            }</span>
        </div>
    </div>
  </div>
  <div class="view-popup" id="view-popup">
    <div class="view-popup-container">
      <div class="view-popup-header">
        <h3>Viewers</h3>
        <i class="ri-close-line" onclick="PopClose(${index})"></i>
      </div>
      <div class="view-popup-body">
        ${viewers.length == 0 ? `<h3>No Viewers</h3>` : viewers.join("")}
      </div>
    </div>   
  </div>`;

    // console.log(story[index].filetype);
    await axios.get(`/viewstory/${story[index]._id}`);
    var img;
    if (
      typeof story[index].filetype === "undefined" ||
      story[index].filetype === "video"
    ) {
      img = `<video autoplay loop src="/uploads/${story[index].file}" alt="" class="story_img"></video>`;
    } else {
      img = `<img src="/uploads/${story[index].file}" alt="" class="story_img" />`;
    }

    // console.log("Image Path:", story[index].file);
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
const toggleViewPopup = (index) => {
  pauseTimereye(index);
  const viewPopup = document.getElementById("view-popup");
  viewPopup.classList.toggle("show-popup");
  document.querySelector(".view-popup").addEventListener("click", (e) => {
    if (
      e.target.classList.contains("show-popup") ||
      e.target.classList.contains("cross")
    ) {
      const viewPopup = document.getElementById("view-popup");
      viewPopup.classList.toggle("show-popup");
      pauseTimereye2(index);
    }
  });
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
  document.querySelector(".search-btn").classList.remove("active");
  document.querySelector(".notification-btn").classList.remove("active");
  document.querySelector(".home-btn").classList.add("active");
  document.querySelector(".main").style.position = "initial";
  document.querySelector(".notification").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";
});
var follow = document.querySelector(".follow-section");
follow.addEventListener("click", (e) => {
  document.querySelector(".search-btn").classList.remove("active");
  document.querySelector(".home-btn").classList.add("active");
  document.querySelector(".notification-btn").classList.remove("active");
  document.querySelector(".search-card").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";
  document.querySelector(".notification").style.left = "-600px";
  document.querySelector(".main").style.position = "initial";
});

document.querySelector(".notification-btn").addEventListener("click", () => {
  if (document.querySelector(".notification").style.left == "65px") {
    document.querySelector(".notification").style.left = "-600px";
    document.querySelector(".notification-btn").classList.remove("active");
    document.querySelector(".home-btn").classList.add("active");
    document.querySelector(".main").style.position = "initial";
  } else {
    document.querySelector(".main").style.position = "fixed";
    document.querySelector(".home-btn").classList.remove("active");
    document.querySelector(".notification-btn").classList.add("active");
    document.querySelector(".notification").style.left = "65px";
  }
});

document.querySelector(".overlay").addEventListener("click", (e) => {
  // console.log(e.target);

  if (
    e.target.classList.contains("upload-nav") ||
    e.target.classList.contains("svgg")
  ) {
    document.querySelector("#file_inp").click();
  } else if (e.target.classList.contains("overlay")) {
    document.querySelector(".main-nav-post").style.display = "block";
    document.querySelector(".upload-nav-post").style.display = "flex";
    document.querySelector(".post-img").style.display = "none";
    document.querySelector(".vdo-post").style.display = "none";
    document.querySelector(".imgg-post").style.display = "none";
    document.querySelector("#file_inp").value = "";
  }
});
// story create
document.querySelector("#file_inp-story").addEventListener("change", (e) => {
  if (e.target.files[0].type === "video/mp4") {
    document.querySelector(".story-img").style.display = "flex";
    document.querySelector(".upload-nav").style.display = "none";
    document.querySelector(".main-nav").style.display = "none";
    document.querySelector(".vdo").style.display = "initial";
  } else {
    document.querySelector(".story-img").style.display = "flex";
    document.querySelector(".imgg").style.display = "initial";
    document.querySelector(".upload-nav").style.display = "none";
    document.querySelector(".main-nav").style.display = "none";
  }
  // console.log("change in inp");
  if (e.target.files && e.target.files[0]) {
    var reader = new FileReader();
    reader.onload = function (event) {
      // var fileContent = event.target.result;
      // console.log(fileContent);
      if (e.target.files[0].type === "video/mp4") {
        document.querySelector(".vdo").src = event.target.result;
      } else {
        document.querySelector(".imgg").src = event.target.result;
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});
// post preview
document.querySelector("#file_inp").addEventListener("change", (e) => {
  if (e.target.files[0].type === "video/mp4") {
    // console.log(e.target.files[0].type);
    document.querySelector(".main-nav-post").style.display = "none";
    document.querySelector(".upload-nav-post").style.display = "none";
    document.querySelector(".post-img").style.display = "flex";
    document.querySelector(".vdo-post").style.display = "block";
  } else {
    document.querySelector(".upload-nav-post").style.display = "none";
    document.querySelector(".main-nav-post").style.display = "none";
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
// document.querySelector(".vdo").style.display = "initial";
// document.querySelector(".upload-nav").style.display = "none";
// document.querySelector(".main-nav").style.display = "none";
// document.querySelector(".story-img").style.display = "flex";
// share overlay cross
document.querySelector(".share-overlay").addEventListener("click", (e) => {
  if (
    e.target.classList.contains("share-overlay") ||
    e.target.classList.contains("cross1")
  ) {
    document.querySelector(".share-overlay").style.display = "none";
    document.querySelector(".share-overlay").style.transition = "all ease .5s";
  }
});
function closePopup() {
  var popupContainer = document.querySelector(".share-overlay");
  popupContainer.style.display = "none";
}
