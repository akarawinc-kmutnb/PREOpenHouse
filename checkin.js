const LIFF_ID = "2012346461-CB2TtFns"; 
// LIFF URL สำหรับหน้าลงทะเบียนหลัก ( index.html )
const REGISTER_LIFF_URL = "https://liff.line.me/2012346461-aXrfKbyZ"; 
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exechttps://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

// รายชื่อฐานกิจกรรมที่ถูกต้อง
const validStations = [
    "MachineToolLab", 
    "DigitalManufacturing", 
    "AutomationLab", 
    "FormingLabs", 
    "MaterialTesting", 
    "Metrology"
]; 

// เริ่มต้นการทำงานด้วย LIFF
liff.init({ liffId: LIFF_ID }).then(() => {
    if (liff.isLoggedIn()) {
        liff.getProfile().then(profile => {
            const stationName = getStationParam();

            if (!stationName || !validStations.includes(stationName)) {
                showResult("❌ ไม่พบฐานกิจกรรม", "QR Code ไม่ถูกต้อง หรือไม่มีฐานนี้ในระบบ", false);
            } else {
                verifyAndCheckin(profile.userId, stationName);
            }
        });
    } else {
        liff.login();
    }
}).catch(err => {
    showResult("❌ เกิดข้อผิดพลาดในการโหลด LIFF", err.message, false);
});

// ฟังก์ชันแกะค่า station ออกมาจาก URL หรือ liff.state
function getStationParam() {
    const urlParams = new URLSearchParams(window.location.search);
    let station = urlParams.get('station');

    if (!station) {
        const liffState = urlParams.get('liff.state');
        if (liffState) {
            const decodedState = decodeURIComponent(liffState);
            const stateParams = new URLSearchParams(decodedState.includes('?') ? decodedState.split('?')[1] : decodedState);
            station = stateParams.get('station');
        }
    }
    return station;
}

// 1. ตรวจสอบสถานะการลงทะเบียนของผู้ใช้งาน
function verifyAndCheckin(uid, station) {
    fetch(GAS_URL + "?action=checkUser&userId=" + encodeURIComponent(uid))
    .then(response => response.json())
    .then(data => {
        if (data.status !== "found") {
            // ยังไม่ได้ลงทะเบียน -> เปลี่ยนทางไปยัง LIFF URL ของหน้าลงทะเบียนโดยตรง
            alert("คุณยังไม่ได้ลงทะเบียน กรุณาลงทะเบียนก่อนเข้าฐานกิจกรรมครับ");
            window.location.href = REGISTER_LIFF_URL; 
        } else {
            // ลงทะเบียนเรียบร้อยแล้ว -> ทำการเช็คอิน
            sendCheckinGET(uid, station);
        }
    })
    .catch(error => {
        showResult("❌ เชื่อมต่อล้มเหลว", "ไม่สามารถตรวจสอบข้อมูลผู้ใช้งานได้", false);
    });
}

// 2. ส่งข้อมูลเช็คอินและตรวจเช็คการบันทึกซ้ำ
function sendCheckinGET(uid, station) {
    fetch(GAS_URL + "?action=processCheckin&userId=" + encodeURIComponent(uid) + "&station=" + encodeURIComponent(station))
    .then(response => response.json())
    .then(data => {
        if (data.status === "duplicate") {
            showResult("⚠️ เคยเช็คอินแล้ว", "เมื่อเวลา: " + data.time, false);
            document.getElementById("status").style.color = "#ff9800";
        } else if (data.status === "success") {
            showResult("✅ เช็คอินสำเร็จ!", "ฐาน: " + station, true);
            setTimeout(() => {
                if (liff.isInClient()) liff.closeWindow();
            }, 2500);
        } else {
            showResult("❌ เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", false);
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