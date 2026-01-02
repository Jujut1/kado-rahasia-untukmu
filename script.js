// ===== KONFIGURASI KADO =====
const KADO_CONFIG = {
    pengirim: "Teman-teman",  // GANTI NAMA PENGIRIM DI SINI
    
    pesanTemplate: `Selamat ulang tahun! 🎉

Di hari spesialmu ini, semoga semua kebahagiaan dunia menyertaimu. Teruslah bersinar dan menjadi versi terbaik dari dirimu sendiri.

Semoga di usia yang baru ini:
• Kesehatan selalu menyertaimu
• Rezeki berlimpah melimpah
• Cita-cita segera tercapai
• Kebahagiaan tak pernah berakhir

Selamat merayakan hari spesialmu! 🎂✨`,
    
    kataGame: [
        { kata: "KADO", hint: "Hadiah ulang tahun" },
        { kata: "BAIK", hint: "Sifat yang baik" },
        { kata: "HARI", hint: "Satuan waktu" },
        { kata: "CAHA", hint: "Sumber terang" },
        { kata: "CINTA", hint: "Perasaan mendalam" },
        { kata: "SENYUM", hint: "Ekspresi bahagia" },
        { kata: "DOA", hint: "Harapan untuk seseorang" },
        { kata: "BAHAGIA", hint: "Perasaan senang" }
    ]
};

// ===== VARIABEL GLOBAL =====
let namaPenerima = "";
let namaPengirim = KADO_CONFIG.pengirim;
let gameData = {
    currentWord: "",
    hint: "",
    guessedLetters: [],
    wrongLetters: [],
    lives: 5,
    score: 0,
    isGameComplete: false
};

let isMusicPlaying = false;
let bgMusic = null;

// ===== INISIALISASI =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    initAudio();
    setupEventListeners();
    updateCreatorName();
    console.log('🎁 Kado Digital Siap!');
}

function initAudio() {
    bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.5;
    
    // Auto play setelah interaksi user
    document.addEventListener('click', function initAudioOnce() {
        playBackgroundMusic();
        document.removeEventListener('click', initAudioOnce);
    }, { once: true });
}

function updateCreatorName() {
    document.getElementById('creatorName').textContent = namaPengirim;
}

function setupEventListeners() {
    // Tombol mulai
    document.getElementById('startButton').addEventListener('click', startJourney);
    
    // Input nama
    document.getElementById('userNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') startJourney();
    });
    
    // Tombol huruf game
    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const letter = this.dataset.letter;
            guessLetter(letter);
        });
    });
    
    // Tombol game
    document.getElementById('newWordBtn').addEventListener('click', newWord);
    document.getElementById('skipGameBtn').addEventListener('click', skipGame);
    
    // Amplop
    document.getElementById('simpleEnvelope').addEventListener('click', openEnvelope);
    
    // Tombol music
    document.getElementById('musicBtn').addEventListener('click', toggleMusic);
    
    // Tombol aksi
    document.getElementById('shareButton')?.addEventListener('click', shareGift);
    document.getElementById('replayButton')?.addEventListener('click', replayGame);
    
    // Settings modal
    document.querySelector('.close-modal')?.addEventListener('click', closeSettings);
    document.getElementById('cancelSettings')?.addEventListener('click', closeSettings);
    document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
    
    // Volume slider
    document.getElementById('volumeSlider')?.addEventListener('input', function() {
        if (bgMusic) {
            bgMusic.volume = this.value / 100;
        }
    });
}

// ===== FUNGSI UTAMA =====
function startJourney() {
    const nameInput = document.getElementById('userNameInput');
    const inputNama = nameInput.value.trim();
    
    if (!inputNama) {
        alert("Masukkan nama kamu dulu ya!");
        nameInput.focus();
        return;
    }
    
    // SIMPAN NAMA PENERIMA
    namaPenerima = formatNama(inputNama);
    
    // Update display
    document.getElementById('playerNameDisplay').textContent = namaPenerima;
    
    // Start game
    startNewGame();
    
    // Pindah halaman
    switchPage('game-page');
    
    // Play music
    playBackgroundMusic();
}

