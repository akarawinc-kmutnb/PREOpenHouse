const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

let html5QrcodeScanner;
let isProcessing = false;

function onScanSuccess(decodedText, decodedResult) {
    if (isProcessing) return;
    isProcessing = true;

    const statusEl = document.getElementById("scanStatus");
    statusEl.innerHTML = "⏳ กำลังตรวจสอบและบันทึกข้อมูล...";
    statusEl.style.color = "#ff9800";

    // ส่ง LINE ID ที่ได้จาก Barcode ไปตัดสิทธิ์แลกรางวัลใน Google Sheet
    fetch(GAS_URL + "?action=redeemReward&userId=" + encodeURIComponent(decodedText))
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            statusEl.innerHTML = "✅ <b>สำเร็จ!</b> มอบของรางวัลเรียบร้อยแล้ว";
            statusEl.style.color = "#2e7d32";
            alert("✅ บันทึกสำเร็จ! มอบของรางวัลเรียบร้อยแล้ว");
        } else {
            statusEl.innerHTML = "❌ " + (data.message || "เกิดข้อผิดพลาด");
            statusEl.style.color = "#c62828";
            alert("❌ ไม่สามารถแลกได้: " + (data.message || "ข้อมูลไม่ถูกต้อง"));
        }
        
        // หน่วงเวลา 2.5 วินาที ก่อนเปิดรับการสแกนคนถัดไป
        setTimeout(() => {
            isProcessing = false;
            statusEl.innerHTML = "📷 ส่องกล้องไปที่ Barcode บนจอนักเรียน";
            statusEl.style.color = "#555";
        }, 2500);
    })
    .catch(err => {
        statusEl.innerHTML = "❌ เชื่อมต่อล้มเหลว";
        statusEl.style.color = "#c62828";
        alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ: " + err.message);
        isProcessing = false;
    });
}

// เริ่มต้นเปิดใช้งานกล้อง
window.onload = function() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10, 
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0
        },
        /* verbose= */ false
    );
    html5QrcodeScanner.render(onScanSuccess);
};