let selectedRating = 0;
function safeQuery(selector){
    return document.querySelector(selector);
}
/* =========================
   โหลดข้อมูลจาก Excel
========================= */

let demoFoods = [];
// แคชรูปภาพไว้ไม่ต้องโหลดซ้ำ
const imgCache = {};

async function fetchFoodImage(foodName, country) {
    const key = foodName;
    if (imgCache[key]) return imgCache[key];

    // แปลชื่ออาหารเป็น query ภาษาอังกฤษง่ายๆ
    const countryMap = {
        "ไทย": "Thai", "ญี่ปุ่น": "Japanese",
        "สหรัฐอเมริกา": "American", "อิตาลี": "Italian"
    };
    const lang = countryMap[country] || "";
    const query = encodeURIComponent(`${lang} ${foodName} food`);

    try {
        const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
            { headers: { Authorization: "Client-ID YOUR_UNSPLASH_KEY" } }
        );
        const data = await res.json();
        const url = data?.results?.[0]?.urls?.small || getFallbackImg(foodName);
        imgCache[key] = url;
        return url;
    } catch {
        const url = getFallbackImg(foodName);
        imgCache[key] = url;
        return url;
    }
}

// fallback: ใช้ picsum แบ่งตาม index เพื่อให้แต่ละเมนูได้รูปต่างกัน
function getFallbackImg(foodName) {
    let seed = 0;
    for (let i = 0; i < foodName.length; i++) seed += foodName.charCodeAt(i);
    return `https://picsum.photos/seed/${seed}/400/250`;
}


