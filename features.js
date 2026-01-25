/**
 * KPS SMART AI ASSISTANT - ULTIMATE ENTERPRISE VERSION
 * Logic: Auto-Scraping, Firebase Live Student Check, Month-Based Attendance
 */

const scrollTopBtn = document.getElementById('scrollTopBtn');
const whatsappFab = document.getElementById('whatsappFab');
const aiChatWindow = document.getElementById('aiChatWindow');
const aiChatBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');

let KPS_Brain = {
    webData: "", 
    isAIClose: false
};

// 1. AUTO-TRAIN: Website load hote hi saare pages ko "Digest" karna
async function trainAIBrain() {
    // Isme fees.html bhi add kar diya hai taaki AI fine/due date padh sake
    const pages = ['about.html', 'facilities.html', 'MandatoryDisclosure.html', 'contact.html', 'admission.html', 'fees.html'];
    
    for (let page of pages) {
        try {
            const res = await fetch(page);
            if (!res.ok) continue;
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            let pageText = doc.body.innerText.replace(/\s+/g, ' ').trim();
            KPS_Brain.webData += " " + pageText;
        } catch (e) { console.log("AI indexing failed: " + page); }
    }
}

// 2. THE ADVANCED BRAIN LOGIC
async function askAdvancedAI() {
    const query = aiInput.value.trim().toLowerCase();
    if (!query) return;

    aiChatBody.innerHTML += `<div class="user-msg">${query}</div>`;
    aiInput.value = "";

    let response = "";

    // A. SERIAL NO. DETECTION (e.g., KPS123)
    const serialMatch = query.match(/kps\d+/); // Finds codes like kps101, kps202
    if (serialMatch) {
        const sID = serialMatch[0].toUpperCase();
        response = `Fetching records for Student ID: ${sID}... `;
        
        try {
            // FIREBASE CONNECTION (Database se data uthana)
            const snapshot = await db.ref('students/' + sID).once('value'); 
            const data = snapshot.val();
            
            if (data) {
                // Fee & Attendance combined response
                const feeStatus = `Installment 1 is ${data.fees.i} and Installment 2 is ${data.fees.ii}.`;
                response = `Student Found: ${data.name}. ${feeStatus} As per Fee Rules, a fine is applicable after the 10th.`;
            } else {
                response = `Sorry, I couldn't find any record for ${sID}. Please check the ID again.`;
            }
        } catch (e) {
            response = "Unable to connect to school database. Please try again later.";
        }
    }

    // B. ATTENDANCE LOGIC (Month Based)
    else if (query.includes("attendance") || query.includes("present")) {
        const currentMonth = new Date().getMonth(); // 3 = April
        if (currentMonth === 3) {
            response = "The new session has just started in April. Attendance reports will be available from May onwards.";
        } else if (window.currentStudent) {
            response = `Your attendance for the previous month was ${window.currentStudent.attendance.prev}%.`;
        } else {
            response = "Please provide your Serial Number to check your attendance status.";
        }
    }

    // C. SEARCH IN SCRAPED DATA (English Only)
    if (!response) {
        const sentences = KPS_Brain.webData.split(/[.!?]/);
        const match = sentences.find(s => s.toLowerCase().includes(query.split(' ')[0]) && s.length > 15);
        if (match) response = match.trim() + ".";
    }

    // D. FALLBACK (If nothing works)
    setTimeout(() => {
        if (!response) {
            const fallback = "Sorry, I can't find this information. Kindly contact School at +91-8299390677 (Timings: 8:00 AM to 2:00 PM).";
            aiChatBody.innerHTML += `<div class="bot-msg"><b>AI:</b> ${fallback}</div>`;
            aiChatBody.innerHTML += `<a href="https://wa.me/8299390677" target="_blank" style="display:inline-block; background:#25d366; color:white; padding:5px 10px; border-radius:5px; text-decoration:none; font-size:12px; margin-top:5px; margin-left:10px;">Chat on WhatsApp</a>`;
        } else {
            aiChatBody.innerHTML += `<div class="bot-msg"><b>AI:</b> ${response}</div>`;
        }
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, 600);
}

// 3. UI TOGGLE & SCROLL LOGIC (Aapka original logic preserved)
window.toggleAIChat = () => {
    aiChatWindow.style.display = aiChatWindow.style.display === 'flex' ? 'none' : 'flex';
};

window.closeFab = () => {
    if (whatsappFab) {
        whatsappFab.style.display = 'none';
        KPS_Brain.isAIClose = true; // Mark as closed
        handleScrollLogic(); 
    }
};

function handleScrollLogic() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    // Condition: Only show scroll button if AI is closed AND scroll > 200
    if (KPS_Brain.isAIClose && scrollPos > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

// 4. EVENT LISTENERS
window.addEventListener('scroll', handleScrollLogic, { passive: true });
window.addEventListener('load', () => {
    trainAIBrain();
    handleScrollLogic();
});

if (scrollTopBtn) {
    scrollTopBtn.onclick = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

aiInput.addEventListener("keypress", (e) => { if (e.key === "Enter") askAdvancedAI(); });
