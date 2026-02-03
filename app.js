// Application State
const state = {
    heroCards: [],
    villainCards: [],
    boardCards: [],
    blinds: '',
    position: '',
    stack: '',
    activePlayers: [], // Players in the hand
    foldedPlayers: [], // Players who have folded this hand
    heroPlayer: '', // Which player is Hero
    currentStreet: 'preflop', // Which street we're recording actions for
    selectedPlayer: '',
    currentPlayerIndex: 0, // For auto-advancing
    pendingAction: null, // For bet/raise amounts
    actions: {
        preflop: [],
        flop: [],
        turn: [],
        river: []
    }
};

// Action order by street
const actionOrder = {
    preflop: ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
    flop: ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN'],
    turn: ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN'],
    river: ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN']
};

// Card data
const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const suits = {
    '♠': '#000',
    '♥': '#ef4444',
    '♦': '#ef4444',
    '♣': '#000'
};

// Get players in action order for current street
function getOrderedPlayers() {
    const order = actionOrder[state.currentStreet];
    // Filter to only include active players who haven't folded, in the correct order
    return order.filter(player => 
        state.activePlayers.includes(player) && !state.foldedPlayers.includes(player)
    );
}

// Auto-select next player
function autoSelectNextPlayer() {
    const orderedPlayers = getOrderedPlayers();
    
    if (orderedPlayers.length === 0) return;
    
    // Move to next player
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % orderedPlayers.length;
    state.selectedPlayer = orderedPlayers[state.currentPlayerIndex];
    
    // Highlight the button
    highlightPlayerButton(state.selectedPlayer);
}

// Highlight the current player button
function highlightPlayerButton(player) {
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('active'));
    const playerBtn = Array.from(document.querySelectorAll('.player-btn'))
        .find(btn => btn.dataset.player === player);
    if (playerBtn) {
        playerBtn.classList.add('active');
    }
    
    // Update action indicator
    const indicator = document.getElementById('actionIndicator');
    if (indicator) {
        indicator.textContent = `→ ${player} to act`;
    }
}

// Reset player index when street changes
function resetPlayerIndex() {
    state.currentPlayerIndex = -1;
    autoSelectNextPlayer();
}

// Update street indicator
function updateStreetIndicator() {
    const indicator = document.getElementById('streetIndicator');
    const boardCount = state.boardCards.length;
    
    if (boardCount === 0) {
        indicator.innerHTML = '';
    } else if (boardCount === 3) {
        indicator.innerHTML = '<span class="street-indicator">Flop</span>';
    } else if (boardCount === 4) {
        indicator.innerHTML = '<span class="street-indicator">Turn</span>';
    } else if (boardCount === 5) {
        indicator.innerHTML = '<span class="street-indicator">River</span>';
    }
}

// Render selected cards
function renderSelectedCards(cards, containerId) {
    const container = document.getElementById(containerId);
    
    if (cards.length === 0) {
        let label = 'Tap to select cards';
        if (containerId === 'heroSlot') label = 'Tap to select your cards';
        if (containerId === 'villainSlot') label = 'Tap to select villain cards';
        if (containerId === 'boardSlot') label = 'Tap to select board cards';
        
        container.innerHTML = `<span class="card-slot-label">${label}</span>`;
        container.classList.remove('has-cards');
    } else {
        const cardsHtml = cards.map(card => {
            const suit = card.slice(-1);
            const rank = card.slice(0, -1);
            const color = suits[suit];
            return `<div class="mini-card" style="color: ${color}">${rank}${suit}</div>`;
        }).join('');
        
        container.innerHTML = `<div class="selected-cards">${cardsHtml}</div>`;
        container.classList.add('has-cards');
    }
}

