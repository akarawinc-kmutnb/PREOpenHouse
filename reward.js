const LIFF_ID = "2012346461-eGkNnxR3"; 
const REGISTER_LIFF_URL = "https://liff.line.me/2012346461-aXrfKbyZ";
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

// กำหนดโครงสร้างฐานและไฟล์รูปใน src/
const allStations = [
    { id: "MachineToolLab", name: "Machine Tool", img: "src/MachineToolLab.png" },
    { id: "DigitalManufacturing", name: "Digital Mfg.", img: "src/DigitalManufacturing.png" },
    { id: "AutomationLab", name: "Automation", img: "src/AutomationLab.png" },
    { id: "FormingLabs", name: "Forming", img: "src/FormingLabs.png" },
    { id: "MaterialTesting", name: "Material Testing", img: "src/MaterialTesting.png" },
    { id: "Metrology", name: "Metrology", img: "src/Metrology.png" }
];

let currentUserId = "";

liff.init({ liffId: LIFF_ID }).then(() => {
    if (liff.isLoggedIn()) {
        liff.getProfile().then(profile => {
            currentUserId = profile.userId;
            checkRewardStatus(currentUserId);
        });
    } else {
        liff.login();
    }
}).catch(err => {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.style.display = "none";
    alert("เกิดข้อผิดพลาดในการโหลด LIFF: " + err.message);
});

function checkRewardStatus(uid) {
    fetch(GAS_URL + "?action=checkReward&userId=" + encodeURIComponent(uid))
    .then(res => res.json())
    .then(data => {
        const loadingEl = document.getElementById("loading");
        const rewardCardEl = document.getElementById("rewardCard");
        
        if (loadingEl) loadingEl.style.display = "none";
        if (rewardCardEl) rewardCardEl.style.display = "block";

        if (data.status === "not_registered") {
            alert("คุณยังไม่ได้ลงทะเบียน กรุณาลงทะเบียนก่อนครับ");
            window.location.href = REGISTER_LIFF_URL;
            return;
        }

        const completedStations = data.completedStations || [];
        const isRedeemed = data.isRedeemed;

        renderStampGrid(completedStations);

        const titleEl = document.getElementById("rewardTitle");
        const subTitleEl = document.getElementById("rewardSubTitle");
        const badgeEl = document.getElementById("stampCountBadge");
        const barcodeContainer = document.getElementById("barcodeContainer");

        if (badgeEl) badgeEl.innerText = `${completedStations.length} / 6`;

        if (isRedeemed) {
            // กรณี: รับรางวัลไปแล้ว
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

        } else if (completedStations.length === 6) {
            // กรณี: แสตมป์ครบ 6 ฐาน (โชว์บาร์โค้ด)
            if (titleEl) {
                titleEl.innerText = "🎉 สะสมแสตมป์ครบแล้ว!";
                titleEl.style.color = "#ff7a18";
            }
            if (badgeEl) {
                badgeEl.style.background = "#fff3e0";
                badgeEl.style.color = "#e65100";
            }
            if (subTitleEl) subTitleEl.innerText = "ยื่น Barcode ด้านล่างนี้ให้เจ้าหน้าที่สแกนเพื่อรับของรางวัล";
            
            if (barcodeContainer) {
                barcodeContainer.style.display = "block";
                // เช็คว่าโหลด library JsBarcode มาหรือยัง
                if (typeof JsBarcode !== "undefined") {
                    JsBarcode("#barcode", uid, {
                        format: "CODE128",
                        lineColor: "#333",
                        width: 2,
                        height: 60,
                        displayValue: false
                    });
                }
            }

        } else {
            // กรณี: แสตมป์ยังไม่ครบ
            if (titleEl) {
                titleEl.innerText = "บัตรสะสมแสตมป์";
                titleEl.style.color = "#333";
            }
            if (subTitleEl) subTitleEl.innerText = "สแกน QR Code เช็คอินให้ครบ 6 ฐานเพื่อรับของรางวัล";
            if (barcodeContainer) barcodeContainer.style.display = "none";
        }
    })
    .catch(err => {
        const loadingEl = document.getElementById("loading");
        if (loadingEl) loadingEl.style.display = "none";
        alert("ไม่สามารถดึงข้อมูลได้: " + err.message);
    });
}

function renderStampGrid(completedStations) {
    const gridEl = document.getElementById("stampGrid");
    if (!gridEl) return; // ดักจับเผื่อไม่มี id="stampGrid"
    
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

// ฟังก์ชันเดิม (หากในระบบคุณไม่ได้ปุ่ม btnRedeem บนหน้ามือถือแล้ว สามารถลบฟังก์ชันนี้ออกได้เลย แต่คงไว้เพื่อกัน Error)
function redeemReward() {
    if (confirm("ยืนยันการมอบของรางวัลแก่ผู้เข้าร่วมงานท่านนี้? (สามารถกดได้เพียงครั้งเดียว)")) {
        const btn = document.getElementById("btnRedeem");
        if (btn) {
            btn.innerText = "กำลังบันทึก...";
            btn.disabled = true;
        }

        fetch(GAS_URL + "?action=redeemReward&userId=" + encodeURIComponent(currentUserId))
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("บันทึกการรับของรางวัลเรียบร้อยแล้ว!");
                checkRewardStatus(currentUserId);
            } else {
                alert("เกิดข้อผิดพลาด: " + data.message);
                if (btn) {
                    btn.innerText = "เจ้าหน้าที่กดเพื่อมอบของรางวัล";
                    btn.disabled = false;
                }
            }
        })
        .catch(err => {
            alert("บันทึกไม่สำเร็จ: " + err.message);
            if (btn) {
                btn.innerText = "เจ้าหน้าที่กดเพื่อมอบของรางวัล";
                btn.disabled = false;
            }
        });
    }
}