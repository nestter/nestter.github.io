/* other.js — все секреты сайта */

(function() {
  // 1. Внедряем HTML для уведомления и комнаты прямо в DOM
  const RoomHTML = `
    <div id="sun" class="toast" style="display: none;">
      <span class="icon">💡</span>
      <!-- ВОТ ЗДЕСЬ ДОБАВЛЕН data-i18n="sun" -->
      <span data-i18n="sun">The Sun has returned...</span> 
    </div>

    <div id="room" style="display: none; position: fixed; inset: 0; z-index: 999999; background: var(--dark, #0a0a0a); color: var(--text, #d0ccc8); align-items: center; justify-content: center; flex-direction: column; padding: 24px; text-align: center;">
      <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 3rem; color: var(--pink, #e8547a); margin-bottom: 20px; letter-spacing: 0.1em;">THE VO$D</h1>
      <p style="font-family: 'Space Mono', monospace; font-size: 0.9rem; max-width: 400px; line-height: 1.6; color: var(--muted, #6b6060); margin-bottom: 40px;">
        You have found the secret room.<br><br>
        Nice work bro!
      </p>
      <div style="width: 100px; height: 1px; background: var(--pink, #e8547a); margin-bottom: 40px;"></div>
      <button onclick="window.location.hash = ''" style="font-family: 'Space Mono', monospace; background: transparent; border: 1px solid var(--muted, #6b6060); color: var(--text, #d0ccc8); padding: 12px 24px; border-radius: 4px; cursor: pointer; transition: all 0.3s ease;">
        RETURN TO REALITY
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', RoomHTML);

  // Принудительно применяем текущий язык к только что созданному HTML
  const currentLang = localStorage.getItem('lang') || 'en';
  if (window.applyLang) {
    window.applyLang(currentLang);
  }

  // Показываем скрытые элементы (они были display: none для HTML)
  document.getElementById('sun').style.display = 'flex';
  document.getElementById('room').style.display = 'none';

  // 2. Логика звука и уведомления NIKO
  const Sound = new Audio('images/niko.mp3');
  Sound.preload = 'auto';
  Sound.load();             
  const sunToast = document.getElementById('sun');

  function triggerNiko() {
    if (!sunToast.classList.contains('show')) {
      Sound.currentTime = 0;
      Sound.play().catch(err => console.log("Звук не найден"));
      sunToast.classList.add('show');
      setTimeout(() => { sunToast.classList.remove('show'); }, 3000);
    }
  }

  let nikoBuffer = "";
  window.addEventListener("keydown", (e) => {
    const tag = e.target && e.target.tagName;
    // Игнорируем, если пользователь печатает в поле ввода (например, в терминале)
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    // Игнорируем служебные клавиши и зажатый Ctrl/Alt/Cmd
    if (!e.key || e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

    const key = e.key.toLowerCase();
    
    // Храним только последние 4 символа
    nikoBuffer = (nikoBuffer + key).slice(-4);

    // Проверяем на английскую и русскую раскладку
    if (nikoBuffer === "niko" || nikoBuffer === "нико") {
      triggerNiko();
      nikoBuffer = "";
    }
  });

  // 3. Логика секретной комнаты
  function toggleRoom() {
    const room = document.getElementById('room');
    const mainPage = document.querySelector('.page');
    const langSwitcher = document.querySelector('.lang');

    if (window.location.hash === '#V0$D') {
      if (mainPage) mainPage.style.display = 'none';
      if (langSwitcher) langSwitcher.style.display = 'none';
      
      room.style.display = 'flex';
      room.classList.remove('room-animate');
      setTimeout(() => { room.classList.add('room-animate'); }, 10);

      if (window.termAPI) window.termAPI.close(); // Закрываем терминал, если он открыт
    } else {
      if (mainPage) mainPage.style.display = 'flex';
      if (langSwitcher) langSwitcher.style.display = 'flex';
      
      room.classList.remove('room-animate');
      room.style.display = 'none';
    }
  }

  window.addEventListener('hashchange', toggleRoom);
  // Проверяем хэш при загрузке
  setTimeout(toggleRoom, 100); 

  // 4. Инициализация терминала и его команд
  if (window.Terminal) {
    window.termAPI = Terminal.init({
      title: 'NESTTER_OS v1.5',
      greeting: ['System initialized...', 'Awaiting input...'],
      triggers: ['log', 'дщп', 'лог', 'kju'],
      commands: {
        "/niko": (t) => {
          t.line('Light returned...', 'ok');
          triggerNiko();
        },
        "/void": (t) => {
          t.line('Accessing the void... Please wait.', 'err');
          setTimeout(() => {
            t.close();
            window.location.hash = 'V0$D';
          }, 1000);
        },
        "/warn": (t) => {
          t.line('[WARNING] System anomaly detected. Showing alert...', 'warn');
          const bw = document.getElementById('browser-warning');
          if (bw) bw.style.display = 'flex';
        },
        "/404": (t) => {
          t.line('Simulating system failure... Redirecting to the void.', 'err');
          setTimeout(() => { window.location.href = '/HE&LП MИ PЛIASE'; }, 1000);
        },
        "/help": (t) => {
          t.help('Available commands:', [
            ['/niko', 'Call the sun'],
            ['/warn', 'Trigger system warning'],
            ['/about', 'Show system info'],
            ['/clear', 'Clear terminal'],
            ['/exit', 'Close terminal'],
            ['/0x194', 'ERROR FOUND'],
            ['/56_6F_69_64', 'CRITICAL ERROR FOUND']
          ]);
        },
        "/about": (t) => {
          t.line('NESTTER_OS v1.0', 'text', true);
          t.line('3D Modeler Portfolio. Built with pure HTML/CSS/JS.', 'muted');
        },
        "/clear": (t) => t.clear(),
        "/exit": (t) => t.close(),
      }
    });
  }

  // 5. Открытие терминала тройным кликом по футеру
  let secretClicks = 0;
  const secretTrigger = document.querySelector('.footer');
  if (secretTrigger) {
    secretTrigger.addEventListener('click', () => {
      secretClicks++;
      if (secretClicks === 3 && window.termAPI) {
        window.termAPI.open();
        secretClicks = 0;
      }
      setTimeout(() => { secretClicks = 0; }, 1000);
    });
  }
})();