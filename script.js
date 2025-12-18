// ==========================================
// 🎵 YOUTUBE SYSTEM (แยกหน้าเปิด vs หน้าเค้ก)
// ==========================================

// ID เพลงของแต่ละหน้า
const coverSongID = 'vx5vpG6jEXI'; // เพลง HBD หน้าเปิด
const cakeSongID = 'qVVZf_T5ghY';  // เพลงเป่าเค้ก หน้าถัดไป

let coverPlayer; // ตัวเล่นหน้าเปิด
let cakePlayer;  // ตัวเล่นหน้าเค้ก
let isCakeReady = false;
let loopTimer = null;

// โหลด API (เหมือนเดิม)
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// ฟังก์ชันเริ่มทำงานเมื่อ API พร้อม
function onYouTubeIframeAPIReady() {
    
    // ------------------------------------------------
    // 1️⃣ สร้างตัวเล่นสำหรับ "หน้าเปิด" (Cover)
    // ------------------------------------------------
    coverPlayer = new YT.Player('cover-video', {
        height: '100%', width: '100%',
        videoId: coverSongID,
        playerVars: {
            'playsinline': 1, 'controls': 0, 'disablekb': 1, 
            'loop': 1, 'playlist': coverSongID // วนลูป
        },
        events: {
            'onReady': (e) => {
                // พยายามเล่นแบบเงียบไปก่อน (เพื่อให้ภาพมา)
                e.target.mute();
                e.target.playVideo();
            }
        }
    });

    // ------------------------------------------------
    // 2️⃣ สร้างตัวเล่นสำหรับ "หน้าเค้ก" (Cake) รอไว้ก่อน
    // ------------------------------------------------
    cakePlayer = new YT.Player('youtube-player-container', {
        height: '1', width: '1',
        videoId: cakeSongID,
        playerVars: { 
            'playsinline': 1, 'controls': 0, 'start': 6, 'autoplay': 0
        },
        events: {
            'onReady': (e) => { 
                isCakeReady = true; 
                e.target.setVolume(100); 
            },
        }
    });
}

// ระบบวนลูป (เฉพาะหน้าเค้ก)
function startCakeLoop() {
    stopCakeLoop();
    loopTimer = setInterval(() => {
        if (!cakePlayer || !cakePlayer.getCurrentTime) return;
        if (cakePlayer.getCurrentTime() >= 46) cakePlayer.seekTo(6);
    }, 500);
}
function stopCakeLoop() { clearInterval(loopTimer); }


