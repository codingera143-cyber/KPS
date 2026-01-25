/**
 * KPS SMART AI ASSISTANT - ENGLISH PROFESSIONAL VERSION
 */

const scrollTopBtn = document.getElementById('scrollTopBtn');
const whatsappFab = document.getElementById('whatsappFab');
const aiChatWindow = document.getElementById('aiChatWindow');
const aiChatBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');

let KPS_Brain = { webData: {}, isAIClose: false };

// 1. DATA SCRAPER: Load pages into categories
async function trainAIBrain() {
    const pages = [
        { name: 'about', file: 'about.html' },
        { name: 'facilities', file: 'facilities.html' },
        { name: 'fees', file: 'fees.html' },
        { name: 'admission', file: 'admission.html' },
        { name: 'contact', file: 'contact.html' },
        { name: 'notice', file: 'index.html#notice-board' },
        { name: 'status', file: 'index.html#school-status' }
    ];

    for (let p of pages) {
        try {
            const res = await fetch(p.file);
            if (!res.ok) continue;
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            KPS_Brain.webData[p.name] = doc.body.innerText.replace(/\s+/g, ' ').trim().toLowerCase();
        } catch (e) { console.warn(`Missing: ${p.file}`); }
    }
}

// 2. THE MASTER ENGINE (Strict English Responses)
async function askAdvancedAI() {
    const query = aiInput.value.trim().toLowerCase();
    if (!query) return;

    // Show User Message
    aiChatBody.innerHTML += `<div class="user-msg">${query}</div>`;
    aiInput.value = "";
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    // Typing Animation
    const typingId = "typing-" + Date.now();
    aiChatBody.innerHTML += `<div id="${typingId}" class="typing-dots"><span></span><span></span><span></span></div>`;
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    let response = "";

    // --- LOGIC A: SERIAL NUMBER DETECTION (Direct Number Search) ---
    const numberMatch = query.match(/\b\d{1,4}\b/);
    if (numberMatch && !query.includes("fee") && !query.includes("admission")) {
        const sID = numberMatch[0];
        try {
            if (typeof db !== 'undefined') {
                const snapshot = await db.ref('students/' + sID).once('value');
                const data = snapshot.val();
                if (data) {
                    response = `<b>Student Profile Found:</b><br>
                                Name: ${data.name.toUpperCase()}<br>
                                Fees Status: ${data.fees.i} (1st Installment)<br>
                                Attendance: ${data.attendance.apr}% for the current month.`;
                } else {
                    response = `I am sorry, I could not find any student record with Serial Number: <b>${sID}</b>. Please verify the ID.`;
                }
            } else {
                response = "<b>Database Error:</b> Connection is currently offline. Please try again later.";
            }
        } catch (e) { response = "Error: Failed to connect to the school database."; }
    }

    // --- LOGIC B: CONTEXTUAL WEB SEARCH (Strict English Output) ---
    if (!response) {
        const categories = {
            admission: ["admission", "join", "form", "entry", "class", "apply", "procedure"],
            fees: ["fee", "structure", "installment", "fine", "due", "pay", "money", "paisa"],
            facilities: ["facility", "lab", "library", "bus", "transport", "sports", "playground"],
            about: ["principal", "owner", "founder", "about", "school", "history", "developer"],
            contact: ["contact", "call", "phone", "number", "address", "location"],
            notice: ["notice", "board", "news", "latest", "circular", "update"],
            status: ["open", "closed", "holiday"]
        };

        let matchedCat = Object.keys(categories).find(cat => 
            categories[cat].some(keyword => query.includes(keyword))
        );

        if (matchedCat && KPS_Brain.webData[matchedCat]) {
            response = `<b>Regarding ${matchedCat.charAt(0).toUpperCase() + matchedCat.slice(1)}:</b><br>` + 
                       KPS_Brain.webData[matchedCat].substring(0, 450) + "...";
        } else {
            response = "I am sorry, I do not have specific information on that topic. You may ask about Admissions, Fees, School Facilities, or provide a Student Serial Number.";
        }
    }

    // Final Bot Reply with Delay
    setTimeout(() => {
        const t = document.getElementById(typingId);
        if (t) t.remove();
        aiChatBody.innerHTML += `<div class="bot-msg"><b>KPS Assistant:</b><br>${response}</div>`;
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, 1200);
}

// 3. UI CONTROLS (Scroll Logic Untouched)
window.toggleAIChat = () => { aiChatWindow.style.display = (aiChatWindow.style.display === 'flex') ? 'none' : 'flex'; };
window.closeFab = () => { whatsappFab.style.display = 'none'; KPS_Brain.isAIClose = true; handleScrollLogic(); };

function handleScrollLogic() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    if (KPS_Brain.isAIClose && scrollPos > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

window.addEventListener('scroll', handleScrollLogic);
window.onload = trainAIBrain;
aiInput.addEventListener("keypress", (e) => { if (e.key === "Enter") askAdvancedAI(); });