// Create card grid
function createCardGrid(selectedCards, maxCards, excludeCards = []) {
    const container = document.getElementById('cardGridContainer');
    container.innerHTML = '';
    
    Object.keys(suits).forEach(suit => {
        const grid = document.createElement('div');
        grid.className = 'card-grid';
        grid.style.marginBottom = '1rem';
        
        ranks.forEach(rank => {
            const cardValue = rank + suit;
            const isSelected = selectedCards.includes(cardValue);
            const isDisabled = !isSelected && selectedCards.length >= maxCards;
            const isExcluded = excludeCards.includes(cardValue);
            
            const button = document.createElement('button');
            button.className = 'card-btn';
            button.style.color = suits[suit];
            
            const rankSpan = document.createElement('div');
            rankSpan.className = 'card-rank';
            rankSpan.textContent = rank;
            
            const suitSpan = document.createElement('div');
            suitSpan.className = 'card-suit';
            suitSpan.textContent = suit;
            
            button.appendChild(rankSpan);
            button.appendChild(suitSpan);
            
            if (isSelected) {
                button.classList.add('selected');
            }
            
            if (isDisabled || isExcluded) {
                button.classList.add('disabled');
                button.disabled = true;
            }
            
            button.addEventListener('click', () => {
                if (isSelected) {
                    const index = selectedCards.indexOf(cardValue);
                    selectedCards.splice(index, 1);
                } else if (!isDisabled && !isExcluded) {
                    selectedCards.push(cardValue);
                }
                createCardGrid(selectedCards, maxCards, excludeCards);
            });
            
            grid.appendChild(button);
        });
        
        container.appendChild(grid);
    });
}

// Modal controls
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Hero cards slot
document.getElementById('heroSlot').addEventListener('click', () => {
    document.getElementById('cardModalTitle').textContent = 'Select Hero Cards (2)';
    const tempCards = [...state.heroCards];
    const excludeCards = [...state.villainCards, ...state.boardCards];
    createCardGrid(tempCards, 2, excludeCards);
    openModal('cardModal');
    
    const closeBtn = document.getElementById('closeCardModal');
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener('click', () => {
        if (tempCards.length === 2) {
            state.heroCards = tempCards;
            renderSelectedCards(state.heroCards, 'heroSlot');
        }
        closeModal('cardModal');
    });
});

// Villain cards slot
document.getElementById('villainSlot').addEventListener('click', () => {
    document.getElementById('cardModalTitle').textContent = 'Select Villain Cards (2)';
    const tempCards = [...state.villainCards];
    const excludeCards = [...state.heroCards, ...state.boardCards];
    createCardGrid(tempCards, 2, excludeCards);
    openModal('cardModal');
    
    const closeBtn = document.getElementById('closeCardModal');
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener('click', () => {
        state.villainCards = tempCards;
        renderSelectedCards(state.villainCards, 'villainSlot');
        closeModal('cardModal');
    });
});

// Board cards slot
document.getElementById('boardSlot').addEventListener('click', () => {
    document.getElementById('cardModalTitle').textContent = 'Select Board Cards (up to 5)';
    const tempCards = [...state.boardCards];
    const excludeCards = [...state.heroCards, ...state.villainCards];
    createCardGrid(tempCards, 5, excludeCards);
    openModal('cardModal');
    
    const closeBtn = document.getElementById('closeCardModal');
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener('click', () => {
        state.boardCards = tempCards;
        renderSelectedCards(state.boardCards, 'boardSlot');
        updateStreetIndicator();
        closeModal('cardModal');
    });
});

// Blinds input
document.getElementById('blindsInput').addEventListener('input', (e) => {
    state.blinds = e.target.value;
});

// Position display
document.getElementById('positionDisplay').addEventListener('click', () => {
    openModal('positionModal');
});

document.querySelectorAll('#positionModal .position-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.position = btn.dataset.position;
        document.querySelector('#positionDisplay .position-value').textContent = state.position;
        document.getElementById('positionDisplay').classList.add('selected');
        closeModal('positionModal');
    });
});

document.getElementById('closePositionModal').addEventListener('click', () => {
    closeModal('positionModal');
});

// Stack display
document.getElementById('stackDisplay').addEventListener('click', () => {
    openModal('stackModal');
});

document.querySelectorAll('.stack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.stack = btn.dataset.stack;
        document.querySelector('#stackDisplay .position-value').textContent = state.stack;
        document.getElementById('stackDisplay').classList.add('selected');
        closeModal('stackModal');
    });
});

