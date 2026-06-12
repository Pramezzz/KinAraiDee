console.log("auth.js loaded");
import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

window.register = async function() {

    const name =
        document.getElementById("signupName").value;

    const email =
        document.getElementById("signupEmail").value;

    const password =
        document.getElementById("signupPassword").value;

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

       await setDoc(
            doc(db, "users", userCredential.user.uid),
            {
                name,
                email,
                role: "user",   // 👈 ปกติเป็น user
                createdAt: new Date()
            }
            );
        alert("สมัครสมาชิกสำเร็จ");

    } catch(err) {

        alert(err.message);
    }
}

window.login = async function() {

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    const btn =
    document.querySelector(".panel-signin .panel-btn");

    btn.innerText = "กำลังเข้าสู่ระบบ...";
    btn.disabled = true;

    try {

        const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        localStorage.setItem(
            "user",
            JSON.stringify({
                uid:userCredential.user.uid,
                email:userCredential.user.email
            })
        );

        sessionStorage.setItem(
            "loginSuccess",
            "เข้าสู่ระบบเสร็จสิ้น ✅"
        );

        location.href = "index.html";

    } catch(err){

        console.error(err);

        alert(err.message);

        btn.innerText = "Sign In";
        btn.disabled = false;
    }
}

async function logout() {

    await signOut(auth);

    localStorage.removeItem("user");

    location.href = "index.html";
}

window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {

    const authBox =
        document.getElementById("authBox");

    const switchToSignup =
        document.getElementById("switchToSignup");

    const switchToSignin =
        document.getElementById("switchToSignin");

    if (switchToSignup) {

        switchToSignup.addEventListener(
            "click",
            () => {

                authBox.classList.add(
                    "right-panel-active"
                );

            }
        );

    }

    if (switchToSignin) {

        switchToSignin.addEventListener(
            "click",
            () => {

                authBox.classList.remove(
                    "right-panel-active"
                );

            }
        );

    }

});
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


async function submitRating(score) {

  const user =
    JSON.parse(localStorage.getItem("user"));

  if(!user){
    alert("กรุณาเข้าสู่ระบบ");
    return;
  }

  try{

    await addDoc(
      collection(db,"ratings"),
      {
        uid:user.uid,
        email:user.email,
        score:score,
        createdAt:new Date()
      }
    );

    alert("ส่งคะแนนสำเร็จ");

  }catch(err){

    console.error(err);
    alert("ส่งไม่สำเร็จ");
  }
}

window.submitRating = submitRating;