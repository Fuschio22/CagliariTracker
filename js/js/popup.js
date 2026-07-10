/**
 * MatchPulse Popup Module
 * Handles the floating live event popup
 */

const MatchPulsePopup = (() => {
    
    let popup = null;
    let popupContent = null;
    let popupTitle = null;
    let isMinimized = false;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    // Inizializza il popup
    function init() {
        popup = document.getElementById('livePopup');
        popupContent = document.getElementById('popupContent');
        popupTitle = document.getElementById('popupTitle');
        
        if (!popup) return;
        
        // Pulsante minimizza
        const minimizeBtn = document.getElementById('minimizePopup');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', toggleMinimize);
        }
        
        // Pulsante chiudi
        const closeBtn = document.getElementById('closePopup');
        if (closeBtn) {
            closeBtn.addEventListener('click', closePopup);
        }
        
        // Trascinamento
        initDrag();
        
        // Click per espandere quando minimizzato
        popup.addEventListener('click', (e) => {
            if (isMinimized && !e.target.closest('.popup-btn')) {
                toggleMinimize();
            }
        });
    }
    
    // Mostra il popup con un evento
    function showEvent(event) {
        if (!popup || !popupContent || !popupTitle) return;
        
        // Aggiorna titolo
        popupTitle.textContent = getEventTitle(event.type);
        
        // Aggiorna contenuto
        popupContent.innerHTML = `
            <div class="popup-event">
                <div class="popup-event-icon">${getEventIcon(event.type)}</div>
                <div class="popup-event-details">
                    <div class="popup-event-title">${event.player || event.title}</div>
                    <div class="popup-event-info">${event.team} • ${event.minute}'</div>
                </div>
            </div>
        `;
        
        // Mostra popup
        popup.classList.add('active');
        isMinimized = false;
        popup.classList.remove('minimized');
        
        // Auto-hide dopo 5 secondi
        setTimeout(() => {
            if (!isMinimized) {
                closePopup();
            }
        }, 5000);
    }
    
    // Toggle minimizza
    function toggleMinimize() {
        if (!popup) return;
        
        isMinimized = !isMinimized;
        
        if (isMinimized) {
            popup.classList.add('minimized');
        } else {
            popup.classList.remove('minimized');
        }
    }
    
    // Chiudi popup
    function closePopup() {
        if (!popup) return;
        
        popup.classList.remove('active');
        isMinimized = false;
        popup.classList.remove('minimized');
    }
    
    // Inizializza trascinamento
    function initDrag() {
        if (!popup) return;
        
        const header = popup.querySelector('.popup-header');
        
        header.addEventListener('mousedown', startDrag);
        header.addEventListener('touchstart', startDrag, { passive: false });
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }
    
    function startDrag(e) {
        if (isMinimized) return;
        
        isDragging = true;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = popup.getBoundingClientRect();
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
        
        e.preventDefault();
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const x = clientX - dragOffsetX;
        const y = clientY - dragOffsetY;
        
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        popup.style.right = 'auto';
        popup.style.bottom = 'auto';
        
        e.preventDefault();
    }
    
    function stopDrag() {
        isDragging = false;
    }
    
    // Ottieni titolo evento
    function getEventTitle(type) {
        const titles = {
            goal: 'GOAL!',
            yellow: 'Cartellino Giallo',
            red: 'Cartellino Rosso',
            substitution: 'Sostituzione',
            var: 'VAR Check',
            halftime: 'Intervallo',
            fulltime: 'Fine Partita'
        };
        return titles[type] || 'Evento Live';
    }
    
    // Ottieni icona evento
    function getEventIcon(type) {
        const icons = {
            goal: '⚽',
            yellow: '',
            red: '🟥',
            substitution: '🔄',
            var: '',
            halftime: '⏸️',
            fulltime: '🏁'
        };
        return icons[type] || '•';
    }
    
    return {
        init: init,
        showEvent: showEvent,
        closePopup: closePopup,
        toggleMinimize: toggleMinimize
    };
})();