function formatNama(nama) {
    return nama.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function startNewGame() {
    // Pilih kata random
    const randomWord = KADO_CONFIG.kataGame[Math.floor(Math.random() * KADO_CONFIG.kataGame.length)];
    gameData.currentWord = randomWord.kata.toUpperCase();
    gameData.hint = randomWord.hint;
    gameData.guessedLetters = [];
    gameData.wrongLetters = [];
    gameData.lives = 5;
    gameData.isGameComplete = false;
    
    // Update UI
    updateGameUI();
    resetLetterButtons();
    
    console.log(`🎮 Kata rahasia: ${gameData.currentWord}`);
}

function updateGameUI() {
    // Update word display
    const slots = document.querySelectorAll('.slot');
    const wordArray = gameData.currentWord.split('');
    
    slots.forEach((slot, index) => {
        if (index < wordArray.length) {
            const letter = wordArray[index];
            slot.textContent = gameData.guessedLetters.includes(letter) ? letter : '_';
            slot.classList.toggle('filled', gameData.guessedLetters.includes(letter));
        } else {
            slot.style.display = 'none';
        }
    });
    
    // Show only needed slots
    for (let i = 0; i < 5; i++) {
        document.querySelectorAll('.slot')[i].style.display = i < wordArray.length ? 'flex' : 'none';
    }
    
    // Update hint
    document.getElementById('hintText').textContent = gameData.hint;
    
    // Update stats
    document.getElementById('livesCounter').textContent = gameData.lives;
    document.getElementById('scoreDisplay').textContent = gameData.score;
    
    // Check win/lose
    checkGameStatus();
}

function guessLetter(letter) {
    if (gameData.isGameComplete) return;
    
    const btn = document.querySelector(`.letter-btn[data-letter="${letter}"]`);
    if (btn.disabled) return;
    
    btn.disabled = true;
    
    if (gameData.currentWord.includes(letter)) {
        // Correct guess
        if (!gameData.guessedLetters.includes(letter)) {
            gameData.guessedLetters.push(letter);
            btn.classList.add('correct');
            gameData.score += 10;
            
            updateFeedback(`✅ Benar! Huruf "${letter}" ada dalam kata`, 'success');
            
            // Play correct sound
            playSound('correct');
        }
    } else {
        // Wrong guess
        if (!gameData.wrongLetters.includes(letter)) {
            gameData.wrongLetters.push(letter);
            gameData.lives--;
            btn.classList.add('wrong');
            
            updateFeedback(`❌ Salah! Huruf "${letter}" tidak ada`, 'error');
            
            // Play wrong sound
            playSound('wrong');
        }
    }
    
    updateGameUI();
}

function checkGameStatus() {
    // Check win
    const wordGuessed = gameData.currentWord.split('').every(letter => 
        gameData.guessedLetters.includes(letter)
    );
    
    if (wordGuessed) {
        gameData.isGameComplete = true;
        gameData.score += 50;
        
        updateFeedback(`🎉 HORE! Kamu menebak kata "${gameData.currentWord}"!`, 'success');
        
        setTimeout(() => {
            document.getElementById('winnerName').textContent = namaPenerima;
            switchPage('envelope-page');
        }, 1500);
        
        return;
    }
    
    // Check lose
    if (gameData.lives <= 0) {
        gameData.isGameComplete = true;
        
        updateFeedback(`😢 Habis nyawa! Kata yang benar: "${gameData.currentWord}"`, 'error');
        
        setTimeout(() => {
            document.getElementById('winnerName').textContent = namaPenerima;
            switchPage('envelope-page');
        }, 2000);
    }
}

function newWord() {
    startNewGame();
    updateFeedback('🎮 Kata baru telah dipilih!', 'info');
}

function skipGame() {
    if (confirm("Yakin ingin melewati game?")) {
        gameData.isGameComplete = true;
        document.getElementById('winnerName').textContent = namaPenerima;
        switchPage('envelope-page');
    }
}

function openEnvelope() {
    const envelope = document.getElementById('simpleEnvelope');
    envelope.classList.add('open');
    
    setTimeout(() => {
        loadGiftPage();
        switchPage('gift-page');
    }, 1000);
}

function loadGiftPage() {
    // Update nama penerima dan pengirim
    document.getElementById('recipientName').textContent = namaPenerima;
    document.getElementById('senderName').textContent = namaPengirim;
    document.getElementById('giftRecipientName').textContent = namaPenerima;
    document.getElementById('giftSenderName').textContent = namaPengirim;
    
    // Generate pesan personal
    const pesanPersonal = KADO_CONFIG.pesanTemplate;
    document.getElementById('messageContent').innerHTML = pesanPersonal.replace(/\n/g, '<br>');
    
    // Update tanggal
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);
    
    // Create confetti
    createConfetti();
}