document.getElementById('customStack').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const value = e.target.value.trim();
        if (value) {
            state.stack = value;
            document.querySelector('#stackDisplay .position-value').textContent = value;
            document.getElementById('stackDisplay').classList.add('selected');
            e.target.value = '';
            closeModal('stackModal');
        }
    }
});

document.getElementById('closeStackModal').addEventListener('click', () => {
    closeModal('stackModal');
});

// Configure Players
document.getElementById('configurePlayersBtn').addEventListener('click', () => {
    openModal('playersModal');
    updatePlayersModal();
});

function updatePlayersModal() {
    // Update player selection buttons
    document.querySelectorAll('#allPlayersGrid .position-btn').forEach(btn => {
        if (state.activePlayers.includes(btn.dataset.player)) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    // Update hero selection grid
    const heroGrid = document.getElementById('heroSelectGrid');
    heroGrid.innerHTML = '';
    
    state.activePlayers.forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'btn position-btn';
        btn.dataset.player = player;
        btn.textContent = player;
        
        if (state.heroPlayer === player) {
            btn.classList.add('selected');
            btn.style.background = 'var(--accent-gold)';
            btn.style.color = 'var(--bg-primary)';
        }
        
        btn.addEventListener('click', () => {
            state.heroPlayer = player;
            updatePlayersModal();
        });
        
        heroGrid.appendChild(btn);
    });
}

// All players grid - toggle selection
document.querySelectorAll('#allPlayersGrid .position-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const player = btn.dataset.player;
        const index = state.activePlayers.indexOf(player);
        
        if (index > -1) {
            state.activePlayers.splice(index, 1);
            // If this was the hero, clear hero
            if (state.heroPlayer === player) {
                state.heroPlayer = '';
            }
        } else {
            state.activePlayers.push(player);
        }
        
        updatePlayersModal();
    });
});

// Save players configuration
document.getElementById('savePlayersBtn').addEventListener('click', () => {
    if (state.activePlayers.length === 0) {
        alert('Please select at least one player');
        return;
    }
    
    // Clear any previous folded players when reconfiguring
    state.foldedPlayers = [];
    updateActivePlayerGrid();
    resetPlayerIndex();
    closeModal('playersModal');
});

document.getElementById('closePlayersModal').addEventListener('click', () => {
    closeModal('playersModal');
});

// Street selection
document.querySelectorAll('.street-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.street-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentStreet = btn.dataset.street;
        resetPlayerIndex();
    });
});

// Action buttons
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!state.selectedPlayer) {
            alert('Please select a player first');
            return;
        }
        
        const action = btn.dataset.action;
        
        // If Bet or Raise, open amount modal
        if (action === 'Bet' || action === 'Raise') {
            state.pendingAction = action;
            document.getElementById('betAmountTitle').textContent = `Enter ${action} Amount`;
            document.getElementById('betAmountInput').value = '';
            openModal('betAmountModal');
        } else {
            // Record action immediately
            recordAction(state.selectedPlayer, action);
        }
    });
});

// Bet amount confirmation
document.getElementById('confirmBetAmount').addEventListener('click', () => {
    const amount = document.getElementById('betAmountInput').value.trim();
    if (!amount) {
        alert('Please enter an amount');
        return;
    }
    
    const fullAction = `${state.pendingAction} ${amount}`;
    recordAction(state.selectedPlayer, fullAction);
    closeModal('betAmountModal');
    state.pendingAction = null;
});

document.getElementById('closeBetAmountModal').addEventListener('click', () => {
    closeModal('betAmountModal');
    state.pendingAction = null;
});

// Allow Enter key in bet amount input
document.getElementById('betAmountInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('confirmBetAmount').click();
    }
});

// Record action
function recordAction(player, action) {
    const actionText = `${player}: ${action}`;
    state.actions[state.currentStreet].push(actionText);
    updateActionLog();
    
    // If player folded, add them to folded list and update UI
    if (action === 'Fold') {
        if (!state.foldedPlayers.includes(player)) {
            state.foldedPlayers.push(player);
            updateActivePlayerGrid();
        }
    }
    
    // Auto-advance to next player
    autoSelectNextPlayer();
}

