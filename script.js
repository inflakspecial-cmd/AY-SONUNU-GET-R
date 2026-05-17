// OYUN DURUM DEĞİŞKENLERI
let money = 28075; 
let day = 1;
let phaseIndex = 0; 
const phases = [
    { name: "🌅 Sabah", class: "phase-morning" },
    { name: "☀️ Öğle", class: "phase-afternoon" },
    { name: "🌙 Akşam", class: "phase-evening" }
];

let currentJob = { name: "Çaylak", salary: 28075 };
let ownedBusinesses = { pilav: false, eticaret: false, yazilim: false };

let happiness = 100;
let jobPerformance = 50;
let relSpouse = 50;
let relParents = 50;
let relFriend = 50;

let currentCard = null;
let usedCards = [];

// GENİŞLETİLMİŞ RPG KART DESTE VERİTABANI
const cardDeck = [
    {
        id: 1, phase: 0, category: "🏢 İŞ YERİ", sender: "Patron", icon: "👔", title: "Erken Toplantı",
        text: "Patron sabah 7.30'a acil toplantı koydu. Taksiyle gidersen yetişirsin ama akbil basarsan geç kalırsın.",
        acceptText: "Taksiye bin (-500 TL) / İş +15", rejectText: "Metrobüse bin (-40 TL) / İş -20",
        action: () => { modifyMoney(-500); jobPerformance += 15; spawnFloatingText("-500 TL", "red"); },
        rejectAction: () => { modifyMoney(-40); jobPerformance -= 20; spawnFloatingText("-40 TL", "red"); }
    },
    {
        id: 2, phase: 0, category: "🚌 METROBÜS", sender: "Yolcu", icon: "😡", title: "Yer Kavgası",
        text: "Metrobüste bir dayı haksız yere sana bağırıp yer istiyor. Alttan mı alacaksın yoksa kavga mı edeceksiniz?",
        acceptText: "Alttan al / Mutluluk -15", rejectText: "Kavga et / Mutluluk -5 / İş -10",
        action: () => { happiness -= 15; spawnFloatingText("-15 Mutluluk", "red"); },
        rejectAction: () => { happiness -= 5; jobPerformance -= 10; spawnFloatingText("-10 İş", "red"); }
    },
    {
        id: 3, phase: 0, category: "🏢 İŞ YERİ", sender: "Şef Mühendis", icon: "☕", title: "Kahve Ismarlama",
        text: "Ofise girerken ekiple karşılaştın. Hepsine kahve ısmarlayıp gözlerine girmek ister misin?",
        acceptText: "Kahveler benden (-600 TL) / İş +20", rejectText: "Görmezden gel / İş -10",
        action: () => { modifyMoney(-600); jobPerformance += 20; spawnFloatingText("-600 TL", "red"); },
        rejectAction: () => { jobPerformance -= 10; }
    },
    {
        id: 4, phase: 1, category: "🤝 SOSYAL", sender: "Kankan", icon: "⚽", title: "Halı Saha Krizi",
        text: "\"Kanka acil akşam halı sahaya adam lazım. Gelmezsen gruptan atacağız.\"",
        acceptText: "Maça git (-350 TL) / Kanka +25 / Eş -15",
        rejectText: "Gidemem / Kanka -20",
        action: () => { modifyMoney(-350); relFriend += 25; relSpouse -= 15; },
        rejectAction: () => { relFriend -= 20; }
    },
    {
        id: 5, phase: 1, category: "💰 FİNANS", sender: "Banka", icon: "💳", title: "Kredi Kartı Asgarisi",
        text: "Kredi kartı borcunun son ödeme günü geldi çattı.",
        acceptText: "Hepsini Öde (-6000 TL) / Mutluluk +10", rejectText: "Asgari Öde (-1500 TL) / Stres -15",
        action: () => { modifyMoney(-6000); happiness += 10; },
        rejectAction: () => { modifyMoney(-1500); happiness -= 15; }
    },
    {
        id: 6, phase: 1, category: "🧓 AİLE", sender: "Annen", icon: "📞", title: "Hayırlı Evlat",
        text: "\"Oğlum faturayı ödeyemedik. Yardım edebilir misin?\"",
        acceptText: "Faturayı üstlen (-2000 TL) / Aile +30", rejectText: "Durumum yok de / Aile -25",
        action: () => { modifyMoney(-2000); relParents += 30; },
        rejectAction: () => { relParents -= 25; }
    },
    {
        id: 7, phase: 2, category: "👩‍❤️‍👨 EVLİLİK", sender: "Eşin", icon: "❤️", title: "Yıl Dönümü Sürprizi",
        text: "\"Aşkım bu akşam evlilik yıl dönümümüz. Lüks bir akşam yemeği?\"",
        acceptText: "Elbette canım (-4000 TL) / Eş +35", rejectText: "Evde makarna? / Eş -40",
        action: () => { modifyMoney(-4000); relSpouse += 35; },
        rejectAction: () => { relSpouse -= 40; }
    },
    {
        id: 8, phase: 2, category: "🛠️ EV KRİZİ", sender: "Tesisatçı", icon: "🔧", title: "Kombi Bozuldu",
        text: "Eve geldin, kombi su akıtıyor ve ev buz gibi acil usta lazım.",
        acceptText: "Ustayı çağır (-2500 TL)", rejectText: "Battaniyeye sarıl / Mutluluk -30",
        action: () => { modifyMoney(-2500); },
        rejectAction: () => { happiness -= 30; relSpouse -= 15; }
    }
];

