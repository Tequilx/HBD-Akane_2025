// ==========================================
// 🎵 YOUTUBE PLAYER (เพลงเดียว วนลูป)
// ==========================================
const mainSong = {
    id: 'qVVZf_T5ghY', // ⚠️ ใส่รหัสเพลงหลักที่ต้องการตรงนี้
    start: 6,          // เริ่มวินาทีที่...
    end: 46           // จบวินาทีที่... (แล้ววนกลับไป start)
};

let player;
let isPlayerReady = false;
let timeUpdater = null;

// โหลด YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// สร้าง Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-container', {
        height: '1', width: '1',
        videoId: mainSong.id,
        playerVars: {
            'playsinline': 1, 'controls': 0, 'disablekb': 1, 'fs': 0, 'rel': 0,
            'start': mainSong.start,
            'autoplay': 0 // ยังไม่เล่น รอคำสั่ง
        },
        events: {
            'onReady': (e) => {
                isPlayerReady = true;
                e.target.setVolume(100);
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

// ระบบวนลูป (Loop)
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startLoopCheck();
    } else {
        stopLoopCheck();
    }
}

// เช็คเวลาเพื่อวนลูป (Loop Checker)
function startLoopCheck() {
    stopLoopCheck();
    timeUpdater = setInterval(() => {
        if (!player || !player.getCurrentTime) return;

        let currentTime = player.getCurrentTime();

        // ถ้าเล่นถึงจุดจบ (End) -> ดีดกลับไปจุดเริ่ม (Start)
        if (currentTime >= mainSong.end) {
            player.seekTo(mainSong.start);
            player.pauseVideo(); // ⏹️ สั่งหยุดเพลง
            stopTimeCheck();     // เลิกจับเวลา
        }
    }, 0); // เช็คทุก 0.2 วินาที
}

function stopLoopCheck() {
    if (timeUpdater) {
        clearInterval(timeUpdater);
        timeUpdater = null;
    }
}

// ========================================================
// 🟢 GLOBAL FUNCTIONS (ฟังก์ชันที่เรียกจาก HTML โดยตรง)
// ========================================================

// 1. ฟังก์ชันโหลดรูป (Preview)
function previewImage(event, inputElement) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const bookPage = inputElement.closest('.book-page');
            const img = bookPage.querySelector('.wish-image');
            if (img) img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// 2. ฟังก์ชันดาวน์โหลดรูป (Save)
