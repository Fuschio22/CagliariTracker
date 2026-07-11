/**
 * MatchPulse Main App Module
 * Initializes the application and coordinates all modules
 * Integrates with football-data.org API for live match data
 */

const MatchPulseApp = (() => {
    
    // Stato dell'applicazione
    let currentMatchId = null;
    let featuredMatchId = null;
    let refreshInterval = null;
    let minuteInterval = null;
    let lastKnownScore = { home: 0, away: 0 };
    let lastKnownMinute = 0;
    let lastKnownEvents = [];
    
    // Partita da seguire (Norvegia vs Inghilterra)
    const TARGET_MATCH = {
        home: 'Norway',
        away: 'England'
    };
    
    // Inizializza l'applicazione
    async function init() {
        console.log('MatchPulse initializing...');
        
        // Inizializza i moduli
        MatchPulseUI.init();
        MatchPulsePopup.init();
        
        // Carica i dati iniziali
        await loadInitialData();
        
        // Avvia il refresh automatico
        startAutoRefresh();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('MatchPulse ready!');
    }
    
    // Carica tutti i dati iniziali
    async function loadInitialData() {
        try {
            // Carica partita in evidenza
            await loadFeaturedMatch();
            
            // Carica partite live
            await loadLiveMatches();
            
            // Carica partite di oggi
            await loadTodayMatches();
            
            // Carica competizioni
            await MatchPulseUI.renderCompetitions();
            
            // Carica preferiti
            await loadFavorites();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    // Carica la partita in evidenza (cerca prima Norvegia vs Inghilterra)
    async function loadFeaturedMatch() {
        try {
            // Cerca la partita specifica Norvegia vs Inghilterra
            const specificMatch = await MatchPulseAPI.findSpecificMatch(TARGET_MATCH.home, TARGET_MATCH.away);
            
            if (specificMatch) {
                featuredMatchId = specificMatch.id;
                currentMatchId = specificMatch.id;
                lastKnownScore = { ...specificMatch.score };
                lastKnownMinute = specificMatch.minute || 0;
                MatchPulseUI.renderFeaturedMatch(specificMatch);
                updatePinButton();
                return;
            }
            
            // Altrimenti usa la logica normale
            const savedFeaturedId = localStorage.getItem('matchpulse_featured');
            
            let match;
            if (savedFeaturedId) {
                featuredMatchId = savedFeaturedId;
                match = await MatchPulseAPI.getMatchDetails(savedFeaturedId);
            } else {
                const liveMatches = await MatchPulseAPI.getLiveMatches();
                if (liveMatches.length > 0) {
                    match = liveMatches[0];
                    featuredMatchId = match.id;
                }
            }
            
            if (match) {
                MatchPulseUI.renderFeaturedMatch(match);
                updatePinButton();
            } else {
                // Mostra messaggio se non ci sono partite
                const featuredCard = document.getElementById('featuredCard');
                if (featuredCard) {
                    featuredCard.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">⚽</div>
                            <h3 style="margin-bottom: 8px;">Nessuna partita in evidenza</h3>
                            <p style="color: var(--text-secondary);">
                                La partita Norvegia vs Inghilterra sarà mostrata qui quando inizierà.
                            </p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading featured match:', error);
        }
    }
    
    // Carica le partite live
    async function loadLiveMatches() {
        try {
            const matches = await MatchPulseAPI.getLiveMatches();
            MatchPulseUI.renderLiveMatches(matches);
        } catch (error) {
            console.error('Error loading live matches:', error);
        }
    }
    
    // Carica le partite di oggi
    async function loadTodayMatches() {
        try {
            const matches = await MatchPulseAPI.getTodayMatches();
            MatchPulseUI.renderTodayMatches(matches);
        } catch (error) {
            console.error('Error loading today matches:', error);
        }
    }
    
    // Carica i preferiti
    async function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('matchpulse_favorites') || '[]');
        const favoritesList = document.getElementById('favoritesList');
        
        if (!favoritesList) return;
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">Nessun preferito. Segui una partita per aggiungerla qui.</p>';
            return;
        }
        
        // Per ogni preferito, carica i dettagli
        const favoritesHtml = [];
        for (const matchId of favorites) {
            try {
                const match = await MatchPulseAPI.getMatchDetails(matchId);
                if (match) {
                    favoritesHtml.push(`
                        <div class="favorite-item" data-match-id="${match.id}">
                            <span style="font-size: 24px;">${match.homeTeam.logo}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${match.homeTeam.name} vs ${match.awayTeam.name}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${match.competition} - ${match.score.home}-${match.score.away}</div>
                            </div>
                            <span style="color: var(--accent-primary); font-weight: 700;">${match.status === 'LIVE' ? match.minute + "'" : match.time || ''}</span>
                        </div>
                    `);
                }
            } catch (error) {
                console.error('Error loading favorite:', error);
            }
        }
        
        favoritesList.innerHTML = favoritesHtml.join('');
        
        // Aggiungi click handler
        favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', () => {
                const matchId = item.getAttribute('data-match-id');
                MatchPulseUI.openMatchCenter(matchId);
            });
        });
    }
    
    // Avvia il refresh automatico dei dati
    function startAutoRefresh() {
        // Aggiorna i dati completi ogni 30 secondi
        refreshInterval = setInterval(async () => {
            await refreshFeaturedMatch();
            await loadLiveMatches();
        }, 30000);
    }
    
    // Aggiorna solo la partita in evidenza (controllo eventi)
    async function refreshFeaturedMatch() {
        if (!featuredMatchId) return;
        
        try {
            const match = await MatchPulseAPI.getMatchDetails(featuredMatchId);
            
            if (!match) return;
            
            // Aggiorna la UI
            MatchPulseUI.renderFeaturedMatch(match);
            
            // Controlla se ci sono nuovi eventi
            checkForNewEvents(match);
            
            // Aggiorna ultimo punteggio e minuto conosciuti
            lastKnownScore = { ...match.score };
            lastKnownMinute = match.minute || 0;
            if (match.events) {
                lastKnownEvents = [...match.events];
            }
            
        } catch (error) {
            console.error('Error refreshing featured match:', error);
        }
    }
    
    // Controlla se ci sono nuovi eventi e mostra popup
    function checkForNewEvents(match) {
        // Controlla gol
        if (match.score.home > lastKnownScore.home) {
            MatchPulsePopup.showEvent({
                type: 'goal',
                player: match.homeTeam.name + ' ha segnato!',
                team: match.homeTeam.name,
                minute: match.minute || lastKnownMinute
            });
            
            // Animazione sulla card
            const featuredCard = document.querySelector('.featured-card');
            if (featuredCard) {
                featuredCard.classList.add('goal-scored');
                setTimeout(() => {
                    featuredCard.classList.remove('goal-scored');
                }, 1000);
            }
        }
        
        if (match.score.away > lastKnownScore.away) {
            MatchPulsePopup.showEvent({
                type: 'goal',
                player: match.awayTeam.name + ' ha segnato!',
                team: match.awayTeam.name,
                minute: match.minute || lastKnownMinute
            });
            
            const featuredCard = document.querySelector('.featured-card');
            if (featuredCard) {
                featuredCard.classList.add('goal-scored');
                setTimeout(() => {
                    featuredCard.classList.remove('goal-scored');
                }, 1000);
            }
        }
        
        // Controlla nuovi eventi nella timeline
        if (match.events && match.events.length > lastKnownEvents.length) {
            const newEvents = match.events.slice(lastKnownEvents.length);
            
            newEvents.forEach(event => {
                let eventType = 'goal';
                
                if (event.type === 'goal') {
                    eventType = 'goal';
                } else if (event.type === 'yellow' || event.type === 'yellowCard') {
                    eventType = 'yellow';
                } else if (event.type === 'red' || event.type === 'redCard') {
                    eventType = 'red';
                } else if (event.type === 'substitution') {
                    eventType = 'substitution';
                }
                
                // Non mostrare di nuovo i gol già mostrati
                if (eventType !== 'goal' || !event.score) {
                    MatchPulsePopup.showEvent({
                        type: eventType,
                        player: event.player || event.name || 'Evento',
                        team: event.team === 'HOME' ? match.homeTeam.name : match.awayTeam.name,
                        minute: event.minute || match.minute
                    });
                }
            });
        }
        
        // Controlla fine partita
        if (match.status === 'FINISHED' && lastKnownMinute < 90) {
            MatchPulsePopup.showEvent({
                type: 'fulltime',
                player: 'Fine Partita',
                team: match.competition,
                minute: 90
            });
        }
        
        // Controlla intervallo
        if (match.status === 'PAUSED' || match.status === 'HALFTIME') {
            if (lastKnownMinute < 45) {
                MatchPulsePopup.showEvent({
                    type: 'halftime',
                    player: 'Intervallo',
                    team: match.competition,
                    minute: 45
                });
            }
        }
    }
    
    // Setup degli event listeners
    function setupEventListeners() {
        // Pulsante indietro Match Center
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                MatchPulseUI.closeMatchCenter();
            });
        }
        
        // Pulsante preferiti header
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) {
            favoritesBtn.addEventListener('click', () => {
                const favoritesSection = document.getElementById('favoritesSection');
                if (favoritesSection) {
                    favoritesSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Pulsante pin featured
        const pinBtn = document.getElementById('pinFeaturedBtn');
        if (pinBtn) {
            pinBtn.addEventListener('click', toggleFeaturedPin);
        }
        
        // Pulsante follow nel match center
        const followBtn = document.getElementById('followBtn');
        if (followBtn) {
            followBtn.addEventListener('click', () => {
                if (currentMatchId) {
                    MatchPulseUI.toggleFollowMatch(currentMatchId);
                }
            });
        }
        
        // Chiudi search modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const searchModal = document.getElementById('searchModal');
                if (searchModal && searchModal.classList.contains('active')) {
                    searchModal.classList.remove('active');
                }
                
                const matchCenter = document.getElementById('matchCenter');
                if (matchCenter && matchCenter.classList.contains('active')) {
                    MatchPulseUI.closeMatchCenter();
                }
            }
        });
        
        // Aggiorna la pagina quando torna visibile (per mobile)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('Page visible, refreshing data...');
                loadInitialData();
            }
        });
    }
    
    // Toggle pin partita in evidenza
    function toggleFeaturedPin() {
        if (!featuredMatchId) return;
        
        const pinBtn = document.getElementById('pinFeaturedBtn');
        const isPinned = localStorage.getItem('matchpulse_featured') === featuredMatchId;
        
        if (isPinned) {
            localStorage.removeItem('matchpulse_featured');
            if (pinBtn) pinBtn.classList.remove('active');
        } else {
            localStorage.setItem('matchpulse_featured', featuredMatchId);
            if (pinBtn) pinBtn.classList.add('active');
        }
    }
    
    // Aggiorna stato pulsante pin
    function updatePinButton() {
        const pinBtn = document.getElementById('pinFeaturedBtn');
        if (!pinBtn) return;
        
        const isPinned = localStorage.getItem('matchpulse_featured') === featuredMatchId;
        
        if (isPinned) {
            pinBtn.classList.add('active');
        } else {
            pinBtn.classList.remove('active');
        }
    }
    
    // Avvia l'app quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    return {
        init: init,
        loadFeaturedMatch: loadFeaturedMatch,
        loadLiveMatches: loadLiveMatches,
        loadTodayMatches: loadTodayMatches,
        refreshFeaturedMatch: refreshFeaturedMatch
    };
})();
