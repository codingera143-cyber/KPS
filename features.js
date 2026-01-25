const scrollTopBtn = document.getElementById('scrollTopBtn');
const whatsappFab = document.getElementById('whatsappFab');
const aiChatWindow = document.getElementById('aiChatWindow');
const aiChatBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');

let KPS_Brain = { webData: {}, isAIClose: false };

// 1. Precise Scraper: Har page ka data alag store karna
async function trainAIBrain() {
    const pages = ['about', 'facilities', 'MandatoryDisclosure', 'contact', 'fees', 'admission'];
    for (let p of pages) {
        try {
            const res = await fetch(`${p}.html`);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            KPS_Brain[p] = doc.body.innerText.replace(/\s+/g, ' ').trim().toLowerCase();
        } catch (e) { console.log("Missing page: " + p); }
    }
}

// 2. The Smart AI Engine
async function askAdvancedAI() {
    const query = aiInput.value.trim().toLowerCase();
    if (!query) return;

    // User Message Display
    aiChatBody.innerHTML += `<div class="user-msg">${query}</div>`;
    aiInput.value = "";
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    // Typing Animation
    const typingId = "typing-" + Date.now();
    aiChatBody.innerHTML += `<div id="${typingId}" class="typing-dots"><span></span><span></span><span></span></div>`;

    let response = "";

    // --- STEP 1: DIRECT NUMBER DETECTION (For Serial No 101, 205, etc.) ---
    const numberMatch = query.match(/\b\d{1,4}\b/); // Query mein se 1 se 4 digit ka number nikalna
    
    if (numberMatch) {
        const sID = numberMatch[0]; // Sirf number (e.g. "101")
        response = `Searching records for ID: ${sID}...`;
        
        try {
            // Firebase Fetch (Direct ID search)
            const snapshot = await db.ref('students/' + sID).once('value');
            const data = snapshot.val();
            if (data) {
                response = `<b>Student Found:</b> ${data.name.toUpperCase()}<br>
                            <b>Fees Status:</b><br>
                            - 1st Installment: ${data.fees.i}<br>
                            - 2nd Installment: ${data.fees.ii}<br>
                            <b>Attendance:</b> ${data.attendance.apr}% (April Month).`;
            } else {
                response = `ID <b>${sID}</b> ka koi record nahi mila. Kripya sahi Serial Number daalein.`;
            }
        } catch (e) { response = "Database se connect nahi ho paa raha hai."; }
    }

    // --- STEP 2: CONTEXTUAL WEB SEARCH (Agar number nahi hai) ---
    if (!response) {
        const categories = {
            admission: ["admission", "join", "form", "entry", "process", "procedure", "class", "apply"],
            fees: ["fee", "money", "paisa", "installment", "fine", "due", "pay", "structure", "dues"],
            contact: ["contact", "call", "phone", "number", "map", "address", "location", "office"],
            about: ["principal", "owner", "founder", "about", "developer", "school", "kps"]
        };

        let foundCat = Object.keys(categories).find(cat => 
            categories[cat].some(keyword => query.includes(keyword))
        );

        if (foundCat && KPS_Brain[foundCat]) {
            response = KPS_Brain[foundCat].substring(0, 350) + "...";
        } else {
            response = "Maaf kijiye, mujhe is baare mein jaankari nahi mili. Aap Fees, Admission ya Serial No. ke baare mein puch sakte hain.";
        }
    }

    // Bot Reply Display
    setTimeout(() => {
        const t = document.getElementById(typingId);
        if(t) t.remove();
        aiChatBody.innerHTML += `<div class="bot-msg"><b>KPS AI:</b><br>${response}</div>`;
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, 1200);
}

// 3. UI Toggles
window.toggleAIChat = () => {
    aiChatWindow.style.display = (aiChatWindow.style.display === 'flex') ? 'none' : 'flex';
};

window.closeFab = () => {
    whatsappFab.style.display = 'none';
    KPS_Brain.isAIClose = true;
    handleScrollLogic(); 
};

// 4. Scroll Logic (Unchanged)
function handleScrollLogic() {
    const pos = window.pageYOffset || document.documentElement.scrollTop;
    if (KPS_Brain.isAIClose && pos > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

window.addEventListener('scroll', handleScrollLogic);
window.onload = trainAIBrain;
aiInput.addEventListener("keypress", (e) => { if (e.key === "Enter") askAdvancedAI(); });
