const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

let html5QrcodeScanner;
let isProcessing = false;

function onScanSuccess(decodedText, decodedResult) {
    if (isProcessing) return;
    isProcessing = true;

    const statusEl = document.getElementById("scanStatus");
    
    // แสดงวงกลมหมุนรอผลขณะส่งข้อมูลไปประมวลผล
    statusEl.innerHTML = `<span class="spinner"></span> <span>กำลังตรวจสอบข้อมูล...</span>`;
    statusEl.style.background = "#fff3e0";
    statusEl.style.color = "#e65100";
    statusEl.style.borderColor = "#ffe0b2";

    // ส่ง LINE ID ไปบันทึกการรับของรางวัลใน Google Sheet
    fetch(GAS_URL + "?action=redeemReward&userId=" + encodeURIComponent(decodedText))
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            statusEl.innerHTML = `✅ <b>รับรางวัลสำเร็จ!</b> มอบของรางวัลเรียบร้อย`;
            statusEl.style.background = "#e8f5e9";
            statusEl.style.color = "#2e7d32";
            statusEl.style.borderColor = "#a5d6a7";
        } else {
            statusEl.innerHTML = `❌ ${data.message || "เกิดข้อผิดพลาด"}`;
            statusEl.style.background = "#ffebee";
            statusEl.style.color = "#c62828";
            statusEl.style.borderColor = "#ef9a9a";
        }
        
        // หน่วงเวลา 2.5 วินาที ก่อนเปิดรับการสแกนคนถัดไป
        setTimeout(() => {
            resetScannerStatus();
        }, 2500);
    })
    .catch(err => {
        statusEl.innerHTML = `❌ เชื่อมต่อล้มเหลว: ${err.message}`;
        statusEl.style.background = "#ffebee";
        statusEl.style.color = "#c62828";
        statusEl.style.borderColor = "#ef9a9a";
        
        setTimeout(() => {
            resetScannerStatus();
        }, 2500);
    });
}

// ฟังก์ชันคืนค่าสถานะพร้อมสแกนคนถัดไป
function resetScannerStatus() {
    isProcessing = false;
    const statusEl = document.getElementById("scanStatus");
    statusEl.innerHTML = `<span style="font-size: 20px;">📷</span> <span>ส่องกล้องไปที่ QR Code บนจอนักเรียน</span>`;
    statusEl.style.background = "#e8f0fe";
    statusEl.style.color = "#1e3c72";
    statusEl.style.borderColor = "#cce0ff";
}

// เริ่มต้นกล้อง
window.onload = function() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10, 
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0
        },
        /* verbose= */ false
    );
    html5QrcodeScanner.render(onScanSuccess);
};