// UI DOM ELEMANLARI
const mainContainer = document.getElementById("main-container");
const cinematicOverlay = document.getElementById("cinematic-overlay");
const cinemaBar = document.getElementById("cinema-bar");
const cinematicTitle = document.getElementById("cinematic-title");
const cinematicSubtitle = document.getElementById("cinematic-subtitle");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const sideDrawer = document.getElementById("side-drawer");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const acceptBtn = document.getElementById("accept-btn");
const rejectBtn = document.getElementById("reject-btn");

// TETİKLEYİCİLER
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
acceptBtn.addEventListener("click", () => handleChoice(true));
rejectBtn.addEventListener("click", () => handleChoice(false));

document.getElementById("menu-toggle-btn").addEventListener("click", () => sideDrawer.classList.toggle("hidden"));
document.getElementById("close-drawer-btn").addEventListener("click", () => sideDrawer.classList.add("hidden"));

document.getElementById("action-crypto-btn").addEventListener("click", playCrypto);
document.getElementById("action-bet-btn").addEventListener("click", playBet);
document.getElementById("action-market-btn").addEventListener("click", playMarketTicket);

function startGame() {
    money = 28075; day = 1; phaseIndex = 0; happiness = 100;
    jobPerformance = 50; relSpouse = 50; relParents = 50; relFriend = 50;
    currentJob = { name: "Çaylak", salary: 28075 };
    ownedBusinesses = { pilav: false, eticaret: false, yazilim: false };
    usedCards = [];

    document.getElementById("buy-pilav-btn").innerText = "Satın Al";
    document.getElementById("buy-eticaret-btn").innerText = "Satın Al";
    document.getElementById("buy-yazilim-btn").innerText = "Satın Al";

    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    sideDrawer.classList.add("hidden");

    updateUI();
    getNewPhaseCard();
}

// 🎬 SİNEMATİK SAHNE MOTORU (PROGRESS BARLI ARA GEÇİŞLER)
function triggerCinematicScene(title, subtitle, durationMs, onCompleteCallback) {
    cinematicTitle.innerText = title;
    cinematicSubtitle.innerText = subtitle;
    cinemaBar.style.width = "0%";
    cinematicOverlay.classList.remove("hidden");

    let startTimestamp = null;
    function animateBar(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        let progress = timestamp - startTimestamp;
        let percentage = Math.min((progress / durationMs) * 100, 100);
        cinemaBar.style.width = percentage + "%";

        if (progress < durationMs) {
            requestAnimationFrame(animateBar);
        } else {
            setTimeout(() => {
                cinematicOverlay.classList.add("hidden");
                onCompleteCallback();
            }, 200);
        }
    }
    requestAnimationFrame(animateBar);
}

