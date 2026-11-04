// ใส่ LIFF ID สำหรับหน้าแลกรางวัล (หรือใช้ ID เดียวกับหน้าลงทะเบียนก็ได้)
const LIFF_ID = "2012346461-aXrfKbyZ";
const REGISTER_LIFF_URL = "https://liff.line.me/2012346461-aXrfKbyZ";
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30XwcioTpPSuMYZyUF3X1jtImjG7LabmdFMpkkcfB5HFk-c-cfXb4js_3FIvccGgbhw/exec";

// รายชื่อ 6 ฐานทั้งหมดที่ต้องเข้า
const allStations = [
    "MachineToolLab",
    "DigitalManufacturing",
    "AutomationLab",
    "FormingLabs",
    "MaterialTesting",
    "Metrology"
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

// ตรวจสอบสถานะการสะสมฐานและการแลกรางวัล
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
            const isRedeemed = data.isRedeemed; // true หากแลกรางวัลไปแล้ว

            renderStationList(completedStations);

            const titleEl = document.getElementById("rewardTitle");
            const subTitleEl = document.getElementById("rewardSubTitle");
            const btnRedeem = document.getElementById("btnRedeem");

            if (isRedeemed) {
                titleEl.innerText = "🎁 รับของรางวัลเรียบร้อยแล้ว";
                titleEl.style.color = "#2e7d32";
                subTitleEl.innerText = "ขอบคุณที่เข้าร่วมกิจกรรม Open House 2027 ครับ!";
                btnRedeem.style.display = "none";
            } else if (completedStations.length === allStations.length) {
                titleEl.innerText = "🎉 ยินดีด้วย! คุณเข้าครบทุกฐานแล้ว";
                titleEl.style.color = "#ff7a18";
                subTitleEl.innerText = "ยื่นหน้าจอนี้ให้เจ้าหน้าที่เพื่อกดรับของรางวัล";
                btnRedeem.style.display = "block";
            } else {
                titleEl.innerText = `สะสมได้ ${completedStations.length} / ${allStations.length} ฐาน`;
                titleEl.style.color = "#c62828";
                subTitleEl.innerText = "เข้าชมและเช็คอินให้ครบทุกฐานเพื่อรับของรางวัลสุดพิเศษ";
                btnRedeem.style.display = "none";
            }
        })
        .catch(err => {
            document.getElementById("loading").style.display = "none";
            alert("ไม่สามารถดึงข้อมูลได้: " + err.message);
        });
}

// แสดงรายการฐานว่าผ่านฐานไหนแล้วบ้าง
function renderStationList(completedStations) {
    const listEl = document.getElementById("stationList");
    let html = "";

    allStations.forEach(st => {
        const isDone = completedStations.includes(st);
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eee;">
                <span style="color: #333; font-weight: 500;">${st}</span>
                <span style="font-weight: 600; color: ${isDone ? '#2e7d32' : '#bbb'};">
                    ${isDone ? '✅ เช็คอินแล้ว' : '⚪ ยังไม่เข้า'}
                </span>
            </div>
        `;
    });

    listEl.innerHTML = html;
}

// ฟังก์ชันเมื่อเจ้าหน้าที่กดปุ่มรับของรางวัล
function redeemReward() {
    if (confirm("ยืนยันการมอบของรางวัลแก่ผู้เข้าร่วมงานท่านนี้? (กดได้ครั้งเดียว)")) {
        const btn = document.getElementById("btnRedeem");
        btn.innerText = "กำลังบันทึก...";
        btn.disabled = true;

        fetch(GAS_URL + "?action=redeemReward&userId=" + encodeURIComponent(currentUserId))
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    alert("บันทึกการรับของรางวัลสำเร็จ!");
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