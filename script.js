// --- CTF Functions ---
function loadCTFWinners() {
    fetch('/api/ctf/winners')
        .then(r => r.json())
        .then(d => {
            document.getElementById('ctfWinnerCount').textContent = d.count;
        })
        .catch(() => {});
}

function submitFlag() {
    const input = document.getElementById('ctfFlagInput');
    const msg = document.getElementById('ctfMessage');
    if (input.value.trim().length === 0) return;
    
    fetch('/api/ctf/validate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({flag: input.value.trim()})
    })
    .then(r => r.json())
    .then(d => {
        if (d.valid) {
            msg.style.color = '#00ff88';
            msg.textContent = '✓';
            input.style.borderColor = '#00ff88';
            input.disabled = true;
            loadCTFWinners();
        } else {
            msg.style.color = '#ff4444';
            msg.textContent = '✗';
            setTimeout(() => msg.textContent = '', 2000);
        }
    })
    .catch(() => {
        msg.style.color = '#ff4444';
        msg.textContent = '!';
    });
}

// --- Terminal ---
let konamiCode = [];
const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];

function openTerminal() {
    document.getElementById('terminalOverlay').classList.add('active');
    document.getElementById('terminalInput').focus();
    addOutput('Welcome! Type "help" for commands.\n', 'cmd-info');
    fetch('/api/ctf/terminal-access', {method: 'POST'});
}

function closeTerminal() {
    document.getElementById('terminalOverlay').classList.remove('active');
    konamiCode = [];
}

function addOutput(text, className = 'cmd-output') {
    const output = document.getElementById('terminalOutput');
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function executeCommand(cmd) {
    const args = cmd.toLowerCase().split(' ');
    const command = args[0];
    const message = args.slice(1).join(' ');

    switch(command) {
        case 'help':
            addOutput(`
╔════════════════════════════════════════════════════╗
║  help    - Show this menu                          ║
║  whoami  - Who are you?                            ║
║  about   - About Jérémie                           ║
║  skills  - List skills                             ║
║  contact - Contact info                            ║
║  neofetch- System info                             ║
║  cowsay  - Cow speaks                              ║
║  ls      - List files                              ║
║  cat     - Read file                               ║
║  clear   - Clear terminal                          ║
║  exit    - Close terminal                          ║
╚════════════════════════════════════════════════════╝`, 'cmd-info');
            break;
        case 'ls':
            if (args[1] === '-la' || args[1] === '-a') {
                addOutput('drwxr-xr-x  visitor visitor  .config/\n-rw-r--r--  visitor visitor  readme.txt\n-rw-r--r--  visitor visitor  .secret', 'cmd-info');
            } else {
                addOutput('readme.txt', 'cmd-info');
            }
            break;
        case 'cat':
            if (args[1] === 'readme.txt') {
                addOutput('Welcome to my portfolio!\nTip: Hidden files exist... try ls -la', 'cmd-info');
            } else if (args[1] === '.secret') {
                addOutput('Almost there! The flag format is: FLAG{something}\nHint: Check the page source for "ctf-hint"', 'cmd-info');
            } else if (args[1] === '.config' || args[1] === '.config/') {
                addOutput('cat: .config: Is a directory\nTry: cat .config/flag.txt', 'cmd-info');
            } else if (args[1] === '.config/flag.txt') {
                fetch('/api/ctf/flag').then(r => r.json()).then(d => addOutput(`🚩 ${d.flag}`, 'cmd-info'));
            } else {
                addOutput(`cat: ${args[1] || ''}: No such file`, 'cmd-error');
            }
            break;
        case 'cd':
            addOutput('Nice try! Use cat to read files instead.', 'cmd-info');
            break;
        case 'whoami':
            addOutput('visitor@jeremie-portfolio');
            break;
        case 'about':
            addOutput('Jérémie Le Bel - Cybersecurity Specialist\nLorem Ipsum | Dolor Sit | Amet', 'cmd-info');
            break;
        case 'skills':
            addOutput('[LOREM]    ████████████████████░░ 90%\n[IPSUM]    ████████████████████░░ 90%\n[DOLOR]    ██████████████████░░░░ 85%', 'cmd-info');
            break;
        case 'contact':
            addOutput('📧 lorem@ipsum.com\n🐙 github.com/lorem\n💼 linkedin.com/in/jérémie-le-bel-964225338', 'cmd-info');
            break;
        case 'neofetch':
            addOutput(`
       ,-.
      / \\  \`.  __..-,O     visitor@portfolio
     :   \\ --''_..-'.'     OS: Portfolio Web 1.0
     |    . .-' \`. '.      Host: Your Browser
      \\     \`.  /  ..      Shell: Secret Terminal
       ,|,\`.   \`-.\\        Skills: Lorem Ipsum
      '.|| \`\`-...-\`
       |__|  /||\\`, 'cmd-info');
            break;
        case 'cowsay':
            const m = message || 'Hire Jérémie!';
            addOutput(` ${'_'.repeat(m.length+2)}\n< ${m} >\n ${'-'.repeat(m.length+2)}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`);
            break;
        case 'clear':
            document.getElementById('terminalOutput').innerHTML = '';
            break;
        case 'exit':
            setTimeout(closeTerminal, 300);
            break;
        default:
            addOutput(`bash: ${command}: command not found`, 'cmd-error');
    }
}

// --- Starfield Canvas ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let scrollY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            color: ["#00d9ff", "#ffd700", "#ff6ec7"][Math.floor(Math.random() * 3)],
            depth: Math.random() * 0.8 + 0.2,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
        s.twinkle += 0.02;
        ctx.globalAlpha = 0.3 + Math.sin(s.twinkle) * 0.7;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, (s.y - scrollY * s.depth * 0.1 + canvas.height) % canvas.height, s.r, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
}

// --- Modal ---
const modalData = [
    { title: "Lorem Ipsum Dolor", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", tech: "Lorem, Ipsum", status: "Lorem" },
    { title: "Amet Consectetur", description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", tech: "Dolor, Sit", status: "Amet" }
];

function openModal(i) {
    const d = modalData[i];
    document.getElementById('modalTitle').innerText = d.title;
    document.getElementById('modalDescription').innerText = d.description;
    document.getElementById('modalTech').innerText = d.tech;
    document.getElementById('modalStatus').innerText = d.status;
    document.getElementById('projectModal').style.display = 'flex';
}

function closeModal(e) {
    if (e.target.id === 'projectModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('projectModal').style.display = 'none';
    }
}

// --- Skills Toggle ---
function toggleCategory(header) {
    header.parentElement.classList.toggle('collapsed');
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', function() {
    // Load CTF winners
    loadCTFWinners();
    
    // Initialize starfield
    resizeCanvas();
    drawStars();
    
    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.panel').forEach(panel => {
        const box = panel.querySelector('.hero-box, .content-box');
        if (!box) return;
        gsap.from(box, {
            x: panel.classList.contains('panel-left') ? -150 : panel.classList.contains('panel-right') ? 150 : 0,
            opacity: 0,
            scrollTrigger: { trigger: panel, start: "top 75%", end: "top 25%", scrub: 1 }
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
});

// --- Event Listeners ---
window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', () => scrollY = window.scrollY);

// Konami code listener
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('terminalOverlay').classList.contains('active')) {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-4);
        if (konamiCode.join(',') === secretCode.join(',')) openTerminal();
    }
    if (e.key === 'Escape') closeTerminal();
});

// Terminal input listener
document.getElementById('terminalInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        addOutput(`$ ${e.target.value}`, 'cmd-input');
        executeCommand(e.target.value.trim());
        e.target.value = '';
    }
});