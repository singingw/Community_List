const api = "https://lighthouse-user-api.herokuapp.com";
const index = api + "/api/v1/users/";
const user = document.querySelector(".user");
const like = document.querySelector(".fa-heart");
const search = document.querySelector(".d-flex");
const pagination = document.querySelector(".pagination");
const USER_PER_PAGE = 30;
const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
let keyworduser = [];
//取出api的使用者資料
const userdata = [];
axios
  .get(index)
  .then((response) => {
    userdata.push(...response.data.results);
    renderPaginator(userdata.length);
    adduser(getUserByPage(1));
  })
  .catch((error) => console.log(error));
//加使用者
function adduser(arry) {
  let usercontent = "";
  arry.forEach((data) => {
    const userIndex = list.findIndex((userid) => userid.id === data.id)
    if(userIndex != -1){
          usercontent += `
    <figure class="figure m-2">
      <img data-bs-toggle="modal" data-bs-target="#userModal" data-modal-user-id="${data.id}" src="${data.avatar}" class="figure-img img-fluid rounded" alt="userimg">
      <figcaption class="figure-caption">
      <i class="fas fa-heart" data-id="${data.id}"></i>  ${data.name}
      </figcaption>
    </figure>
    `;
    }else{
      usercontent += `
    <figure class="figure m-2">
      <img data-bs-toggle="modal" data-bs-target="#userModal" data-modal-user-id="${data.id}" src="${data.avatar}" class="figure-img img-fluid rounded" alt="userimg">
      <figcaption class="figure-caption">
      <i class="far fa-heart" data-id="${data.id}"></i>  ${data.name}
      </figcaption>
    </figure>
    `;
    }
  });
  user.innerHTML = usercontent;
}
//分頁
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USER_PER_PAGE);
  //製作 template
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  pagination.innerHTML = rawHTML;
}
//分頁內容
function getUserByPage(page) {
  const data = keyworduser.length ? keyworduser : userdata;
  //計算起始 index
  const startIndex = (page - 1) * USER_PER_PAGE;
  keyworduser=[]
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USER_PER_PAGE);
}
//使用者資訊 & 加至最愛
user.addEventListener("click", (event) => {
  const target = event.target;
  //顯示使用者資訊
  if (target.matches(".figure-img")) {
    const modalTitleBox = document.querySelector(".modal-title");
    const modalAvatarBox = document.querySelector(".modal-avatar");
    const modalUserInfoBox = document.querySelector(".modal-user-info");
    modalTitleBox.textContent = "";
    modalAvatarBox.src = "";
    modalUserInfoBox.textContent = "";
    axios
      .get(index + target.dataset.modalUserId)
      .then((response) => {
        const user = response.data;
        modalTitleBox.textContent = user.name + " " + user.surname;
        modalAvatarBox.src = user.avatar;
        modalUserInfoBox.innerHTML = `
      <p>email: ${user.email}</p>
      <p>gender: ${user.gender}</p>
      <p>age: ${user.age}</p>
      <p>region: ${user.region}</p>
      <p>birthday: ${user.birthday}</p>`;
      })
      .catch((error) => console.log(error));
  }
  //加至最愛
  if (target.matches(".far")) {
    //更新頁面時，如何將圖形維持
    target.setAttribute("class", "fas fa-heart");
    addToLike(Number(target.dataset.id))
  }else  if (target.matches(".fas")) {
    //更新頁面時，如何將圖形維持
    target.setAttribute("class", "far fa-heart");
    outToLike(Number(target.dataset.id))
  }
});
//換頁
pagination.addEventListener("click", (event) => {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面
  adduser(getUserByPage(page));
});
//收尋
search.addEventListener("submit", (event) => {
  //使網頁不重新刷新
  event.preventDefault();
  const input = search.children[0].value.trim().toLowerCase();
  if (!input.length) {
    alert("請重新輸入關鍵字！");
    renderPaginator(userdata.length);
    adduser(getUserByPage(1));
    return;
  } else {
    keyworduser = userdata.filter((userdata) =>
      userdata.name.toLowerCase().includes(input)
    );
    //重新輸出至畫面
    renderPaginator(keyworduser.length);
    adduser(getUserByPage(1));
  }
});
//將喜愛的使用者存入local storage
function addToLike(id){
  const likeuser = userdata.find((user) => user.id === id)
  if (list.some((userdata) => userdata.id === id)) {
    return alert('此用戶已經在收藏清單中！')
  }
  list.push(likeuser)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
}
//將已經不愛的使用者移出local storage
function outToLike(id){
  if (!list || !list.length) return 
  //透過 id 找到要刪除的使用者 index
  const userIndex = list.findIndex((userid) => userid.id === id)
  if(userIndex === -1) return
  //刪除該筆電影
  alert(`已經將 ${list[userIndex].name} 從 like 移除`)
  list.splice(userIndex,1)
  //存回 local storage
  localStorage.setItem('favoriteUser', JSON.stringify(list))
}