// 💥 SCREEN SHAKE VE PARASAL EVENT BİLDİRİMLERİ
function modifyMoney(amount) {
    money += amount;
    const walletBox = document.getElementById("wallet-hud-box");
    if (amount < 0) {
        walletBox.style.borderColor = "#ef4444";
        setTimeout(() => walletBox.style.borderColor = "#1e293b", 400);
    } else if (amount > 0) {
        walletBox.style.borderColor = "#10b981";
        setTimeout(() => walletBox.style.borderColor = "#1e293b", 400);
    }
}

function spawnFloatingText(text, colorType) {
    const fText = document.createElement("div");
    fText.className = "floating-text";
    fText.innerText = text;
    fText.style.color = colorType === "green" ? "#10b981" : "#ef4444";
    fText.style.left = (Math.random() * 100 + 120) + "px";
    fText.style.top = "500px";
    mainContainer.appendChild(fText);
    setTimeout(() => fText.remove(), 800);
}

function triggerScreenShake() {
    mainContainer.classList.add("shake");
    setTimeout(() => mainContainer.classList.remove("shake"), 200);
}

// KART SEÇİM DÖNGÜSÜ
function getNewPhaseCard() {
    if (day > 30) { endGame("win"); return; }
    let validCards = cardDeck.filter(c => c.phase === phaseIndex && !usedCards.includes(c.id));
    if (validCards.length === 0) {
        usedCards = usedCards.filter(id => !cardDeck.find(c => c.id === id && c.phase === phaseIndex));
        validCards = cardDeck.filter(c => c.phase === phaseIndex);
    }
    currentCard = validCards[Math.floor(Math.random() * validCards.length)];
    usedCards.push(currentCard.id);

    document.getElementById("card-category").innerText = currentCard.category;
    document.getElementById("card-sender").innerText = currentCard.sender;
    document.getElementById("card-avatar").innerText = currentCard.icon;
    document.getElementById("card-title").innerText = currentCard.title;
    document.getElementById("card-text").innerText = currentCard.text;
    document.getElementById("accept-preview").innerText = currentCard.acceptText;
    document.getElementById("reject-preview").innerText = currentCard.rejectText;
}

function handleChoice(isAccepted) {
    triggerScreenShake();
    
    if (isAccepted) currentCard.action();
    else currentCard.rejectAction();

    happiness -= 2;
    statsCap();
    updateUI();
    checkGameOver();

    phaseIndex++;
    if (phaseIndex > 2) {
        phaseIndex = 0;
        day++;
        
        // Şirket Pasifleri
        if (ownedBusinesses.pilav) { modifyMoney(500); spawnFloatingText("+500 TL (Pilav)", "green"); }
        if (ownedBusinesses.eticaret) { modifyMoney(1500); spawnFloatingText("+1500 TL (Mağaza)", "green"); }
        if (ownedBusinesses.yazilim) { modifyMoney(4500); spawnFloatingText("+4500 TL (Yazılım)", "green"); }

        money -= 250; // Kira/Mutfak gideri

        // 5 Günde bir Maaş Animasyonlu Bildirim Patlaması
        if (day % 5 === 0) {
            modifyMoney(currentJob.salary);
            document.getElementById("wallet-hud-box").classList.add("neon-flash");
            setTimeout(() => document.getElementById("wallet-hud-box").classList.remove("neon-flash"), 1000);
            alert(`🎉 MAAŞ GÜNÜ PATLAMASI! ${currentJob.name} Maaşı Olan ${currentJob.salary.toLocaleString()} TL Hesabına Geçti!`);
        }
    }

    updateUI();
    getNewPhaseCard();
}

