let foods = [];

const excelFile = document.getElementById("excelFile");
const search = document.getElementById("search");

if (excelFile) {

    excelFile.addEventListener("change", function(e){

        const file = e.target.files[0];

        const reader = new FileReader();

        reader.onload = function(event){

            const data =
            new Uint8Array(event.target.result);

            const workbook =
            XLSX.read(data,{type:"array"});

            const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

            foods =
            XLSX.utils.sheet_to_json(sheet);

            displayFoods(foods);
        };

        reader.readAsArrayBuffer(file);
    });

}

if (search) {

    search.addEventListener("input", function(){

        const keyword =
        this.value.toLowerCase();

        const result =
        foods.filter(item =>

            String(item["ชื่ออาหาร"])
            .toLowerCase()
            .includes(keyword)

            ||

            String(item["วัตถุดิบ"])
            .toLowerCase()
            .includes(keyword)

        );

        displayFoods(result);
    });

}

function createCard(item){

    return `
        <div class="card">

            <img src="${
                item["รูปภาพ"] ||
                "https://via.placeholder.com/400x250"
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
}function createCard(item){

    return `
        <div class="card"
            onclick="showFoodDetail(
                '${item["ชื่ออาหาร"]}',
                '${item["วัตถุดิบ"]}'
            )">

            <img src="${
                item["รูปภาพ"] ||
                "https://via.placeholder.com/400x250"
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

function displayFoods(data){

    document.getElementById("food1Cards").innerHTML = "";
    document.getElementById("food2Cards").innerHTML = "";
    document.getElementById("food3Cards").innerHTML = "";
    document.getElementById("food4Cards").innerHTML = "";
    document.getElementById("food5Cards").innerHTML = "";

    data.forEach(item => {

        const card = createCard(item);

        switch(item["หมวดหมู่"]){

            case "อาหารจานเดียว":
                document.getElementById("food1Cards").innerHTML += card;
                break;

            case "เส้น":
                document.getElementById("food2Cards").innerHTML += card;
                break;

            case "อาหารคลีน":
                document.getElementById("food3Cards").innerHTML += card;
                break;

            case "ของหวาน":
                document.getElementById("food4Cards").innerHTML += card;
                break;

            case "เครื่องดื่ม":
                document.getElementById("food5Cards").innerHTML += card;
                break;
        }

    });
}
function filterCategory(category){

    const result = foods.filter(item =>

        item["หมวดหมู่"] === category

    );

    displayFoods(result);
}
function showFoodDetail(name, ingredient){

    showPopup(
        name,
        "วัตถุดิบ : " + ingredient
    );
}
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
displayFoods(demoFoods);
const recommendFoods = [

{
    name:"ข้าวกะเพราหมูสับไข่ดาว",
    detail:"เมนูยอดนิยมประจำวัน",
    image:"food/c07747088f182ba6cfabe8be6724229e.avif"
},

{
    name:"ข้าวผัดหมู",
    detail:"หอมกระทะ กินง่าย",
    image:"food/2810e9c2-ac36-4970-bc50-d2fa431e2c3c.jpg"
},

{
    name:"ผัดไทยกุ้งสด",
    detail:"เมนูขายดี",
    image:"food/dFQROr7oWzulq5Fa7HSof3IKxOXbUEyRuvvbNbmFc2xKRJMFiPVZ5I8hrmgIYDLCrAD.jpg"
}

];
function displayRecommendFoods(){

    let html = "";

    recommendFoods.forEach(item => {

        html += `
        <div class="card">

            <img src="${item.image}">

            <div class="card-body">

                <h3>${item.name}</h3>

                <p>${item.detail}</p>

            </div>

        </div>
        `;
    });

    document.getElementById("recommendCards").innerHTML = html;
}
displayRecommendFoods();


const bg =
document.getElementById(
    "bg-container"
);

for(let i=0;i<25;i++){

    const box =
    document.createElement("div");

    box.className =
    "falling-box";

    const size =
    Math.random()*50 + 40;

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

function closePopup(){

    document.getElementById(
        "foodPopup"
    ).style.display =
    "none";
}
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
function showFoodDetail(name, ingredient){

    showPopup(
        name,
        "วัตถุดิบ : " + ingredient
    );
}