function downloadImage(btn) {
    const bookPage = btn.closest('.book-page');
    const img = bookPage.querySelector('.wish-image');
    if (img) {
        const link = document.createElement('a');
        link.href = img.src;
        const fileName = img.src.substring(img.src.lastIndexOf('/') + 1) || 'memory-card.png';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ========================================================
// 🔵 MAIN LOGIC (ทำงานเมื่อเว็บโหลดเสร็จ)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("Birthday Surprise Loaded!");

    const bgVideo = document.getElementById('my-local-video');
    if (bgVideo) {
        bgVideo.muted = true; // ⚠️ สำคัญ: ต้องปิดเสียง ไม่งั้น Browser ไม่ยอมให้เล่นเอง
        bgVideo.play().catch(e => console.log("Autoplay prevented:", e));
    }

    // --- ประกาศตัวแปรหลัก ---
    const sceneCover = document.getElementById('scene-cover');
    const sceneCake = document.getElementById('scene-cake');
    const sceneGift = document.getElementById('scene-gift');
    const sceneBook = document.getElementById('scene-book');
    const hbdSong = document.getElementById('hbd-song');
    const introSong = document.getElementById('intro-song');

    // --- Helper: ฟังก์ชันเปลี่ยนหน้า ---
    function switchScene(fromScene, toScene) {
        fromScene.classList.remove('active');
        toScene.classList.add('active');
    }

    // ==========================================
    // 1️⃣ SWIPE UP TO START (ปัดขึ้นเพื่อเริ่ม)
    // ==========================================
    let startY = 0;
    let isCoverSwiping = false;

    if (sceneCover) {
        sceneCover.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isCoverSwiping = true;
        }, { passive: true });

        sceneCover.addEventListener('touchend', (e) => {
            if (!isCoverSwiping) return;
            isCoverSwiping = false;
            const endY = e.changedTouches[0].clientY;

            // ถ้าลากขึ้นเกิน 50px
            if (startY - endY > 50) {
                startSurprise();
            }
        }, { passive: true });

        // รองรับเมาส์ (เผื่อเล่นในคอม)
        sceneCover.addEventListener('mousedown', (e) => startY = e.clientY);
        sceneCover.addEventListener('mouseup', (e) => {
            if (startY - e.clientY > 50) startSurprise();
        });
    }

    function playIntro() {
        if (introSong && introSong.paused) {
            introSong.volume = 0.3; // เปิดเบาๆ คลอๆ
            introSong.play().then(() => {
                console.log("Intro playing...");
            }).catch(e => {
                console.log("Auto-play blocked, waiting for touch...");
            });
        }
    }

    // 1. พยายามเล่นทันทีที่โหลดเสร็จ
    playIntro();

    // 2. แผนสำรอง: ถ้าโดนบล็อก ให้เล่นทันทีที่แตะหน้าจอครั้งแรก (ที่ไหนก็ได้)
    document.body.addEventListener('touchstart', function () {
        playIntro();
    }, { once: true }); // once: true คือทำแค่ครั้งแรกครั้งเดียวพอ

    document.body.addEventListener('click', function () { // เผื่อเปิดในคอม
        playIntro();
    }, { once: true });

    function startSurprise() {
        // 1. หยุดของเดิม
        const coverVideo = document.getElementById('cover-video');
        if (coverVideo) coverVideo.src = "";
        if (introSong) introSong.pause();

        // 🎵 2. สั่งเล่นเพลง YouTube (เล่นรอบเดียว)
        if (isPlayerReady && player) {
            player.playVideo();
        }

        // -------------------------------------------
        // 🎥 3. วิดีโอพื้นหลัง (ค้างเฟรมสุดท้าย)
        // -------------------------------------------
        const localVideo = document.getElementById('my-local-video');

        // 👇 ตั้งค่าช่วงเวลา
        const vidStart = 0;
        const vidEnd = 42;   // พอถึงวิที่ 25 จะหยุดค้าง

        if (localVideo) {
            localVideo.muted = true;
            localVideo.loop = false; // ⛔ บังคับปิด Loop ของระบบ
            localVideo.currentTime = vidStart;

            // ตรวจสอบเวลาเพื่อสั่งหยุด (Freeze)
            localVideo.ontimeupdate = function () {
                if (localVideo.currentTime >= vidEnd) {
                    localVideo.pause(); // ⏹️ หยุดวิดีโอ (ภาพจะค้างอยู่ท่านั้น)
                    // localVideo.currentTime = vidEnd; // (เผื่ออยากล็อกเวลาให้นิ่งสนิทจริงๆ)

                    // ยกเลิกการจับเวลา (เพื่อไม่ให้กินเครื่อง)
                    localVideo.ontimeupdate = null;
                }
            };

            // สั่งเล่นแบบดีเลย์ 3 วิ
            setTimeout(() => {
                localVideo.play().catch(e => console.log("Video Error:", e));
            }, 0);
        }

        switchScene(sceneCover, sceneCake);
        startMicrophone();
    }
    // ==========================================
    // 2️⃣ CAKE & CANDLE (เป่าเทียน)
    // ==========================================
    const flame = document.getElementById('flame');
    const candleContainer = document.querySelector('.cake-container');
    let isCandleOut = false;

    function blowOutCandle() {
        if (isCandleOut) return;
        isCandleOut = true;
        if (flame) flame.classList.add('out');

        // ===========================================
        // 🛑 STOP EVERYTHING (สั่งหยุดทุกอย่างทันที)
        // ===========================================

        // 1. สั่งหยุดเพลง YouTube (ถ้ามี)
        if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
        }

        // 2. สั่งหยุด Local Video Background (ถ้ามี)
        const localVideo = document.getElementById('my-local-video');
        if (localVideo) {
            localVideo.pause();
        }

        // 3. (แถม) หยุดตัวจับเวลาวิดีโอ เพื่อไม่ให้มันพยายามเล่นต่อ
        if (localVideo && localVideo.ontimeupdate) {
            localVideo.ontimeupdate = null;
        }

        // ===========================================

        // เป่าดับแล้ว รอ 2 วิ -> ไปหน้าของขวัญ
        setTimeout(() => {
            switchScene(sceneCake, sceneGift);
            const enterSound = document.getElementById('gift-enter-sound');
            if (enterSound) {
                enterSound.volume = 0.6; // ปรับความดังตามชอบ
                enterSound.currentTime = 0;
                enterSound.play().catch(e => console.log("Audio Error:", e));
            }
        }, 1500);
    }

    // ระบบไมโครโฟน
    async function startMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            function detectBlow() {
                if (isCandleOut) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                let average = sum / dataArray.length;

                if (average > 90) { // ปรับความไวตรงนี้
                    blowOutCandle();
                }
                requestAnimationFrame(detectBlow);
            }
            detectBlow();
        } catch (err) {
            console.log('Mic denied/error:', err);
        }
    }

    // Fallback: แตะที่เค้กก็ดับได้
    if (candleContainer) candleContainer.addEventListener('click', blowOutCandle);

    // ==========================================
    // 3️⃣ GIFT BOX (กล่องของขวัญ + Confetti)
    // ==========================================
    const giftTrigger = document.getElementById('gift-box-trigger');

    if (giftTrigger) {
        giftTrigger.addEventListener('click', function () {

            // 👇 1. จัดการเสียง Effect แบบกำหนดช่วงเวลา
            const giftSound = document.getElementById('gift-sound');

            // ⚙️ ตั้งค่าตรงนี้ (วินาที)
            const soundStart = 4;   // เริ่มวินาทีที่...
            const soundEnd = 5;   // ให้หยุดที่วินาทีที่...

            if (giftSound) {
                giftSound.volume = 0.7;
                giftSound.currentTime = soundStart; // กระโดดไปจุดเริ่ม
                giftSound.play().catch(e => console.log("Sound Error:", e));

                // สร้างตัวคอยเช็คเวลาเพื่อสั่งหยุด
                giftSound.ontimeupdate = function () {
                    if (giftSound.currentTime >= soundEnd) {
                        giftSound.pause();             // หยุดเสียง
                        giftSound.ontimeupdate = null; // เลิกเช็ค (เพื่อไม่ให้กินเครื่อง)
                    }
                };
            }

            this.classList.add('open');

            // ซ่อนคำแนะนำ
            const instruction = document.querySelector('#scene-gift .instruction');
            if (instruction) instruction.style.opacity = 0;

            // ระเบิด Confetti + Bubble Message
            setTimeout(() => {
                const msg = document.getElementById('gift-message');
                if (msg) msg.classList.add('show');

                confetti({
                    particleCount: 150, spread: 100, origin: { y: 0.6 },
                    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
                    disableForReducedMotion: true
                });
            }, 300);

            // รอ 4-5 วินาที -> ไปหน้าหนังสือ
            setTimeout(() => {
                switchScene(sceneGift, sceneBook);

                // ===============================================
                // 🛑 1. สั่งหยุดเสียงหน้าของขวัญ (เพิ่มตรงนี้ครับ)
                // ===============================================

                // หยุดเสียงวิ้งๆ ตอนเข้าหน้า (Magic Chime)
                const enterSound = document.getElementById('gift-enter-sound');
                if (enterSound) {
                    enterSound.pause();      // หยุดเล่น
                    enterSound.currentTime = 0; // รีเซ็ตเวลากลับไปที่ 0
                }

                // (แถม) หยุดเสียงเปิดกล่อง (Pop/Tada) เผื่อไฟล์เสียงมันยาวเกิน
                const giftSound = document.getElementById('gift-sound');
                if (giftSound) {
                    giftSound.pause();
                    giftSound.currentTime = 0;
                    // ล้าง event ตรวจจับเวลา (ถ้ามี)
                    giftSound.ontimeupdate = null;
                }

                // ===============================================

                // 👇 สั่งให้หน้าหนังสือรีเซ็ต (เผื่อจอดำ)
                if (typeof updateSlider === 'function') {
                    currentPage = 0;
                    updateSlider();
                }

                // 🎵 2. สั่งเล่นเพลง BGM หนังสือ (เล่นต่อตามปกติ)
                const bookBgm = document.getElementById('book-bgm');
                if (bookBgm) {
                    bookBgm.volume = 0.5;
                    bookBgm.currentTime = 0; // เริ่มเพลงใหม่ตั้งแต่ต้น
                    bookBgm.play().catch(e => console.log("Audio Play Error:", e));
                }
            }, 5000);
        });
    }

    // ==========================================
    // 4️⃣ MEMORY BOOK (SLIDER VERSION)
    // ==========================================
    const pages = document.querySelectorAll('.book-page');
    const btnNext = document.getElementById('btn-next-page');
    const btnPrev = document.getElementById('btn-prev-page');
    const pageCounter = document.getElementById('page-counter');

    const btnGoCredit = document.getElementById('btn-go-credit');
    const sceneCredit = document.getElementById('scene-credit');
    const btnCreditBack = document.getElementById('btn-credit-back');
    const btnCreditHome = document.getElementById('btn-credit-home');

    let currentPage = 0;
    const totalPages = pages.length;

    // ==========================================
    // ⏯️ AUTO PLAY SYSTEM (PING-PONG LOOP)
    // ==========================================
    const chkAutoPlay = document.getElementById('chk-autoplay');
    let autoPlayInterval = null;
    let isForward = true; // ตัวบอกทิศทาง: true=เดินหน้า, false=ถอยหลัง

    // ฟังก์ชันเริ่ม/หยุด (เรียกจาก Checkbox)
    function toggleAutoPlay() {
        if (chkAutoPlay.checked) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
    }

    function startAutoPlay() {
        // เคลียร์ของเก่าก่อนเสมอ กันมันทำงานซ้อนกัน
        stopAutoPlay();

        // เริ่มตั้งเวลาใหม่ (3 วินาที)
        autoPlayInterval = setInterval(() => {

            if (isForward) {
                // ➡️ ขาไป: เดินหน้า
                if (currentPage < totalPages - 1) {
                    nextPage();
                } else {
                    // สุดทางแล้ว -> กลับหลังหัน
                    isForward = false;
                    prevPage();
                }
            } else {
                // ⬅️ ขากลับ: ถอยหลัง
                if (currentPage > 0) {
                    prevPage();
                } else {
                    // ถึงหน้าแรกแล้ว -> กลับหลังหัน
                    isForward = true;
                    nextPage();
                }
            }

        }, 6000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // Event Listener ของปุ่ม
    if (chkAutoPlay) {
        chkAutoPlay.addEventListener('change', toggleAutoPlay);
    }

    // ==========================================
    // 🔄 อัปเดตฟังก์ชัน updateSlider (แก้ของเดิม)
    // ==========================================
    function updateSlider() {
        pages.forEach((page, index) => {
            page.classList.remove('active-slide', 'prev-slide');
            if (index === currentPage) page.classList.add('active-slide');
            else if (index < currentPage) page.classList.add('prev-slide');
        });

        if (pageCounter) pageCounter.textContent = `${currentPage + 1} / ${totalPages}`;

        // จัดการปุ่มลูกศร
        if (btnPrev) btnPrev.style.display = currentPage === 0 ? 'none' : 'flex';
        // ซ่อนปุ่ม Next ถ้าอยู่หน้าสุดท้าย (เพราะเราจะโชว์ปุ่ม Credit แทน)
        if (btnNext) btnNext.style.display = currentPage === totalPages - 1 ? 'none' : 'flex';

        // ⭐ ไฮไลท์: โชว์ปุ่ม Credit เฉพาะหน้าสุดท้าย
        if (btnGoCredit) {
            if (currentPage === totalPages - 1) {
                btnGoCredit.style.display = 'block'; // โผล่มา
            } else {
                btnGoCredit.style.display = 'none';  // ซ่อนไป
            }
        }
    }

    // ฟังก์ชันเปลี่ยนหน้า
    function nextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            updateSlider();
        }
    }

    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            updateSlider();
        }
    }

    // ==========================================
    // ✨ จัดการปุ่ม Credit
    // ==========================================

    // 1. กดปุ่ม See Credits -> เปิดหน้า Credit
    if (btnGoCredit) {
        btnGoCredit.addEventListener('click', () => {
            if (sceneCredit) sceneCredit.classList.add('active');
        });
    }

    // 2. กดปุ่ม Back -> ปิดหน้า Credit (กลับมาหน้าเดิม)
    if (btnCreditBack) {
        btnCreditBack.addEventListener('click', () => {
            if (sceneCredit) sceneCredit.classList.remove('active');
        });
    }

    // 3. กดปุ่ม Home -> รีเซ็ตเว็บใหม่ (Reload)
    if (btnCreditHome) {
        btnCreditHome.addEventListener('click', () => {
            window.location.reload(); // รีเฟรชหน้าจอ เริ่มใหม่หมด
        });
    }

    // เริ่มต้นทำงานครั้งแรก
    updateSlider();

    // --- ผูกปุ่มกด ---
    if (btnNext) btnNext.addEventListener('click', nextPage);
    if (btnPrev) btnPrev.addEventListener('click', prevPage);

    // --- ระบบปัดหน้าจอ (Touch Swipe) ---
    const bookArea = document.querySelector('.book-container');
    if (bookArea) {
        let startX = 0;
        let isDragging = false;

        bookArea.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        bookArea.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            // ถ้าลากไปทางซ้ายเกิน 50px (แปลว่าอยากไปหน้าถัดไป)
            if (diff > 50) {
                nextPage();
            }
            // ถ้าลากไปทางขวาเกิน 50px (แปลว่าอยากย้อนกลับ)
            else if (diff < -50) {
                prevPage();
            }
        }, { passive: true });
    }

    // ==========================================
    // 5️⃣ NAVIGATION & GRID (เมนูเลือกหน้า - แบบ Slider)
    // ==========================================
    const btnReset = document.getElementById('btn-reset');
    const btnGrid = document.getElementById('btn-grid');
    const gridOverlay = document.getElementById('grid-overlay');
    const btnCloseGrid = document.getElementById('btn-close-grid');
    const gridContent = document.getElementById('grid-content');

    // Home Button -> Hard Reset (Refresh Page)
    if (btnReset) {
        btnReset.addEventListener('click', () => window.location.reload());
    }

    // ฟังก์ชันกระโดดไปหน้าที่เลือก
    function goToPage(index) {
        currentPage = index;    // 1. ตั้งค่าหน้าปัจจุบันเป็นหน้าที่กด
        updateSlider();         // 2. สั่งให้ Slider จัดตำแหน่งใหม่ (สำคัญ!)
        gridOverlay.classList.remove('show'); // 3. ปิดหน้าต่าง Grid
    }

    // เมื่อกดปุ่มเปิดเมนู Grid
    if (btnGrid) {
        btnGrid.addEventListener('click', () => {
            gridContent.innerHTML = ''; // ล้างปุ่มเก่าก่อนสร้างใหม่

            pages.forEach((page, index) => {
                // สร้างปุ่มกด
                const btn = document.createElement('button');
                // เพิ่ม class .grid-item หรือจะใส่ style inline ก็ได้ถ้ายังไม่ได้เขียน CSS
                btn.className = 'grid-item btn btn-light shadow-sm';

                // ตกแต่งปุ่มเพิ่ม (Optional: ถ้าอยากให้สวยเลยโดยไม่ต้องแก้ CSS)
                btn.style.display = 'flex';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.height = '100px'; // กำหนดความสูงปุ่ม
                btn.style.border = 'none';
                btn.style.borderRadius = '10px';

                // ดึงชื่อคนอวยพรมาแสดง
                let senderName = "Unknown";
                const senderDiv = page.querySelector('.wish-sender');
                if (senderDiv) senderName = senderDiv.innerText.replace(/By\s*:/i, '').trim();

                // ใส่เนื้อหาปุ่ม (เลขหน้า + ชื่อคน)
                btn.innerHTML = `
                    <span style="font-size: 1.5rem; font-weight: bold; color: #ff6b6b;">${index + 1}</span>
                    <span style="font-size: 0.85rem; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${senderName}</span>
                `;

                // ถ้าเป็นหน้าปัจจุบัน ให้ใส่กรอบสีแดง
                if (index === currentPage) {
                    btn.style.border = '2px solid #ff6b6b';
                    btn.style.background = '#fff0f0';
                }

                // *** จุดสำคัญ: เมื่อกดปุ่ม ให้กระโดดไปหน้านั้น ***
                btn.onclick = () => goToPage(index);

                // ยัดปุ่มลงกล่อง
                gridContent.appendChild(btn);
            });

            // แสดงหน้าต่าง Grid
            gridOverlay.classList.add('show');
        });
    }

    // ปุ่มปิด Grid (กากบาท)
    if (btnCloseGrid) {
        btnCloseGrid.addEventListener('click', () => gridOverlay.classList.remove('show'));
    }

});