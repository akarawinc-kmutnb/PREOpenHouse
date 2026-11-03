const LIFF_ID = "2012346461-aXrfKbyZ";
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

let userId = "";
let pictureUrl = "";

// ตั้งค่าข้อความในโปรไฟล์ (ถ้าค่าว่างให้แสดง "-")
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "-";
}

// แสดงหน้าบัตรโปรไฟล์ผู้เข้างาน
function showProfile(d) {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("profileSection").style.display = "block";
    setText("profileName", (d.prefix || "") + (d.name || ""));
    setText("profileSchool", d.school);
    setText("profileLevel", d.level);
    setText("profilePhone", d.phone);
    setText("profileEmail", d.email);
}

// เริ่มต้นการทำงานด้วยการแสดง Loading
document.getElementById("loading").style.display = "block";

// Initialize LINE LIFF SDK
liff.init({ liffId: LIFF_ID }).then(() => {
    if (liff.isLoggedIn()) {
        liff.getProfile().then(profile => {
            userId = profile.userId;
            pictureUrl = profile.pictureUrl || "https://via.placeholder.com/150";
            document.getElementById("linePic").src = pictureUrl;

            checkUserStatus(userId);
        });
    } else {
        liff.login();
    }
}).catch(err => {
    document.getElementById("loading").style.display = "none";
    alert("เริ่มต้น LIFF ไม่สำเร็จ: " + err.message);
});

// ตรวจสอบสถานะผู้ใช้งานจาก Google Apps Script
function checkUserStatus(uid) {
    fetch(GAS_URL + "?action=checkUser&userId=" + encodeURIComponent(uid), {
        method: 'GET',
        redirect: 'follow'
    })
    .then(response => response.text())
    .then(text => {
        document.getElementById("loading").style.display = "none";
        try {
            const data = JSON.parse(text);
            if (data.status === "found") {
                showProfile(data);
            } else {
                document.getElementById("registerSection").style.display = "block";
            }
        } catch (e) {
            console.error(e);
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            document.getElementById("registerSection").style.display = "block";
        }
    })
    .catch(error => {
        alert("เชื่อมต่อฐานข้อมูลล้มเหลว");
        document.getElementById("loading").style.display = "none";
        document.getElementById("registerSection").style.display = "block";
    });
}

// ฟังก์ชันสำหรับส่งข้อมูลลงทะเบียน
function register() {
    const prefix = document.getElementById("prefix").value;
    const name = document.getElementById("name").value.trim();
    const school = document.getElementById("school").value.trim();
    const level = document.getElementById("level").value;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const btn = document.getElementById("btnRegister");

    // ตรวจสอบช่องบังคับกรอก
    if (!prefix || !name || !school || !level) {
        alert("กรุณากรอกข้อมูลที่จำเป็น (คำนำหน้า, ชื่อ-สกุล, โรงเรียน, ระดับชั้น) ให้ครบถ้วน");
        return;
    }

    // ตรวจสอบรูปแบบเบอร์โทรศัพท์ (ถ้ามีการกรอก)
    if (phone && !/^0\d{9}$/.test(phone)) {
        alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก ขึ้นต้นด้วย 0");
        return;
    }
    
    // ตรวจสอบรูปแบบอีเมล (ถ้ามีการกรอก)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("รูปแบบอีเมลไม่ถูกต้อง");
        return;
    }

    btn.innerText = "กำลังบันทึก...";
    btn.disabled = true;

    const payload = {
        action: "register",
        userId: userId,
        prefix: prefix,
        name: name,
        school: school,
        level: level,
        phone: phone || "-",
        email: email || "-"
    };

    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    })
    .then(() => {
        showProfile({
            prefix: prefix,
            name: name,
            school: school,
            level: level,
            phone: phone,
            email: email
        });
    })
    .catch((error) => {
        alert("เกิดข้อผิดพลาดตอนบันทึก: " + error.message);
        btn.innerText = "ยืนยันการลงทะเบียน";
        btn.disabled = false;
    });
}