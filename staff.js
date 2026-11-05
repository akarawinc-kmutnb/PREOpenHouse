const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

let html5QrcodeScanner = null;

// เปิดการทำงานของกล้อง
function startScanner() {
    document.getElementById("scannerContainer").style.display = "block";
    document.getElementById("resultCard").style.display = "none";
    document.getElementById("btnScanNext").style.display = "none";

    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10, 
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );
    }
    
    html5QrcodeScanner.render(onScanSuccess);
}

// หยุดการทำงานและเคลียร์กล้อง
function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(err => console.error("Failed to clear scanner:", err));
    }
}

// เมื่อสแกนติด
function onScanSuccess(decodedText, decodedResult) {
    // 1. ปิดกล้องทันที
    stopScanner();
    document.getElementById("scannerContainer").style.display = "none";

    // 2. แสดงสถานะใหญ่แบบหมุนรอผล
    showLoadingState();

    // 3. ส่งข้อมูลไปประมวลผลใน Google Sheets
    fetch(GAS_URL + "?action=redeemReward&userId=" + encodeURIComponent(decodedText))
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            showResultState(
                "✅", 
                "มอบของรางวัลสำเร็จ!", 
                "บันทึกข้อมูลการรับรางวัลเรียบร้อยแล้ว", 
                "#f0fdf4", 
                "#2e7d32", 
                "#2e7d32"
            );
        } else {
            showResultState(
                "❌", 
                "ไม่สามารถมอบรางวัลได้", 
                data.message || "ข้อมูลไม่ถูกต้อง หรือเคยรับไปแล้ว", 
                "#fef2f2", 
                "#991b1b", 
                "#dc2626"
            );
        }
    })
    .catch(err => {
        showResultState(
            "⚠️", 
            "เชื่อมต่อล้มเหลว", 
            "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้: " + err.message, 
            "#fffbe0", 
            "#854d0e", 
            "#ca8a04"
        );
    });
}

// แสดงสถานะกำลังโหลดแบบใหญ่
function showLoadingState() {
    const card = document.getElementById("resultCard");
    card.style.display = "block";
    card.style.background = "#f8faff";
    card.style.border = "2px solid #2a5298";

    document.getElementById("resultIcon").innerHTML = `<div class="big-spinner"></div>`;
    document.getElementById("resultTitle").innerText = "กำลังบันทึกข้อมูล...";
    document.getElementById("resultTitle").style.color = "#1e3c72";
    document.getElementById("resultDetail").innerText = "กรุณารอสักครู่ ระบบกำลังตรวจสอบสิทธิ์";
    document.getElementById("resultDetail").style.color = "#555";
}

// แสดงการ์ดผลลัพธ์ขนาดใหญ่พร้อมปุ่มกดสแกนต่อ
function showResultState(icon, title, detail, bg, titleColor, borderColor) {
    const card = document.getElementById("resultCard");
    card.style.display = "block";
    card.style.background = bg;
    card.style.border = `2px solid ${borderColor}`;

    document.getElementById("resultIcon").innerText = icon;
    document.getElementById("resultTitle").innerText = title;
    document.getElementById("resultTitle").style.color = titleColor;
    document.getElementById("resultDetail").innerText = detail;
    document.getElementById("resultDetail").style.color = titleColor;

    // แสดงปุ่มสำหรับกดสแกนคนถัดไป
    document.getElementById("btnScanNext").style.display = "block";
}

// เริ่มต้นเปิดกล้องทันทีที่เปิดหน้าเว็บ
window.onload = function() {
    startScanner();
};