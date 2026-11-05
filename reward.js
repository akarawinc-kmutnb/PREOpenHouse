const LIFF_ID = "2012346461-eGkNnxR3";
const REGISTER_LIFF_URL = "https://liff.line.me/2012346461-aXrfKbyZ";
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

const allStations = [
    { id: "MachineToolLab", name: "Machine Tool", img: "src/MachineToolLab.png" },
    { id: "DigitalManufacturing", name: "Digital Mfg.", img: "src/DigitalManufacturing.png" },
    { id: "AutomationLab", name: "Automation", img: "src/AutomationLab.png" },
    { id: "FormingLabs", name: "Forming", img: "src/FormingLabs.png" },
    { id: "MaterialTesting", name: "Material Testing", img: "src/MaterialTesting.png" },
    { id: "Metrology", name: "Metrology", img: "src/Metrology.png" }
];

let currentUserId = "";

// ฟังก์ชันหลักสำหรับเริ่มระบบ
async function initApp() {
    try {
        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            currentUserId = profile.userId;
            await checkRewardStatus(currentUserId);
        } else {
            liff.login();
        }
    } catch (err) {
        hideLoading();
        alert("เกิดข้อผิดพลาดในการโหลด LIFF: " + err.message);
    }
}

// ฟังก์ชันซ่อนสถานะกำลังโหลด
function hideLoading() {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.style.display = "none";
}

// ฟังก์ชันดึงข้อมูลจาก GAS
async function checkRewardStatus(uid) {
    try {
        const response = await fetch(`${GAS_URL}?action=checkReward&userId=${encodeURIComponent(uid)}`);
        const data = await response.json();

        hideLoading();
        const rewardCardEl = document.getElementById("rewardCard");
        if (rewardCardEl) rewardCardEl.style.display = "block";

        if (data.status === "not_registered") {
            alert("คุณยังไม่ได้ลงทะเบียน กรุณาลงทะเบียนก่อนครับ");
            window.location.href = REGISTER_LIFF_URL;
            return;
        }

        const completedStations = data.completedStations || [];
        const isRedeemed = data.isRedeemed;

        renderStampGrid(completedStations);
        updateRewardUI(completedStations.length, isRedeemed, uid);

    } catch (err) {
        hideLoading();
        alert("ไม่สามารถดึงข้อมูลได้: " + err.message);
    }
}

// ฟังก์ชันจัดการการแสดงผลบนหน้าจอ
function updateRewardUI(completedCount, isRedeemed, uid) {
    const titleEl = document.getElementById("rewardTitle");
    const subTitleEl = document.getElementById("rewardSubTitle");
    const badgeEl = document.getElementById("stampCountBadge");
    const barcodeContainer = document.getElementById("barcodeContainer");

    if (badgeEl) badgeEl.innerText = `${completedCount} / 6`;

    if (isRedeemed) {
        // รับรางวัลไปแล้ว
        if (titleEl) {
            titleEl.innerText = "🎁 รับของรางวัลแล้ว";
            titleEl.style.color = "#2e7d32";
        }
        if (badgeEl) {
            badgeEl.style.background = "#e8f5e9";
            badgeEl.style.color = "#2e7d32";
        }
        if (subTitleEl) subTitleEl.innerText = "ขอบคุณที่เข้าร่วมกิจกรรม Open House ครับ!";
        if (barcodeContainer) barcodeContainer.style.display = "none";

    } else if (completedCount === 6) {
        // แสตมป์ครบ 6 ฐาน
        if (titleEl) {
            titleEl.innerText = "🎉 สะสมแสตมป์ครบแล้ว!";
            titleEl.style.color = "#ff7a18";
        }
        if (badgeEl) {
            badgeEl.style.background = "#fff3e0";
            badgeEl.style.color = "#e65100";
        }
        if (subTitleEl) subTitleEl.innerText = "ยื่น QR Code ด้านล่างนี้ให้เจ้าหน้าที่สแกนเพื่อรับของรางวัล";

        if (barcodeContainer) {
            barcodeContainer.style.display = "block";
            generateQRCode(uid);
        }
    } else {
        // แสตมป์ยังไม่ครบ
        if (titleEl) {
            titleEl.innerText = "บัตรสะสมแสตมป์";
            titleEl.style.color = "#333";
        }
        if (subTitleEl) subTitleEl.innerText = "สแกน QR Code เช็คอินให้ครบ 6 ฐานเพื่อรับของรางวัล";
        if (barcodeContainer) barcodeContainer.style.display = "none";
    }
}

