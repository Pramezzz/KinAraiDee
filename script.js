let selectedRating = 0;
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
            "รูปภาพ":      ""   // โหลดทีหลัง
        }));

        // แสดงการ์ดก่อน (ใช้ placeholder) แล้วค่อยโหลดรูป
        displayFoods(demoFoods);
        displayRecommend(demoFoods);
        loadImagesLazy();

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
    const name    = item["ชื่ออาหาร"].replace(/'/g, "&#39;");
    const ingre   = (item["วัตถุดิบ"] || "-").replace(/'/g, "&#39;");
    const country = item["ประเทศ"] || "";

    // placeholder สีเทาก่อน รูปจริงใส่ทีหลังโดย loadImagesLazy
    const placeholder = `https://picsum.photos/seed/food${hashStr(name)}/400/250`;

    const countryBadge = country
        ? `<span class="food-country">${country}</span>`
        : "";

    return `
        <div class="card"
            data-name="${name}"
            data-country="${country}"
            onclick="showFoodDetail('${name}','${ingre}','${country}')">

            <img
                src="${placeholder}"
                data-food="${name}"
                data-country="${country}"
                alt="${name}"
                loading="lazy"
            >

            <div class="card-body">
                <h3>${item["ชื่ออาหาร"]} ${countryBadge}</h3>
                <p><strong>วัตถุดิบ:</strong> ${item["วัตถุดิบ"] || "-"}</p>
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
            "อาหารตามสั่ง":  "food1Cards",
            "อาหารจานเดียว": "food2Cards",
            "เส้น":          "food3Cards",
            "สตรีทฟู้ด":    "food4Cards",
            "อาหารคลีน":    "food5Cards",
            "ของหวาน":      "food6Cards",
            "เครื่องดื่ม":  "food7Cards"
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

function openRating()  { document.getElementById("ratingPopup").style.display = "flex"; }
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
function submitRating(){

    if(selectedRating === 0){

        alert("กรุณาเลือกคะแนนก่อน");
        return;

    }

    fetch("https://kinaraidee-3.onrender.com/rating", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        rating: selectedRating,
        time: new Date().toLocaleString()
    })
})
    .then(res => res.json())
    .then(data => {

        alert("ส่งคะแนนเรียบร้อย");

        closeRating();

    })
    .catch(err => {

        alert("ส่งข้อมูลไม่สำเร็จ");

    });

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
    loadFoodsFromExcel("สำเนาของ_รายการอาหาร.xlsx");
});
