/* terminal.js — общий движок терминала для index.html и 404.html

   Страница передаёт только то, что у неё своё: название окна, приветствие,
   слова-триггеры и словарь команд. Всё остальное (окно, ввод, вывод, защита
   от HTML, Esc, открытие по набору слова) делает этот файл.

   Подключение:
     <link rel="stylesheet" href="terminal.css">
     <script src="terminal.js"></script>
     <script>
       const term = Terminal.init({
         title: 'NESTTER_OS',
         greeting: ['System initialized...'],
         triggers: ['log', 'дщп'],
         commands: {
           '/hello': (t) => t.line('Hello!', 'ok'),
         }
       });
     </script>

   Команда получает объект t с методами:
     t.line(text, type, gap)  — строка обычного текста; type: text | ok | warn | err | accent | muted
     t.html(html)             — произвольная разметка (только твой собственный текст, не ввод пользователя)
     t.help(title, items)     — список команд: items = [['/cmd', 'описание'], ...]
     t.clear()  t.open()  t.close()
*/
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init(opts) {
    opts = opts || {};
    var commands = opts.commands || {};
    var triggers = (opts.triggers || ['log', 'дщп']).map(function (s) { return s.toLowerCase(); });
    var maxLen = triggers.reduce(function (m, s) { return Math.max(m, s.length); }, 1);

    // --- окно ---
    var root = document.createElement('div');
    root.id = 'custom-terminal';
    root.className = 'term-overlay';
    root.innerHTML =
      '<div class="term-window" role="dialog" aria-label="Terminal">' +
        '<div class="term-header">' +
          '<span class="term-title">' + esc(opts.title || 'NESTTER_OS') + '</span>' +
          '<button type="button" class="term-close">[X] CLOSE</button>' +
        '</div>' +
        '<div class="term-output" id="term-output"></div>' +
        '<div class="term-inputrow">' +
          '<span class="term-prompt">&gt;</span>' +
          '<input type="text" class="term-input" id="term-input" autocomplete="off" spellcheck="false">' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    var output = root.querySelector('.term-output');
    var input = root.querySelector('.term-input');
    var closeBtn = root.querySelector('.term-close');

// --- перетаскивание окна за шапку ---
    // --- перетаскивание окна за шапку (ОПТИМИЗИРОВАНО) ---
    var win = root.querySelector('.term-window');
    var header = root.querySelector('.term-header');
    var posX = 0, posY = 0;
    
    // Переменные для drag
    var isDragging = false;
    var startX, startY, initialX, initialY;
    var minX, maxX, minY, maxY;

    function setPos(x, y) {
      posX = x; posY = y;
      win.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }

    header.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.term-close')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // Считаем границы ТОЛЬКО ОДИН РАЗ при клике, а не при каждом движении
      var rect = win.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      initialX = posX; initialY = posY;
      
      minX = initialX - rect.left; 
      maxX = initialX + (window.innerWidth - rect.right);
      minY = initialY - rect.top;  
      maxY = initialY + (window.innerHeight - rect.bottom);

      isDragging = true;
      header.setPointerCapture(e.pointerId);
      header.classList.add('dragging');
    });

    header.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      
      // Плавно вычисляем новую позицию
      var newX = Math.min(maxX, Math.max(minX, initialX + e.clientX - startX));
      var newY = Math.min(maxY, Math.max(minY, initialY + e.clientY - startY));
      
      // requestAnimationFrame делает движение бархатным
      requestAnimationFrame(function() {
        setPos(newX, newY);
      });
    });

    header.addEventListener('pointerup', function (e) {
      if (!isDragging) return;
      isDragging = false;
      header.releasePointerCapture(e.pointerId);
      header.classList.remove('dragging');
      input.focus();
    });

    header.addEventListener('pointercancel', function (e) {
      if (!isDragging) return;
      isDragging = false;
      header.releasePointerCapture(e.pointerId);
      header.classList.remove('dragging');
    });

    // --- вывод ---
    function scroll() { output.scrollTop = output.scrollHeight; }

    function line(text, type, gap) {
      var d = document.createElement('div');
      if (type) d.className = 't-' + type;
      if (gap) d.className += (d.className ? ' ' : '') + 't-gap';
      d.textContent = text;
      output.appendChild(d);
      scroll();
    }

    function html(markup) {
      output.insertAdjacentHTML('beforeend', markup);
      scroll();
    }

    function help(title, items) {
      line(title, 'accent', true);
      (items || []).forEach(function (it) {
        html('<div>- <span class="t-ok">' + esc(it[0]) + '</span> : ' + esc(it[1]) + '</div>');
      });
    }

    function clear() { output.innerHTML = ''; }

    // --- открытие и закрытие ---
    function open() {
      root.classList.add('open');
      document.body.style.overflow = 'hidden';
      setPos(0, 0);
      input.value = '';
      
      // Ждем 100мс, чтобы окно успело отрисоваться, и фокусируемся
      setTimeout(function () { 
        input.focus(); 
        
        // Если это мобильное устройство, прокручиваем экран к полю ввода
        if (window.innerWidth < 768) {
          input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100); 
    }

    function close() {
      root.classList.remove('open');
      document.body.style.overflow = ''; // Возвращаем прокрутку!
      input.blur(); 
    }

    var api = {
      open: open, close: close, clear: clear,
      line: line, html: html, help: help, esc: esc,
      isOpen: function () { return root.classList.contains('open'); }
    };

    // --- приветствие ---
    (opts.greeting || []).forEach(function (text) { line(text); });

    // --- ввод команд ---
    function run(raw) {
      var command = raw.trim();
      if (!command) return;

      html('<div class="t-gap"><span class="t-accent">&gt;</span> ' + esc(command) + '</div>');

      if (Object.prototype.hasOwnProperty.call(commands, command)) {
        commands[command](api);
      } else {
        line('Unknown command: ' + command + ". Type '/help' for a list.", 'err');
      }
      scroll();
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var value = input.value;
        input.value = '';
        run(value);
      }
    });

    // Esc закрывает окно, даже если фокус ушёл с поля ввода
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    closeBtn.addEventListener('click', close);

    // --- открытие набором слова на клавиатуре ---
    var buffer = '';
    window.addEventListener('keydown', function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!e.key || e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

      buffer = (buffer + e.key.toLowerCase()).slice(-maxLen);
      for (var i = 0; i < triggers.length; i++) {
        var w = triggers[i];
        if (buffer.slice(-w.length) === w) {
          buffer = '';
          open();
          break;
        }
      }
    });
    
    // Страховка для мобильных устройств при фокусе на поле
    input.addEventListener('focus', function() {
      if (window.innerWidth < 768) {
        setTimeout(function() {
          input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 300); // Ждем, пока клавиатура полностью выедет
      }
    });
    return api;
  }

  window.Terminal = { init: init, esc: esc };
})();