// Undo last action
document.getElementById('undoActionBtn').addEventListener('click', () => {
    const currentActions = state.actions[state.currentStreet];
    if (currentActions.length > 0) {
        const lastAction = currentActions.pop();
        
        // If the undone action was a fold, remove player from folded list
        if (lastAction.includes(': Fold')) {
            const player = lastAction.split(':')[0];
            const index = state.foldedPlayers.indexOf(player);
            if (index > -1) {
                state.foldedPlayers.splice(index, 1);
                updateActivePlayerGrid();
            }
        }
        
        updateActionLog();
        
        // Go back to previous player
        const orderedPlayers = getOrderedPlayers();
        if (orderedPlayers.length > 0) {
            state.currentPlayerIndex = (state.currentPlayerIndex - 1 + orderedPlayers.length) % orderedPlayers.length;
            state.selectedPlayer = orderedPlayers[state.currentPlayerIndex];
            highlightPlayerButton(state.selectedPlayer);
        }
    } else {
        alert('No actions to undo on current street');
    }
});

// Update action log
function updateActionLog() {
    ['preflop', 'flop', 'turn', 'river'].forEach(street => {
        const logElement = document.getElementById(`log${street.charAt(0).toUpperCase() + street.slice(1)}`);
        logElement.innerHTML = state.actions[street]
            .map(action => `<div class="action-item">${action}</div>`)
            .join('');
    });
}

// Save hand
document.getElementById('saveBtn').addEventListener('click', () => {
    if (state.heroCards.length !== 2) {
        alert('Please select your 2 hero cards');
        return;
    }
    
    if (!state.blinds) {
        alert('Please enter blinds');
        return;
    }
    
    const hand = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        heroCards: state.heroCards,
        villainCards: state.villainCards,
        boardCards: state.boardCards,
        blinds: state.blinds,
        position: state.position,
        stack: state.stack,
        activePlayers: [...state.activePlayers],
        heroPlayer: state.heroPlayer,
        actions: { ...state.actions }
    };
    
    // Get existing hands
    const hands = JSON.parse(localStorage.getItem('pokerHands') || '[]');
    hands.push(hand);
    localStorage.setItem('pokerHands', JSON.stringify(hands));
    
    alert('Hand saved successfully!');
    
    // Reset state
    resetHand();
});

// Reset hand
function resetHand() {
    state.heroCards = [];
    state.villainCards = [];
    state.boardCards = [];
    state.blinds = '';
    state.position = '';
    state.stack = '';
    state.activePlayers = [];
    state.foldedPlayers = [];
    state.heroPlayer = '';
    state.currentStreet = 'preflop';
    state.selectedPlayer = '';
    state.currentPlayerIndex = 0;
    state.pendingAction = null;
    state.actions = {
        preflop: [],
        flop: [],
        turn: [],
        river: []
    };
    
    renderSelectedCards([], 'heroSlot');
    renderSelectedCards([], 'villainSlot');
    renderSelectedCards([], 'boardSlot');
    updateStreetIndicator();
    updateActionLog();
    
    document.getElementById('blindsInput').value = '';
    document.getElementById('selectedPlayersContainer').style.display = 'none';
    document.querySelectorAll('.street-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.street-btn[data-street="preflop"]').classList.add('active');
    document.querySelector('#positionDisplay .position-value').textContent = '—';
    document.querySelector('#stackDisplay .position-value').textContent = '—';
    document.getElementById('positionDisplay').classList.remove('selected');
    document.getElementById('stackDisplay').classList.remove('selected');
}

// View history
document.getElementById('viewHistoryBtn').addEventListener('click', () => {
    displayHistory();
});

