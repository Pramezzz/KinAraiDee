/* =========================
   ข้อมูลอาหาร
========================= */

const demoFoods = [

{
    "ชื่ออาหาร":"ข้าวกะเพราหมูสับไข่ดาว",
    "วัตถุดิบ":"หมูสับ, ใบกะเพรา, ไข่ดาว",
    "หมวดหมู่":"อาหารจานเดียว",
    "รูปภาพ":"food/c07747088f182ba6cfabe8be6724229e.avif"
},

{
    "ชื่ออาหาร":"ข้าวผัดหมู",
    "วัตถุดิบ":"หมู, ข้าว",
    "หมวดหมู่":"อาหารจานเดียว",
    "รูปภาพ":"food/2810e9c2-ac36-4970-bc50-d2fa431e2c3c.jpg"
},

{
    "ชื่ออาหาร":"ผัดไทยกุ้งสด",
    "วัตถุดิบ":"เส้นจันท์, กุ้ง",
    "หมวดหมู่":"เส้น",
    "รูปภาพ":"food/dFQROr7oWzulq5Fa7HSof3IKxOXbUEyRuvvbNbmFc2xKRJMFiPVZ5I8hrmgIYDLCrAD.jpg"
},

{
    "ชื่ออาหาร":"สลัดอกไก่",
    "วัตถุดิบ":"ผักสลัด, อกไก่",
    "หมวดหมู่":"อาหารคลีน",
    "รูปภาพ":"food/salad.jpg"
},

{
    "ชื่ออาหาร":"บิงซูสตรอว์เบอร์รี่",
    "วัตถุดิบ":"น้ำแข็งไส, สตรอว์เบอร์รี่",
    "หมวดหมู่":"ของหวาน",
    "รูปภาพ":"food/bingsu.jpg"
},

{
    "ชื่ออาหาร":"ชาไทย",
    "วัตถุดิบ":"ชาไทย, นม",
    "หมวดหมู่":"เครื่องดื่ม",
    "รูปภาพ":"food/thaimilktea.jpg"
}

];


/* =========================
   สร้างการ์ดอาหาร
========================= */

function createCard(item){

    return `
        <div class="card"
            onclick="showFoodDetail(
                '${item["ชื่ออาหาร"]}',
                '${item["วัตถุดิบ"]}'
            )">

            <img src="${
                item["รูปภาพ"]
            }">

            <div class="card-body">

                <h3>${item["ชื่ออาหาร"]}</h3>

                <p>
                    <strong>วัตถุดิบ:</strong><br>
                    ${item["วัตถุดิบ"]}
                </p>

            </div>

        </div>
    `;
}


/* =========================
   แสดงอาหาร
========================= */

function displayFoods(data){

    const food1 =
    document.getElementById("food1Cards");

    const food2 =
    document.getElementById("food2Cards");

    const food3 =
    document.getElementById("food3Cards");

    const food4 =
    document.getElementById("food4Cards");

    const food5 =
    document.getElementById("food5Cards");

    if(food1) food1.innerHTML = "";
    if(food2) food2.innerHTML = "";
    if(food3) food3.innerHTML = "";
    if(food4) food4.innerHTML = "";
    if(food5) food5.innerHTML = "";

    data.forEach(item => {

        const card = createCard(item);

        switch(item["หมวดหมู่"]){

            case "อาหารจานเดียว":
                if(food1) food1.innerHTML += card;
            break;

            case "เส้น":
                if(food2) food2.innerHTML += card;
            break;

            case "อาหารคลีน":
                if(food3) food3.innerHTML += card;
            break;

            case "ของหวาน":
                if(food4) food4.innerHTML += card;
            break;

            case "เครื่องดื่ม":
                if(food5) food5.innerHTML += card;
            break;

        }

    });

}

displayFoods(demoFoods);


/* =========================
   ค้นหาอาหาร
========================= */

const search =
document.getElementById("search");

if(search){

    search.addEventListener("input", function(){

        const keyword =
        this.value.toLowerCase();

        const result =
        demoFoods.filter(item =>

            item["ชื่ออาหาร"]
            .toLowerCase()
            .includes(keyword)

            ||

            item["วัตถุดิบ"]
            .toLowerCase()
            .includes(keyword)

        );

        displayFoods(result);

    });

}


/* =========================
   Popup อาหาร
========================= */

function showPopup(title, detail){

    document.getElementById(
        "foodName"
    ).innerText = title;

    document.getElementById(
        "foodDetail"
    ).innerText = detail;

    document.getElementById(
        "foodPopup"
    ).style.display = "flex";

}

function closePopup(){

    const popup =
    document.getElementById(
        "foodPopup"
    );

    if(popup){

        popup.style.display = "none";

    }

}

function showFoodDetail(name, ingredient){

    showPopup(
        name,
        "วัตถุดิบ : " + ingredient
    );

}


/* =========================
   สุ่มอาหาร
========================= */

function randomFood(){

    const random =
    demoFoods[
        Math.floor(
            Math.random()*demoFoods.length
        )
    ];

    showPopup(
        "🎲 สุ่มได้ : " +
        random["ชื่ออาหาร"],

        "วัตถุดิบ : " +
        random["วัตถุดิบ"]
    );

}


/* =========================
   Rating
========================= */

function openRating(){

    document.getElementById(
        "ratingPopup"
    ).style.display = "flex";

}

function closeRating(){

    document.getElementById(
        "ratingPopup"
    ).style.display = "none";

}

function rate(score){

    document.getElementById(
        "ratingText"
    ).innerText =
    "คุณให้คะแนน " +
    score +
    " ดาว ⭐";

    const stars =
    document.querySelectorAll(
        ".star-rating span"
    );

    stars.forEach((star,index)=>{

        if(index < score * 2){

            star.style.color =
            "gold";

        }else{

            star.style.color =
            "white";

        }

    });

}


/* =========================
   Slide Profile
========================= */

function toggleProfile(id){

    const box =
    document.getElementById(id);

    if(box){

        box.classList.toggle("show");

    }

}


/* =========================
   กล่องลอยพื้นหลัง
========================= */

const bg =
document.getElementById(
    "bg-container"
);

if(bg){

    for(let i=0;i<25;i++){

        const box =
        document.createElement("div");

        box.className =
        "falling-box";

        const size =
        Math.random()*50 + 25;

        box.style.width =
        size + "px";

        box.style.height =
        size + "px";

        box.style.left =
        Math.random()*100 + "%";

        box.style.animationDuration =
        (10 + Math.random()*10)
        + "s";

        box.style.animationDelay =
        (-Math.random()*20)
        + "s";

        bg.appendChild(box);

    }

}
/* =========================
   Hamburger Menu
========================= */


function toggleMenu(){

    const menu =
    document.getElementById(
        "mobileMenu"
    );

    const hamburger =
    document.getElementById(
        "hamburger"
    );

    menu.classList.toggle(
        "show"
    );

    hamburger.classList.toggle(
        "active"
    );

}