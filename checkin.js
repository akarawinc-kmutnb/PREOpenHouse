const LIFF_ID = "2012346461-CB2TtFns"; 
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

// กำหนดรายชื่อฐานกิจกรรม
const validStations = ["MachineToolLab", "DigitalManufacturing", "AutomationLab", "FormingLabs", "MaterialTesting", "Metrology"]; 

const urlParams = new URLSearchParams(window.location.search);
let stationName = urlParams.get('station');

if (!stationName) {
    const liffState = urlParams.get('liff.state');
    if (liffState) {
        const stateParams = new URLSearchParams(liffState);
        stationName = stateParams.get('station');
    }
}

if (!stationName || !validStations.includes(stationName)) {
    showResult("❌ ไม่พบฐานกิจกรรม", "QR Code ไม่ถูกต้อง หรือไม่มีฐานนี้ในระบบ", false);
} else {
    liff.init({ liffId: LIFF_ID }).then(() => {
        if (liff.isLoggedIn()) {
            liff.getProfile().then(profile => {
                verifyAndCheckin(profile.userId, stationName);
            });
        } else {
            liff.login();
        }
    }).catch(err => {
        showResult("❌ เกิดข้อผิดพลาดในการโหลด LIFF", err.message, false);
    });
}

// 1. เช็คว่าลงทะเบียนหรือยัง
function verifyAndCheckin(uid, station) {
    fetch(GAS_URL + "?action=checkUser&userId=" + encodeURIComponent(uid))
    .then(response => response.json())
    .then(data => {
        if (data.status !== "found") {
            // ถ้ายังไม่ลงทะเบียน ให้รีไดเรกต์ไปหน้าลงทะเบียน
            alert("คุณยังไม่ได้ลงทะเบียน กรุณาลงทะเบียนก่อนเข้าฐานกิจกรรมครับ");
            window.location.href = "index.html"; 
        } else {
            // ถ้าลงทะเบียนแล้ว ไปขั้นตอนเช็คอิน
            sendCheckinGET(uid, station);
        }
    })
    .catch(error => {
        showResult("❌ เชื่อมต่อล้มเหลว", "ไม่สามารถตรวจสอบข้อมูลได้", false);
    });
}

// 2. ส่งข้อมูลเช็คอินและรอเช็คว่าซ้ำหรือไม่
function sendCheckinGET(uid, station) {
    fetch(GAS_URL + "?action=processCheckin&userId=" + encodeURIComponent(uid) + "&station=" + encodeURIComponent(station))
    .then(response => response.json())
    .then(data => {
        if (data.status === "duplicate") {
            // กรณีเช็คอินฐานเดิมไปแล้ว
            showResult("⚠️ เคยเช็คอินแล้ว", "เมื่อเวลา: " + data.time, false);
            document.getElementById("status").style.color = "#ff9800"; // เปลี่ยนไอคอนเป็นสีส้ม
        } else if (data.status === "success") {
            showResult("✅ เช็คอินสำเร็จ!", "ฐาน: " + station, true);
            setTimeout(() => {
                if (liff.isInClient()) liff.closeWindow();
            }, 2500);
        } else {
            showResult("❌ เกิดข้อผิดพลาด", "ไม่สามารถบันทึกได้", false);
        }
    })
    .catch(error => {
        showResult("❌ บันทึกไม่สำเร็จ", error.message, false);
    });
}

function showResult(title, subtitle, isSuccess) {
    document.getElementById("checkinLoader").style.display = "none";
    const statusEl = document.getElementById("status");
    const subStatusEl = document.getElementById("subStatus");
    
    statusEl.innerText = title;
    statusEl.style.color = isSuccess ? "#2e7d32" : "#c62828";
    subStatusEl.innerText = subtitle;
}