function displayHistory() {
    const hands = JSON.parse(localStorage.getItem('pokerHands') || '[]');
    const historyList = document.getElementById('historyList');
    
    if (hands.length === 0) {
        historyList.innerHTML = '<div class="action-item" style="text-align: center; padding: 2rem;">No hands saved yet</div>';
    } else {
        historyList.innerHTML = hands.reverse().map((hand, index) => {
            const actualIndex = hands.length - 1 - index; // Get original index
            
            const heroCardsHtml = hand.heroCards.map(card => {
                const suit = card.slice(-1);
                const rank = card.slice(0, -1);
                const color = suits[suit];
                return `<span style="color: ${color}">${rank}${suit}</span>`;
            }).join(' ');
            
            const villainCardsHtml = hand.villainCards && hand.villainCards.length > 0 
                ? hand.villainCards.map(card => {
                    const suit = card.slice(-1);
                    const rank = card.slice(0, -1);
                    const color = suits[suit];
                    return `<span style="color: ${color}">${rank}${suit}</span>`;
                }).join(' ')
                : '<span style="color: var(--text-secondary);">Unknown</span>';
            
            const boardCardsHtml = hand.boardCards && hand.boardCards.length > 0
                ? hand.boardCards.map(card => {
                    const suit = card.slice(-1);
                    const rank = card.slice(0, -1);
                    const color = suits[suit];
                    return `<span style="color: ${color}">${rank}${suit}</span>`;
                }).join(' ')
                : '<span style="color: var(--text-secondary);">None</span>';
            
            // Build action columns
            const actionsHtml = `
                <div class="history-actions-grid">
                    <div class="history-street-column">
                        <div class="history-street-title">Preflop</div>
                        ${hand.actions.preflop.map(a => `<div class="action-item">${a}</div>`).join('') || '<div class="action-item" style="color: var(--text-secondary);">None</div>'}
                    </div>
                    <div class="history-street-column">
                        <div class="history-street-title">Flop</div>
                        ${hand.actions.flop.map(a => `<div class="action-item">${a}</div>`).join('') || '<div class="action-item" style="color: var(--text-secondary);">None</div>'}
                    </div>
                    <div class="history-street-column">
                        <div class="history-street-title">Turn</div>
                        ${hand.actions.turn.map(a => `<div class="action-item">${a}</div>`).join('') || '<div class="action-item" style="color: var(--text-secondary);">None</div>'}
                    </div>
                    <div class="history-street-column">
                        <div class="history-street-title">River</div>
                        ${hand.actions.river.map(a => `<div class="action-item">${a}</div>`).join('') || '<div class="action-item" style="color: var(--text-secondary);">None</div>'}
                    </div>
                </div>
            `;
            
            const playersInfo = hand.activePlayers && hand.activePlayers.length > 0
                ? `<strong>Players:</strong> ${hand.activePlayers.join(', ')} ${hand.heroPlayer ? `(Hero: ${hand.heroPlayer})` : ''}<br>`
                : '';
            
            return `
                <div class="history-item" data-hand-index="${actualIndex}">
                    <div class="history-date">${hand.date} <span class="expand-indicator">▼ Click to expand</span></div>
                    <div class="history-details">
                        <div>
                            <strong>Hero:</strong> ${heroCardsHtml}<br>
                            <strong>Villain:</strong> ${villainCardsHtml}<br>
                            <strong>Board:</strong> ${boardCardsHtml}<br>
                            <strong>Blinds:</strong> ${hand.blinds} | 
                            <strong>Pos:</strong> ${hand.position || 'N/A'} | 
                            <strong>Stack:</strong> ${hand.stack || 'N/A'}
                        </div>
                    </div>
                    <div class="history-expanded-content">
                        ${playersInfo}
                        <strong>Actions:</strong>
                        ${actionsHtml}
                        <button class="delete-hand-btn" onclick="deleteHand(${actualIndex})">🗑️ Delete Hand</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click handlers to expand/collapse
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't toggle if clicking delete button
                if (e.target.classList.contains('delete-hand-btn')) {
                    return;
                }
                item.classList.toggle('expanded');
                const indicator = item.querySelector('.expand-indicator');
                if (item.classList.contains('expanded')) {
                    indicator.textContent = '▲ Click to collapse';
                } else {
                    indicator.textContent = '▼ Click to expand';
                }
            });
        });
    }
    
    openModal('historyModal');
}

// Delete hand function
window.deleteHand = function(index) {
    if (!confirm('Are you sure you want to delete this hand?')) {
        return;
    }
    
    const hands = JSON.parse(localStorage.getItem('pokerHands') || '[]');
    hands.splice(index, 1);
    localStorage.setItem('pokerHands', JSON.stringify(hands));
    
    // Refresh the history display
    displayHistory();
};

document.getElementById('closeHistoryModal').addEventListener('click', () => {
    closeModal('historyModal');
});

// Close modals on background click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

function updateActivePlayerGrid() {
    const activeGrid = document.getElementById('activePlayerGrid');
    activeGrid.innerHTML = '';
    
    // Show only players who haven't folded
    const playersToShow = state.activePlayers.filter(player => 
        !state.foldedPlayers.includes(player)
    );
    
    playersToShow.forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'btn player-btn';
        btn.dataset.player = player;
        btn.textContent = player;
        
        if (player === state.heroPlayer) {
            btn.innerHTML = `${player} ⭐`;
        }
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedPlayer = player;
            
            // Update current player index to match manual selection
            const orderedPlayers = getOrderedPlayers();
            state.currentPlayerIndex = orderedPlayers.indexOf(player);
        });
        
        activeGrid.appendChild(btn);
    });
    
    if (playersToShow.length > 0) {
        document.getElementById('selectedPlayersContainer').style.display = 'block';
        // Re-initialize player selection after grid update
        const orderedPlayers = getOrderedPlayers();
        if (orderedPlayers.length > 0 && !orderedPlayers.includes(state.selectedPlayer)) {
            // If current player folded, move to next
            state.currentPlayerIndex = -1;
            autoSelectNextPlayer();
        } else {
            highlightPlayerButton(state.selectedPlayer);
        }
    } else {
        // All players folded - hand is over
        document.getElementById('selectedPlayersContainer').style.display = 'block';
        const indicator = document.getElementById('actionIndicator');
        if (indicator) {
            indicator.textContent = '✓ Hand complete';
        }
    }
}

// Keyboard shortcuts for faster input
document.addEventListener('keydown', (e) => {
    // Show shortcuts help
    if (e.key === '?' && e.shiftKey) {
        openModal('shortcutsModal');
        return;
    }
    
    // Only activate if not typing in an input
    if (e.target.tagName === 'INPUT') return;
    
    // Number keys 1-9 for player selection (if players are configured)
    if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const playerBtns = document.querySelectorAll('.player-btn');
        if (playerBtns[index]) {
            playerBtns[index].click();
        }
    }
    
    // Action shortcuts
    if (state.selectedPlayer) {
        if (e.key === 'f' || e.key === 'F') {
            // Fold
            document.querySelector('.action-btn[data-action="Fold"]').click();
        } else if (e.key === 'c' || e.key === 'C') {
            // Call
            document.querySelector('.action-btn[data-action="Call"]').click();
        } else if (e.key === 'k' || e.key === 'K') {
            // Check
            document.querySelector('.action-btn[data-action="Check"]').click();
        } else if (e.key === 'b' || e.key === 'B') {
            // Bet
            document.querySelector('.action-btn[data-action="Bet"]').click();
        } else if (e.key === 'r' || e.key === 'R') {
            // Raise
            document.querySelector('.action-btn[data-action="Raise"]').click();
        } else if (e.key === 'a' || e.key === 'A') {
            // All-in
            document.querySelector('.action-btn[data-action="All-in"]').click();
        }
    }
    
    // Undo with Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        document.getElementById('undoActionBtn').click();
    }
});

document.getElementById('closeShortcutsModal').addEventListener('click', () => {
    closeModal('shortcutsModal');
});

// Initialize
renderSelectedCards(state.heroCards, 'heroSlot');
renderSelectedCards(state.villainCards, 'villainSlot');
renderSelectedCards(state.boardCards, 'boardSlot');
updateActionLog();