// 🍔 SİNEMATİK EK İŞ MOTORU
function doFreelance(type) {
    sideDrawer.classList.add("hidden");
    
    if (type === 'kurye') {
        triggerCinematicScene("🏍️ GECE VARDİYASI MOTO KURYELİK", "Sokaklarda sipariş yetiştiriyorsun, paketler sıcak...", 1500, () => {
            modifyMoney(1500); happiness -= 10;
            spawnFloatingText("+1500 TL", "green");
            postActionCheck();
        });
    } else if (type === 'youtube') {
        triggerCinematicScene("🎬 VİDEO RENDER ALINIYOR", "beeka31 kanalına yeni video montajlanıyor, render %80...", 1800, () => {
            modifyMoney(2500); relFriend -= 5;
            spawnFloatingText("+2500 TL", "green");
            postActionCheck();
        });
    } else if (type === 'sarki') {
        triggerCinematicScene("🎤 DÜĞÜN SALONU SAHNESİ", "Sabaha kadar Ankara havaları çalıyor, bahşişler toplanıyor!", 2000, () => {
            modifyMoney(4000); relSpouse -= 10;
            spawnFloatingText("+4000 TL", "green");
            postActionCheck();
        });
    }
}

function postActionCheck() {
    statsCap(); updateUI(); checkGameOver();
}

// 🏢 GİRİŞİMCİLİK SİSTEMİ
function buyBusiness(type) {
    if (type === 'pilav') {
        if (ownedBusinesses.pilav) return;
        if (money < 8000) { alert("Para yetersiz!"); return; }
        money -= 8000; ownedBusinesses.pilav = true;
        document.getElementById("buy-pilav-btn").innerText = "Sahipsin 🎯";
    } else if (type === 'eticaret') {
        if (ownedBusinesses.eticaret) return;
        if (money < 20000) { alert("Para yetersiz!"); return; }
        money -= 20000; ownedBusinesses.eticaret = true;
        document.getElementById("buy-eticaret-btn").innerText = "Sahipsin 🎯";
    } else if (type === 'yazilim') {
        if (ownedBusinesses.yazilim) return;
        if (money < 50000) { alert("Para yetersiz!"); return; }
        money -= 50000; ownedBusinesses.yazilim = true;
        document.getElementById("buy-yazilim-btn").innerText = "Sahipsin 🎯";
    }
    updateUI(); sideDrawer.classList.add("hidden");
}

function changeJob(jobType) {
    if (jobType === 'mudur' && jobPerformance >= 60) { currentJob = { name: "Banka Müdürü", salary: 45000 }; }
    else if (jobType === 'yazilimci' && jobPerformance >= 80) { currentJob = { name: "Kıdemli Yazılımcı", salary: 70000 }; }
    else if (jobType === 'ceo' && jobPerformance >= 95) { currentJob = { name: "Holding CEO'su", salary: 120000 }; }
    else { alert("❌ Bu meslek için iş performans şartlarını karşılayamıyorsun!"); }
    updateUI(); sideDrawer.classList.add("hidden");
}

// 🎰 SİNEMATİK KUMAR SAHNELERİ (SLOT / ÇARK EFEKTİ)
function playCrypto() {
    if (money < 2000) return;
    modifyMoney(-2000);
    triggerCinematicScene("₿ KRİPTO BORSA GRAFİKLERİ", "Balinalar alım yapıyor, mumlar hareketli, kaldıraç ayarlanıyor...", 2000, () => {
        if (Math.random() > 0.55) { modifyMoney(5500); alert("🚀 COIN REKOR KIRDI! +5.500 TL kazandın!"); }
        else { alert("📉 LİKİT OLDUN! Parayı balinalar yedi."); }
        postActionCheck();
    });
}

