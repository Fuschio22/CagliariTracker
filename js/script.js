/**
 * MatchPulse API Module
 * Handles all data fetching and management
 * Separated from UI for better maintainability
 */

const MatchPulseAPI = (() => {
    // Base URL for API (can be changed for different providers)
    const API_BASE_URL = 'https://api.football-data.org/v4';
    const API_KEY = ''; // Add your API key here
    
    // Cache for API responses
    const cache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    /**
     * Fetch data from API with caching
     */
    async function fetchData(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'X-Auth-Token': API_KEY,
                    'Content-Type': 'application/json'
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    }
    
    /**
     * Get all competitions
     */
    async function getCompetitions() {
        // Mock data for demo - replace with actual API call
        return [
            { id: 'SA', name: 'Serie A', country: 'Italy', logo: '🇮🇹' },
            { id: 'PL', name: 'Premier League', country: 'England', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
            { id: 'CL', name: 'Champions League', country: 'Europe', logo: '🏆' },
            { id: 'EL', name: 'Europa League', country: 'Europe', logo: '🥈' },
            { id: 'WC', name: 'Mondiale', country: 'World', logo: '🌍' },
            { id: 'CI', name: 'Coppa Italia', country: 'Italy', logo: '🏆' }
        ];
    }
    
    /**
     * Get live matches
     */
    async function getLiveMatches() {
        // Mock data for demo
        return [
            {
                id: 'match-1',
                homeTeam: { name: 'Inter', logo: '⚫', shortName: 'INT' },
                awayTeam: { name: 'Milan', logo: '🔴', shortName: 'MIL' },
                score: { home: 2, away: 1 },
                status: 'LIVE',
                minute: 67,
                competition: 'Serie A',
                stadium: 'San Siro',
                lastEvent: 'Gol! Lautaro Martinez (67\')'
            },
            {
                id: 'match-2',
                homeTeam: { name: 'Juventus', logo: '⚪', shortName: 'JUV' },
                awayTeam: { name: 'Roma', logo: '🟡', shortName: 'ROM' },
                score: { home: 1, away: 1 },
                status: 'LIVE',
                minute: 45,
                competition: 'Serie A',
                stadium: 'Allianz Stadium',
                lastEvent: 'Cartellino giallo (43\')'
            }
        ];
    }
    
    /**
     * Get today's matches
     */
    async function getTodayMatches() {
        // Mock data for demo
        return [
            {
                id: 'match-3',
                homeTeam: { name: 'Napoli', logo: '🔵', shortName: 'NAP' },
                awayTeam: { name: 'Lazio', logo: '🦅', shortName: 'LAZ' },
                score: { home: 0, away: 0 },
                status: 'SCHEDULED',
                time: '20:45',
                competition: 'Serie A',
                stadium: 'Diego Armando Maradona'
            },
            {
                id: 'match-4',
                homeTeam: { name: 'Atalanta', logo: '⚡', shortName: 'ATA' },
                awayTeam: { name: 'Fiorentina', logo: '🟣', shortName: 'FIO' },
                score: { home: 0, away: 0 },
                status: 'SCHEDULED',
                time: '18:30',
                competition: 'Serie A',
                stadium: 'Gewiss Stadium'
            }
        ];
    }
    
    /**
     * Get featured match
     */
    async function getFeaturedMatch() {
        const liveMatches = await getLiveMatches();
        return liveMatches[0] || null;
    }
    
    /**
     * Get match details
     */
    async function getMatchDetails(matchId) {
        // Mock data for demo
        return {
            id: matchId,
            homeTeam: { 
                name: 'Inter', 
                logo: '⚫', 
                shortName: 'INT',
                formation: '3-5-2',
                lineup: ['Handanovic', 'Bastoni', 'De Vrij', 'Scriniar', 'Dimarco', 'Barella', 'Calhanoglu', 'Mkhitaryan', 'Darmian', 'Lautaro', 'Dzeko'],
                subs: ['Onana', 'Bellanova', 'Correa']
            },
            awayTeam: { 
                name: 'Milan', 
                logo: '🔴', 
                shortName: 'MIL',
                formation: '4-3-3',
                lineup: ['Maignan', 'Calabria', 'Tomori', 'Kjaer', 'Theo', 'Tonali', 'Bennacer', 'Diaz', 'Saelemaekers', 'Giroud', 'Leao'],
                subs: ['Tatarusanu', 'Kalulu', 'Origi
