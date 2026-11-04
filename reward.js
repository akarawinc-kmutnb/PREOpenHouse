const LIFF_ID = "2012346461-eGkNnxR3"; 
const REGISTER_LIFF_URL = "https://liff.line.me/2012346461-aXrfKbyZ";
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

// กำหนดชื่อฐานและชื่อย่อแสดงบนแสตมป์
const allStations = [
    { id: "MachineToolLab", name: "Machine Tool" },
    { id: "DigitalManufacturing", name: "Digital Mfg." },
    { id: "AutomationLab", name: "Automation" },
    { id: "FormingLabs", name: "Forming" },
    { id: "MaterialTesting", name: "Material Testing" },
    { id: "Metrology", name: "Metrology" }
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
    document.getElementById("loading").style.display = "none";
    alert("เกิดข้อผิดพลาดในการโหลด LIFF: " + err.message);
});

function checkRewardStatus(uid) {
    fetch(GAS_URL + "?action=checkReward&userId=" + encodeURIComponent(uid))
    .then(res => res.json())
    .then(data => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("rewardCard").style.display = "block";

        if (data.status === "not_registered") {
            alert("คุณยังไม่ได้ลงทะเบียน กรุณาลงทะเบียนก่อนครับ");
            window.location.href = REGISTER_LIFF_URL;
            return;
        }

        const completedStations = data.completedStations || [];
        const isRedeemed = data.isRedeemed;

        // วาดแสตมป์บนการ์ด
        renderStampGrid(completedStations);

        const titleEl = document.getElementById("rewardTitle");
        const subTitleEl = document.getElementById("rewardSubTitle");
        const badgeEl = document.getElementById("stampCountBadge");
        const btnRedeem = document.getElementById("btnRedeem");

        badgeEl.innerText = `${completedStations.length} / ${allStations.length}`;

        if (isRedeemed) {
            titleEl.innerText = "🎁 รับของรางวัลแล้ว";
            titleEl.style.color = "#2e7d32";
            badgeEl.style.background = "#e8f5e9";
            badgeEl.style.color = "#2e7d32";
            subTitleEl.innerText = "ขอบคุณที่เข้าร่วมกิจกรรม Open House 2027 ครับ!";
            btnRedeem.style.display = "none";
        } else if (completedStations.length === allStations.length) {
            titleEl.innerText = "🎉 สะสมแสตมป์ครบแล้ว!";
            titleEl.style.color = "#ff7a18";
            badgeEl.style.background = "#fff3e0";
            badgeEl.style.color = "#e65100";
            subTitleEl.innerText = "ยื่นหน้าจอนี้ให้เจ้าหน้าที่เพื่อกดรับของรางวัล";
            btnRedeem.style.display = "block";
        } else {
            titleEl.innerText = "บัตรสะสมแสตมป์";
            titleEl.style.color = "#333";
            subTitleEl.innerText = "สแกน QR Code เช็คอินให้ครบ 6 ฐานเพื่อรับของรางวัล";
            btnRedeem.style.display = "none";
        }
    })
    .catch(err => {
        document.getElementById("loading").style.display = "none";
        alert("ไม่สามารถดึงข้อมูลได้: " + err.message);
    });
}

// ฟังก์ชันสร้างการ์ดแสตมป์ (Stamp Grid)
function renderStampGrid(completedStations) {
    const gridEl = document.getElementById("stampGrid");
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
                <!-- ตัวเลขลำดับฐาน -->
                <div style="position: absolute; top: 6px; left: 8px; font-size: 10px; color: #999; font-weight: 600;">#0${index + 1}</div>
                
                <!-- ไอคอนแสตมป์ -->
                <div style="margin: 8px 0 4px 0;">
                    ${isDone 
                        ? `<div style="
                            display: inline-flex; 
                            align-items: center; 
                            justify-content: center; 
                            width: 44px; 
                            height: 44px; 
                            background: #2e7d32; 
                            color: white; 
                            border-radius: 50%; 
                            font-size: 20px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            transform: rotate(-5deg);
                           ">PASSED</div>` 
                        : `<div style="
                            display: inline-flex; 
                            align-items: center; 
                            justify-content: center; 
                            width: 44px; 
                            height: 44px; 
                            background: #eee; 
                            color: #aaa; 
                            border-radius: 50%; 
                            font-size: 18px;
                           ">⚪</div>`
                    }
                </div>
                
                <!-- ชื่อฐาน -->
                <div style="font-size: 12px; font-weight: 500; color: ${isDone ? '#2e7d32' : '#666'};">
                    ${st.name}
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;
}

function redeemReward() {
    if (confirm("ยืนยันการมอบของรางวัลแก่ผู้เข้าร่วมงานท่านนี้? (สามารถกดได้เพียงครั้งเดียว)")) {
        const btn = document.getElementById("btnRedeem");
        btn.innerText = "กำลังบันทึก...";
        btn.disabled = true;

        fetch(GAS_URL + "?action=redeemReward&userId=" + encodeURIComponent(currentUserId))
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("บันทึกการรับของรางวัลเรียบร้อยแล้ว!");
                checkRewardStatus(currentUserId);
            } else {
                alert("เกิดข้อผิดพลาด: " + data.message);
                btn.innerText = "เจ้าหน้าที่กดเพื่อมอบของรางวัล";
                btn.disabled = false;
            }
        })
        .catch(err => {
            alert("บันทึกไม่สำเร็จ: " + err.message);
            btn.innerText = "เจ้าหน้าที่กดเพื่อมอบของรางวัล";
            btn.disabled = false;
        });
    }
}