// ===== FUNGSI BANTUAN =====
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateFeedback(message, type = 'info') {
    const feedbackBox = document.getElementById('feedbackBox');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };
    
    feedbackBox.innerHTML = `
        <i class="${icons[type] || 'fas fa-info-circle'}"></i>
        <span class="feedback-text">${message}</span>
    `;
    
    feedbackBox.style.background = type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 
                                 type === 'error' ? 'rgba(255, 71, 87, 0.1)' : 
                                 'rgba(0, 210, 255, 0.1)';
}

function resetLetterButtons() {
    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
}

// ===== AUDIO FUNCTIONS =====
function playBackgroundMusic() {
    if (bgMusic && !isMusicPlaying) {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            updateMusicButton(true);
        }).catch(e => {
            console.log('Autoplay diblokir, butuh interaksi user');
        });
    }
}

function playSound(type) {
    const audio = new Audio();
    
    if (type === 'correct') {
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3';
    } else if (type === 'wrong') {
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3';
    }
    
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Sound effect skipped'));
}

function toggleMusic() {
    if (!bgMusic) return;
    
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
    } else {
        bgMusic.play();
        isMusicPlaying = true;
    }
    
    updateMusicButton(isMusicPlaying);
}

function updateMusicButton(playing) {
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.innerHTML = playing ? 
            '<i class="fas fa-volume-up"></i><span class="music-text">Musik</span>' :
            '<i class="fas fa-volume-mute"></i><span class="music-text">Musik</span>';
    }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const container = document.querySelector('.confetti-overlay');
    if (!container) return;
    
    container.innerHTML = '';
    const colors = ['#FF6B8B', '#FF8E53', '#00D2FF', '#FFD700', '#00FF88', '#9B59B6'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 12 + 8}px;
            height: ${Math.random() * 12 + 8}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -50px;
            left: ${Math.random() * 100}%;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            opacity: 0.9;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        container.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentElement) confetti.remove();
        }, 5000);
    }
}

// ===== SETTINGS FUNCTIONS =====
function openSettings() {
    document.getElementById('setSenderName').value = namaPengirim;
    document.getElementById('setMessage').value = KADO_CONFIG.pesanTemplate;
    document.getElementById('volumeSlider').value = bgMusic ? bgMusic.volume * 100 : 50;
    
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function saveSettings() {
    const newSender = document.getElementById('setSenderName').value.trim();
    const newMessage = document.getElementById('setMessage').value.trim();
    const newVolume = document.getElementById('volumeSlider').value;
    
    if (newSender) {
        namaPengirim = newSender;
        updateCreatorName();
    }
    
    if (newMessage) {
        KADO_CONFIG.pesanTemplate = newMessage;
    }
    
    if (bgMusic) {
        bgMusic.volume = newVolume / 100;
    }
    
    // Save to localStorage
    localStorage.setItem('kadoSettings', JSON.stringify({
        sender: namaPengirim,
        message: KADO_CONFIG.pesanTemplate,
        volume: newVolume
    }));
    
    closeSettings();
    alert('✅ Pengaturan disimpan!');
}

// ===== ACTION FUNCTIONS =====
function shareGift() {
    const shareText = `Lihat kado digital spesial dari ${namaPengirim} untuk ${namaPenerima}! 🎁`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Kado Digital Ulang Tahun',
            text: shareText,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('📋 Tautan berhasil disalin!\nBagikan ke: ' + shareUrl);
        }).catch(() => {
            prompt('Salin tautan berikut:', shareUrl);
        });
    }
}

function replayGame() {
    // Reset semua
    document.getElementById('simpleEnvelope').classList.remove('open');
    document.getElementById('userNameInput').value = namaPenerima;
    switchPage('intro-page');
}

// ===== LOAD SAVED SETTINGS =====
function loadSavedSettings() {
    const saved = localStorage.getItem('kadoSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            namaPengirim = settings.sender || namaPengirim;
            KADO_CONFIG.pesanTemplate = settings.message || KADO_CONFIG.pesanTemplate;
            
            if (settings.volume && bgMusic) {
                bgMusic.volume = settings.volume / 100;
            }
        } catch (e) {
            console.log('Error loading settings:', e);
        }
    }
}

// Panggil load settings setelah audio ready
setTimeout(loadSavedSettings, 1000);