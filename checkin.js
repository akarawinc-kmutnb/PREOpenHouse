const LIFF_ID = "2012346461-CB2TtFns"; 
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

// 1. กำหนดรายชื่อฐานกิจกรรมที่มีทั้งหมดในงาน (พิมพ์ให้ตรงกับตัวพิมพ์เล็ก/ใหญ่)
const validStations = [
    "Robot",
    "CNC",
    "3D Print",
    "กิจกรรม"
]; 

const urlParams = new URLSearchParams(window.location.search);
const stationName = urlParams.get('station'); 

// 2. ตรวจสอบว่ามีค่า station ส่งมา และชื่อฐานตรงกับที่กำหนดไว้หรือไม่
if (!stationName || !validStations.includes(stationName)) {
    // ถ้าชื่อฐานไม่มี หรือไม่ตรงกับใน validStations จะแสดง Error ทันที
    showResult("❌ ไม่พบฐานกิจกรรม", "QR Code ไม่ถูกต้อง หรือไม่มีฐานนี้ในระบบ", false);
} else {
    // ถ้าชื่อฐานถูกต้อง ให้เริ่มทำงานระบบ LIFF
    liff.init({ liffId: LIFF_ID }).then(() => {
        if (liff.isLoggedIn()) {
            liff.getProfile().then(profile => {
                sendCheckin(profile.userId, stationName);
            });
        } else {
            liff.login();
        }
    }).catch(err => {
        showResult("❌ เกิดข้อผิดพลาดในการโหลด LIFF", err.message, false);
    });
}

function sendCheckin(uid, station) {
    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
            action: "checkin",
            userId: uid,
            station: station
        })
    })
    .then(() => {
        showResult("✅ เช็คอินสำเร็จ!", "ฐาน: " + station, true);
        setTimeout(() => {
            if (liff.isInClient()) {
                liff.closeWindow();
            }
        }, 2500);
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