// ฟังก์ชันสร้าง QR Code
function generateQRCode(text) {
    const qrContainer = document.getElementById("qrcode");
    if (!qrContainer) return;

    qrContainer.innerHTML = ""; // ล้างคิวอาร์โค้ดเก่าออกก่อน

    // ดักจับ Error กรณีไม่ได้นำเข้า Library QRCode.js ในไฟล์ HTML
    if (typeof QRCode === "undefined") {
        qrContainer.innerHTML = "<div style='color:#d32f2f; font-size:14px; margin-top:10px;'>❌ ไม่สามารถสร้าง QR Code ได้ (ไม่พบ QRCode Library)</div>";
        return;
    }

    new QRCode(qrContainer, {
        text: text,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// ฟังก์ชันวาดตราประทับ
function renderStampGrid(completedStations) {
    const gridEl = document.getElementById("stampGrid");
    if (!gridEl) return;

    let html = "";
    allStations.forEach((st, index) => {
        const isDone = completedStations.includes(st.id);
        html += `
            <div style="
                background: ${isDone ? '#f0fdf4' : '#fafafa'}; 
                border: 2px ${isDone ? 'solid #2e7d32' : 'dashed #ddd'}; 
                border-radius: 12px; 
                padding: 12px 8px; 
                text-align: center; 
                position: relative;
                box-shadow: ${isDone ? '0 2px 8px rgba(46,125,50,0.15)' : 'none'};
            ">
                <div style="position: absolute; top: 6px; left: 8px; font-size: 10px; color: #999; font-weight: 600;">#0${index + 1}</div>
                <div style="margin: 6px 0; height: 50px; display: flex; align-items: center; justify-content: center;">
                    <img src="${st.img}" alt="${st.name}" style="
                        width: 46px; height: 46px; object-fit: contain; 
                        filter: ${isDone ? 'none' : 'grayscale(100%) opacity(30%)'};
                        transform: ${isDone ? 'scale(1.05)' : 'scale(0.95)'};
                        transition: all 0.3s ease;
                    ">
                </div>
                <div style="font-size: 12px; font-weight: 500; color: ${isDone ? '#2e7d32' : '#888'};">
                    ${st.name}
                </div>
                <div style="font-size: 10px; font-weight: 600; margin-top: 2px; color: ${isDone ? '#2e7d32' : '#bbb'};">
                    ${isDone ? '✅ ผ่านแล้ว' : '⚪ ยังไม่เข้า'}
                </div>
            </div>
        `;
    });
    gridEl.innerHTML = html;
}

// ฟังก์ชันเจ้าหน้าที่กดเพื่อมอบของรางวัล
async function redeemReward() {
    if (!confirm("ยืนยันการมอบของรางวัลแก่ผู้เข้าร่วมงานท่านนี้? (สามารถกดได้เพียงครั้งเดียว)")) return;

    const btn = document.getElementById("btnRedeem");
    if (btn) {
        btn.innerText = "กำลังบันทึก...";
        btn.disabled = true;
    }

    try {
        const response = await fetch(`${GAS_URL}?action=redeemReward&userId=${encodeURIComponent(currentUserId)}`);
        const data = await response.json();

        if (data.status === "success") {
            alert("บันทึกการรับของรางวัลเรียบร้อยแล้ว!");
            await checkRewardStatus(currentUserId);
        } else {
            alert("เกิดข้อผิดพลาด: " + data.message);
            if (btn) {
                btn.innerText = "เจ้าหน้าที่กดเพื่อมอบของรางวัล";
                btn.disabled = false;
            }
        }
    } catch (err) {
        alert("บันทึกไม่สำเร็จ: " + err.message);
        if (btn) {
            btn.innerText = "เจ้าหน้าที่กดเพื่อมอบของรางวัล";
            btn.disabled = false;
        }
    }
}

// เรียกใช้งานเมื่อโหลดไฟล์ Script
initApp();