// ==========================================
// 👇 ส่วนสำคัญ: แตะหน้าจอ เพื่อเปิดเสียง "หน้าเปิด"
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    function unlockCoverAudio() {
        // สั่งให้ตัวเล่น "หน้าเปิด" ดังขึ้น
        if (coverPlayer && typeof coverPlayer.unMute === 'function') {
            coverPlayer.unMute();       // เปิดเสียง
            coverPlayer.setVolume(100); // เร่งสุด
            coverPlayer.playVideo();    // เล่น
            console.log("Cover Music Started!");
        }
        
        // ลบ Event ทิ้ง (ทำแค่ครั้งเดียวพอ)
        document.body.removeEventListener('click', unlockCoverAudio);
        document.body.removeEventListener('touchstart', unlockCoverAudio);
    }

    // รอรับการแตะที่หน้าเปิด
    document.body.addEventListener('click', unlockCoverAudio);
    document.body.addEventListener('touchstart', unlockCoverAudio);
});

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
        console.log("🚀 Starting Surprise...");

        // ============================================
        // 🛑 1. สั่งหยุดหน้า Cover (แบบเด็ดขาด!)
        // ============================================

        // 1.1 ลองสั่งหยุดด้วย API ดีๆ ก่อน
        if (typeof coverPlayer !== 'undefined' && coverPlayer && typeof coverPlayer.pauseVideo === 'function') {
            coverPlayer.pauseVideo();
        }

        // 1.2 ⚠️ ไม้ตาย: ซ่อนกล่องวิดีโอทิ้งไปเลย (เพื่อให้เสียงดับชัวร์ๆ)
        const coverContainer = document.getElementById('cover-video'); 
        // หรือถ้าใน HTML มี class video-container หุ้มอยู่ ให้ซ่อนตัวแม่มันด้วย
        const videoWrapper = document.querySelector('#scene-cover .video-container');
        
        if (coverContainer) {
            coverContainer.style.display = 'none'; // ซ่อนทันที
        }
        if (videoWrapper) {
            videoWrapper.style.display = 'none'; // ซ่อนกล่องที่หุ้มอยู่ด้วย
        }

        // 1.3 หยุดเสียง intro เดิม (ถ้ามี)
        if (typeof introSong !== 'undefined' && introSong) introSong.pause();

        // ============================================
        // ▶️ 2. สั่งเล่นเพลงหน้าเค้ก (Cake Player)
        // ============================================
        if (typeof cakePlayer !== 'undefined' && cakePlayer && typeof cakePlayer.playVideo === 'function') {
            cakePlayer.playVideo();
        }

        // ============================================
        // 🎥 3. วิดีโอพื้นหลัง Minion (ส่วนนี้ของเดิม ดีอยู่แล้วครับ)
        // ============================================
        const localVideo = document.getElementById('my-local-video');
        const vidStart = 0;
        const vidEnd = 42; 

        if (localVideo) {
            localVideo.muted = true;
            localVideo.loop = false;
            localVideo.currentTime = vidStart;

            localVideo.ontimeupdate = function () {
                if (localVideo.currentTime >= vidEnd) {
                    localVideo.pause();
                    localVideo.ontimeupdate = null;
                }
            };

            setTimeout(() => {
                localVideo.play().catch(e => console.log("Video Error:", e));
            }, 0);
        }

        // เปลี่ยนฉาก
        switchScene(sceneCover, sceneCake);
        startMicrophone();
    }
    // ==========================================
    // 2️⃣ CAKE & CANDLE (เป่าเทียน - แก้ไขแล้ว)
    // ==========================================
    const flame = document.getElementById('flame');
    const candleContainer = document.querySelector('.cake-container');
    let isCandleOut = false;

    function blowOutCandle() {
        if (isCandleOut) return;
        isCandleOut = true;
        
        // 1. ทำให้เทียนดับ
        if (flame) flame.classList.add('out');
        console.log("🔥 Candle blown out!");

        // ===========================================
        // 🛑 STOP EVERYTHING (สั่งหยุดเพลงและวิดีโอ)
        // ===========================================

        // 🟢 แก้จุดที่ 1: เปลี่ยนจาก player เป็น cakePlayer
        if (typeof cakePlayer !== 'undefined' && cakePlayer && typeof cakePlayer.pauseVideo === 'function') {
            cakePlayer.pauseVideo();
        }

        // 2. สั่งหยุด Local Video Background (Minion)
        const localVideo = document.getElementById('my-local-video');
        if (localVideo) {
            localVideo.pause();
            localVideo.ontimeupdate = null; // เลิกจับเวลา
        }

        // ===========================================

        // 3. เป่าดับแล้ว รอ 1.5 วินาที -> ไปหน้าของขวัญ
        setTimeout(() => {
            console.log("🎁 Going to Gift Scene...");
            
            // เรียกฟังก์ชันเปลี่ยนหน้า (switchScene)
            // เช็คความชัวร์ว่าตัวแปร sceneCake/sceneGift มีค่าไหม
            if (sceneCake && sceneGift) {
                switchScene(sceneCake, sceneGift);
            } else {
                // ถ้าหาตัวแปรไม่เจอ ให้สั่งผ่าน ID โดยตรง (กันเหนียว)
                document.getElementById('scene-cake').classList.remove('active');
                document.getElementById('scene-gift').classList.add('active');
            }

            // เล่นเสียง Effect เข้าหน้าของขวัญ
            const enterSound = document.getElementById('gift-enter-sound');
            if (enterSound) {
                enterSound.volume = 0.6; 
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

                if (average > 30) { // ปรับความไวตรงนี้
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