async function loadFoodsFromExcel(url = "สำเนาของ_รายการอาหาร.xlsx") {
    try {
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        const wb = XLSX.read(ab, { type: "arraybuffer" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        demoFoods = rows.map(row => ({
            "รหัสเมนู":    row["รหัสเมนู"]     || "",
            "ประเทศ":      row["ประเทศ"]        || "",
            "ชื่ออาหาร":   row["ชื่อเมนูอาหาร"] || "",
            "หมวดหมู่":    mapCategory(row["ประเภทอาหาร"] || ""),
            "ประเภทอาหาร": row["ประเภทอาหาร"]  || "",
            "วัตถุดิบ":    row["วัตถุดิบ"]      || "-",
            "รูปภาพ": (row["รูปภาพ"] || "food/default.jpg")
            .replaceAll("\\", "/")
            .trim()
        }));

        // แสดงการ์ดก่อน (ใช้ placeholder) แล้วค่อยโหลดรูป
        displayFoods(demoFoods);
        displayRecommend(demoFoods);

    } catch (err) {
        console.error("โหลด Excel ไม่สำเร็จ:", err);
    }
}

/* โหลดรูปแบบ lazy — ใส่ทีละใบไม่บล็อก UI */
async function loadImagesLazy() {
    const allImgs = document.querySelectorAll("img[data-food]");
    for (const img of allImgs) {
        const name    = img.dataset.food;
        const country = img.dataset.country || "";
        const url     = await getFoodImageUrl(name, country);
        img.src = url;
    }
}

/* ดึง URL รูปจาก picsum seed (ไม่ต้อง API key) */
function getFoodImageUrl(foodName, country) {
    let seed = 0;
    for (let i = 0; i < foodName.length; i++) seed += foodName.charCodeAt(i);
    // บวก country เพื่อให้ seed หลากหลายขึ้น
    for (let i = 0; i < country.length; i++) seed += country.charCodeAt(i) * 3;
    return `https://picsum.photos/seed/food${seed}/400/250`;
}


/* แมปประเภทอาหาร */
function mapCategory(type) {
    const map = {
        "อาหารตามสั่ง":    "อาหารตามสั่ง",
        "อาหารจานเดียว":   "อาหารจานเดียว",
        "อาหารประเภทเส้น": "เส้น",
        "อาหารสตรีทฟู้ด":  "สตรีทฟู้ด",
        "อาหารคลีน":       "อาหารคลีน",
        "ของหวาน":         "ของหวาน",
        "เครื่องดื่ม":     "เครื่องดื่ม"
    };
    return map[type] || type;
}


/* =========================
   สร้างการ์ดอาหาร
========================= */

function createCard(item) {

    const name = item["ชื่ออาหาร"].replace(/'/g, "\\'");
    const ingredient = (item["วัตถุดิบ"] || "-").replace(/'/g, "\\'");
    const country = item["ประเทศ"] || "";

    return `
        <div
            class="card"
            data-name="${item["ชื่ออาหาร"]}"
            data-country="${country}"
            onclick="showFoodDetail('${name}','${ingredient}','${country}')">

            <img
                src="${item["รูปภาพ"]}"
                alt="${item["ชื่ออาหาร"]}"
                loading="lazy"
                onerror="this.src='food/default.jpg'">

            <div class="card-body">
                <h3>${item["ชื่ออาหาร"]}</h3>
                <p>
                    <strong>วัตถุดิบ:</strong>
                    ${item["วัตถุดิบ"]}
                </p>
            </div>

        </div>
    `;
}

function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
    return h;
}


/* =========================
   แสดงอาหารตามหมวดหมู่
========================= */

function displayFoods(data) {
    ["food1Cards","food2Cards","food3Cards",
     "food4Cards","food5Cards","food6Cards","food7Cards"]
    .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    data.forEach(item => {
        const card = createCard(item);
        const idMap = {
            "อาหารจานเดียว": "food1Cards",
            "เส้น":          "food2Cards",
            "อาหารคลีน":    "food3Cards",
            "ของหวาน":      "food4Cards",
            "เครื่องดื่ม":  "food5Cards"
        };
        const targetId = idMap[item["หมวดหมู่"]];
        if (targetId) {
            const el = document.getElementById(targetId);
            if (el) el.innerHTML += card;
        }
    });
}


/* =========================
   เมนูแนะนำวันนี้ (สุ่ม 4 เมนู)
========================= */

function displayRecommend(data) {
    const el = document.getElementById("recommendCards");
    if (!el || data.length === 0) return;
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    el.innerHTML = shuffled.slice(0, 6).map(createCard).join("");
}


/* =========================
   ค้นหาอาหาร
========================= */

const search = document.getElementById("search");

if (search) {
    search.addEventListener("input", function () {
        const keyword = this.value.trim().toLowerCase();
        document.querySelectorAll(".card").forEach(card => {
            const name    = card.dataset.name.toLowerCase();
            const country = (card.dataset.country || "").toLowerCase();
            card.style.display =
                keyword === "" || name.includes(keyword) || country.includes(keyword)
                ? "" : "none";
        });
    });

    search.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        const keyword = this.value.trim().toLowerCase();
        if (!keyword) return;

        let target = null;
        document.querySelectorAll(".card").forEach(card => {
            if (!target && card.dataset.name.toLowerCase().includes(keyword)) target = card;
        });

        if (target) {
            document.querySelectorAll(".card").forEach(c => c.classList.remove("search-target"));
            target.classList.add("search-target");
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
}


/* =========================
   Popup
========================= */

function showFoodDetail(name, ingredient, country) {
    showPopup("🍽 " + name,
        `${country ? "🌏 " + country + "\n" : ""}วัตถุดิบ : ${ingredient}`);
}

function showPopup(title, detail) {
    const popup = document.getElementById("foodPopup");
    if (!popup) return;
    document.getElementById("foodName").innerText   = title;
    document.getElementById("foodDetail").innerText = detail;
    popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById("foodPopup");
    if (popup) popup.style.display = "none";
}


/* =========================
   สุ่มอาหาร
========================= */

function randomFood() {
    if (!demoFoods.length) return;
    const r = demoFoods[Math.floor(Math.random() * demoFoods.length)];
    showPopup("🎲 สุ่มได้ : " + r["ชื่ออาหาร"],
        `🌏 ${r["ประเทศ"] || ""}\nวัตถุดิบ : ${r["วัตถุดิบ"] || "-"}`);
}


/* =========================
   Rating / Profile / BG / Menu
========================= */

function openRating(){
    if(!isLoggedIn()){
        showLoginModal();
        return;
    }
    document.getElementById("ratingPopup").style.display = "flex";
}
function closeRating() { document.getElementById("ratingPopup").style.display = "none"; }
function rate(score){

    selectedRating = score;

    document.getElementById(
        "ratingText"
    ).innerText =
    "คุณเลือก " +
    score +
    " ดาว ⭐";

}
function sendRating(){

  if(!isLoggedIn()){
      showLoginModal();
      return;
  }

  if(selectedRating===0){
    alert("กรุณาเลือกคะแนน");
    return;
  }

  window.submitRating(selectedRating);
}
function toggleProfile(id) {
    document.getElementById(id)?.classList.toggle("show");
}

const bg = document.getElementById("bg-container");
if (bg) {
    for (let i = 0; i < 25; i++) {
        const box = document.createElement("div");
        box.className = "falling-box";
        const size = Math.random() * 50 + 25;
        box.style.width  = size + "px";
        box.style.height = size + "px";
        box.style.left   = Math.random() * 100 + "%";
        box.style.animationDuration = (10 + Math.random() * 10) + "s";
        box.style.animationDelay    = (-Math.random() * 20) + "s";
        bg.appendChild(box);
    }
}

function toggleMenu() {
    document.getElementById("mobileMenu")?.classList.toggle("show");
    document.getElementById("hamburger")?.classList.toggle("active");
}


/* =========================
   เริ่มต้น
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const menuLink = document.querySelector('a[href="menu_search.html"]');

    if(menuLink){
        menuLink.addEventListener("click", (e) => {

            if(!isLoggedIn()){
                e.preventDefault();
                showLoginModal();
            }

        });
    }

});
document.addEventListener("DOMContentLoaded",()=>{

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if(user){

        const info =
            document.getElementById("userInfo");

        if(info){

            info.innerText =
                "👤 " + user.email;
        }
    }
});

const user =
JSON.parse(localStorage.getItem("user"));

const userInfo =
document.getElementById("userInfo");

if(userInfo && user){
    userInfo.innerText =
    "👤 " + user.email;
}
function checkLogin(){

    const user =
    JSON.parse(localStorage.getItem("user"));

    const userBox =
    document.getElementById("userBox");

    const loginLink =
    document.getElementById("loginLink");

    const logoutLink =
    document.getElementById("logoutLink");

    if(user){

        userBox.innerHTML =
        `👤 ${user.email}`;

        loginLink.style.display =
        "none";

        logoutLink.style.display =
        "inline-block";

    }else{

        userBox.innerHTML = "";

        loginLink.style.display =
        "inline-block";

        logoutLink.style.display =
        "none";
    }
}

function logout(){

    localStorage.removeItem("user");

    location.href =
    "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
});
function switchTab(type){

    const slider =
    document.querySelector(".slider");

    if(type === "signup"){

        slider.style.left = "50%";

    }else{

        slider.style.left = "0";

    }

}
document.addEventListener("DOMContentLoaded", () => {

    const box = safeQuery(".auth-box");
    if(box){
        box.classList.add("signin");
}

});
document.addEventListener("DOMContentLoaded", () => {

    const signUp = document.getElementById("signUp");
    const signIn = document.getElementById("signIn");
    const container = document.getElementById("container");

    if(signUp && signIn && container){

        signUp.addEventListener("click", () => {
            container.classList.add("right-panel-active");
        });

        signIn.addEventListener("click", () => {
            container.classList.remove("right-panel-active");
        });

    }

});

const signUpMobile =
document.getElementById("signUpMobile");

const signInMobile =
document.getElementById("signInMobile");

if(signUpMobile){
    signUpMobile.onclick = () => {
        container?.classList.add("right-panel-active");
    };
}

if(signInMobile){
    signInMobile.onclick = () => {
        container?.classList.remove("right-panel-active");
    };
}

function showNotify(text){

    const popup =
    document.getElementById("notifyPopup");

    const notifyText =
    document.getElementById("notifyText");

    if(!popup || !notifyText) return;

    notifyText.innerText = text;

    popup.style.display = "flex";

    setTimeout(() => {
        popup.style.display = "none";
    }, 2000);

}

document.addEventListener("DOMContentLoaded",()=>{

    const msg =
    sessionStorage.getItem("loginSuccess");

    if(msg){

        showNotify(msg);

        sessionStorage.removeItem(
            "loginSuccess"
        );
    }

});
function isLoggedIn(){
    return !!localStorage.getItem("user");
}

function showLoginModal(){
    document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal(){
    document.getElementById("loginModal").style.display = "none";
}

function goLogin(){
    window.location.href = "login.html";
}
function requireLoginNav(e){
    const user = JSON.parse(localStorage.getItem("user"));

    if(!user){
        e.preventDefault();
        showLoginModal();
        return false;
    }

    return true;
}
document.addEventListener("DOMContentLoaded", () => {

    if(location.pathname.includes("menu_search.html")){

        if(!isLoggedIn()){
            window.location.href = "index.html";
            setTimeout(() => showLoginModal(), 100);
        }

    }

});
function handleMenuClick(e){
    e.preventDefault();

    if(!isLoggedIn()){
        showLoginModal();
        return;
    }

    window.location.href = "menu_search.html";
}
document.addEventListener("DOMContentLoaded", () => {
    loadFoodsFromExcel();
});