function playBet() {
    if (money < 1000) return;
    modifyMoney(-1000);
    triggerCinematicScene("⚽ KUPON CANLI SKORLAR", "Maçlar 90+ oynanıyor, kupondaki son maç penaltı bekliyor...", 1800, () => {
        if (Math.random() > 0.75) { modifyMoney(5000); alert("⚽ KUPON TUTTU! Son saniye golüyle +5.000 TL!"); }
        else { alert("❌ TEK MAÇTAN YATTI! Karşı takım kontradan attı."); }
        postActionCheck();
    });
}

function playMarketTicket() {
    if (money < 500) return;
    modifyMoney(-500);
    triggerCinematicScene("🛒 KAZI KAZAN KAZINIYOR", "Bozuk parayla bilet kazınıyor, son iki rakam eşleşmek üzere...", 1200, () => {
        if (Math.random() > 0.90) { modifyMoney(25000); alert("💰 BÜYÜK İKRAMİYE! Tam +25.000 TL kazandın!"); }
        else { alert("🎫 AMORTİ BİLE YOK! Başka sefere kanka."); }
        postActionCheck();
    });
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(`tab-${tabName}`).classList.remove("hidden");
    event.currentTarget.classList.add("active");
}

function statsCap() {
    happiness = Math.min(100, Math.max(0, happiness));
    jobPerformance = Math.min(100, Math.max(0, jobPerformance));
    relSpouse = Math.min(100, Math.max(0, relSpouse));
    relParents = Math.min(100, Math.max(0, relParents));
    relFriend = Math.min(100, Math.max(0, relFriend));
}

function checkGameOver() {
    if (money <= 0) endGame("money");
    else if (happiness <= 0) endGame("happiness");
    else if (jobPerformance <= 0) endGame("job");
    else if (relSpouse <= 0) endGame("spouse");
    else if (relParents <= 0) endGame("parents");
}

function updateUI() {
    document.getElementById("day-display").innerText = `GÜN: ${day}`;
    document.getElementById("phase-display").innerText = phases[phaseIndex].name;
    document.getElementById("phase-display").className = phases[phaseIndex].class;
    document.getElementById("happiness-display").innerText = `%${happiness}`;
    document.getElementById("job-title-display").innerText = currentJob.name;
    
    const jBar = document.getElementById("job-progress");
    jBar.style.width = `${jobPerformance}%`;
    if (jobPerformance < 30) jBar.style.backgroundColor = "#ef4444";
    else if (jobPerformance < 60) jBar.style.backgroundColor = "#f59e0b";
    else jBar.style.backgroundColor = "#10b981";

    document.getElementById("rel-spouse").innerText = `%${relSpouse}`;
    document.getElementById("rel-parents").innerText = `%${relParents}`;
    document.getElementById("rel-friend").innerText = `%${relFriend}`;
    document.getElementById("money-display").innerText = money.toLocaleString('tr-TR') + " TL";
}

function endGame(reason) {
    gameScreen.classList.add("hidden");
    sideDrawer.classList.add("hidden");
    endScreen.classList.remove("hidden");
    document.getElementById("score-days").innerText = day;
    document.getElementById("score-money").innerText = money.toLocaleString('tr-TR') + " TL";

    const title = document.getElementById("end-title");
    const text = document.getElementById("end-text");

    if (reason === "win") { title.innerText = "YENİ HOLDİNG PATRONU! 🏆"; text.innerText = "İmparatorluğunu kurdun!"; }
    else if (reason === "money") { title.innerText = "İFLAS ETTİN! 💸"; text.innerText = "Paran sıfırlandı."; }
    else if (reason === "happiness") { title.innerText = "TÜKENMİŞLİK! 🧠"; text.innerText = "Akıl sağlığını yitirdin."; }
    else if (reason === "job") { title.innerText = "KOVULDUN! 🏢"; text.innerText = "İşten atıldın."; }
    else if (reason === "spouse") { title.innerText = "BOŞANDINIZ! 💔"; text.innerText = "Eşin terk etti."; }
    else if (reason === "parents") { title.innerText = "EVLATLIKTAN REDDEDİLDİN! 🧓"; text.innerText = "Hayırsız evlat."; }
}