document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Elementos da nova funcionalidade
    const nicknameOverlay = document.getElementById('nickname-overlay');
    const nicknameInput = document.getElementById('nickname-input');
    const startGameButton = document.getElementById('start-game-button');
    const gameContainer = document.getElementById('game-container');
    const playerNicknameEl = document.getElementById('player-nickname');
    const leaderboardListEl = document.getElementById('leaderboard-list');

    // Elementos originais
    const canvas = document.getElementById('wheel'), ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spin-button'), clearButton = document.getElementById('clear-button');
    const balanceEl = document.getElementById('balance'), totalBetEl = document.getElementById('total-bet'), resultEl = document.getElementById('result');
    const betAmountInput = document.getElementById('bet-amount'), bettingTable = document.getElementById('betting-table');
    const messageBox = document.getElementById('message-box'), messageTitle = document.getElementById('message-title'), messageText = document.getElementById('message-text'), messageClose = document.getElementById('message-close');
    const loanSidebar = document.getElementById('loan-sidebar'), loanToggle = document.getElementById('loan-toggle');
    const loanRequestArea = document.getElementById('loan-request-area'), loanStatusArea = document.getElementById('loan-status-area'), loanAmountInput = document.getElementById('loan-amount'), requestLoanButton = document.getElementById('request-loan-button'), loanDueAmountEl = document.getElementById('loan-due-amount'), loanTimerEl = document.getElementById('loan-timer'), payLoanButton = document.getElementById('pay-loan-button');
    const loanSharkOverlay = document.getElementById('loan-shark-overlay'), restartButton = document.getElementById('restart-button');
    const historyDisplay = document.getElementById('history-display'), neighborsBetButton = document.getElementById('neighbors-bet-button');
    const eventNotificationBar = document.getElementById('event-notification-bar');
    const vipLevelEl = document.getElementById('vip-level'), vipXpEl = document.getElementById('vip-xp');
    const achievementsList = document.getElementById('achievements-list');
    const notificationBox = document.getElementById('notification-box'), notificationTitle = document.getElementById('notification-title'), notificationMessage = document.getElementById('notification-message');
    const sidebarTabs = document.querySelectorAll('.sidebar-tab'), sidebarContents = document.querySelectorAll('.sidebar-content');
    const addCardSection = document.getElementById('add-card-section'), manageCardSection = document.getElementById('manage-card-section');
    const cardNumberInput = document.getElementById('card-number'), cardExpiryInput = document.getElementById('card-expiry'), cardCvvInput = document.getElementById('card-cvv');
    const saveCardButton = document.getElementById('save-card-button'), forgetCardButton = document.getElementById('forget-card-button');
    const addFundsButton = document.getElementById('add-funds-button'), fundsAmountInput = document.getElementById('funds-amount');
    const savedCardNumberEl = document.getElementById('saved-card-number'), cardLimitEl = document.getElementById('card-limit'), vipBonusTextEl = document.getElementById('vip-bonus-text');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositToCardButton = document.getElementById('deposit-to-card-button');
    const unlockedAchievementsDisplay = document.getElementById('unlocked-achievements-display'); 
    const storeList = document.getElementById('store-list');
    const inventoryList = document.getElementById('inventory-list');
    const cashWadDisplay = document.getElementById('cash-wad-display');
    const sidebarRestartButton = document.getElementById('sidebar-restart-button');

    // --- Game Configuration & State ---
    const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const LOAN_SHARK_THRESHOLD = -5000;
    const LOAN_DURATION = 30 * 60 * 1000; // 30 minutos em ms
    const LOAN_INTEREST_RATE = 0.15; // 15%
    const LOAN_INTEREST_PERIOD = 10 * 60 * 1000; // 10 minutos em ms
    let gameState = {};
    
    const defaultState = {
        playerName: null, // NOVO ESTADO
        balance: 200,
        totalBet: 0,
        bets: {},
        isSpinning: false,
        currentAngle: 0,
        loanPrincipal: 0,
        loanTakenTimestamp: null,
        loanTimerInterval: null,
        despairTimerInterval: null,
        savedCardDetails: null,
        cardLimit: 0,
        cardLimitInterval: null,
        numberHistory: [],
        isNeighborsBetActive: false,
        spinCount: 0,
        activeEvent: null,
        playerXP: 0,
        consecutiveRedWins: 0,
        consecutiveStraightUpWins: 0, 
        wonOnColumns: { '1': false, '2': false, '3': false }, 
        playerItems: {
            lucky_chip: 0,
            amulet_of_zero: 0,
            xp_magnet: 0,
            heat_map_spins_left: 0
        },
        activeItems: {
            isLuckyChipInUse: false,
            isXpMagnetActive: false,
        },
        achievements: {
            'win_on_7': { title: 'Número da Sorte', description: 'Ganhe uma aposta no número 7.', unlocked: false, icon: '7️⃣' },
            'pay_loan': { title: 'Homem de Negócios', description: 'Pague um empréstimo com sucesso.', unlocked: false, icon: '💼' },
            'five_reds': { title: 'Maré Vermelha', description: 'Ganhe 5x seguidas apostando no Vermelho.', unlocked: false, icon: '🔴' },
            'all_in_win': { title: 'Apostador Nato', description: 'Ganhe uma aposta usando todo o seu saldo (mín R$100).', unlocked: false, icon: '💥' },
            'reach_gold': { title: 'Membro de Honra', description: 'Alcance o nível VIP Ouro.', unlocked: false, icon: '🏆' },
            'touched_by_midas': { title: 'Tocado por Midas', description: 'Alcance um saldo de R$100.000.', unlocked: false, icon: '💰' },
            'the_prophet': { title: 'O Profeta', description: 'Ganhe uma aposta de número pleno 3x seguidas.', unlocked: false, icon: '🔮' },
            'russian_roulette': { title: 'Roleta Russa', description: 'Ganhe apostando em um único número na rodada.', unlocked: false, icon: '🎯' },
            'column_specialist': { title: 'Especialista em Colunas', description: 'Ganhe uma aposta em cada uma das 3 colunas.', unlocked: false, icon: '🏛️' },
            'collector': { title: 'Colecionador', description: 'Possua todos os itens da loja ao mesmo tempo.', unlocked: false, icon: '📦' },
        }
    };

    const vipLevels = [
        { name: 'Bronze', xp_required: 0, card_limit_bonus: 0 },
        { name: 'Prata', xp_required: 5000, card_limit_bonus: 1000 },
        { name: 'Ouro', xp_required: 25000, card_limit_bonus: 5000 },
        { name: 'Platina', xp_required: 100000, card_limit_bonus: 20000 },
    ];

    const storeItems = {
        lucky_chip: { name: "Ficha da Sorte", description: "Pague 3x em apostas de Cor (uso único).", cost: 500, usable: true },
        amulet_of_zero: { name: "Amuleto do Zero", description: "Se o resultado for 0, receba suas apostas de volta (uso único).", cost: 1000, usable: false },
        xp_magnet: { name: "Ímã de XP", description: "Dobre o XP ganho na próxima vitória (uso único).", cost: 750, usable: true },
        heat_map: { name: "Mapa de Calor", description: "Destaca os 5 números mais quentes por 3 rodadas.", cost: 300, usable: false }
    };

    // --- Core Functions ---
    
    // MODIFICADO: Salva o estado para o jogador atual.
    function saveState() {
        if (!gameState.playerName) return; // Não salva se não houver jogador definido
        localStorage.setItem(`rouletteGameState_${gameState.playerName}`, JSON.stringify(gameState));
        updateLeaderboard(gameState.playerName, gameState.balance);
    }

    // MODIFICADO: Carrega o estado do jogador especificado.
    function loadState(playerName) {
        const savedState = localStorage.getItem(`rouletteGameState_${playerName}`);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            gameState = {
                ...defaultState,
                ...parsedState,
                achievements: { ...defaultState.achievements, ...parsedState.achievements },
                wonOnColumns: { ...defaultState.wonOnColumns, ...parsedState.wonOnColumns },
                playerItems: { ...defaultState.playerItems, ...parsedState.playerItems },
                activeItems: { ...defaultState.activeItems, ...parsedState.activeItems },
            };
        } else {
            // Se não há estado salvo, cria um novo a partir do padrão.
            gameState = JSON.parse(JSON.stringify(defaultState));
            gameState.playerName = playerName;
        }
    }
    
    // MODIFICADO: Reseta o jogo para o jogador atual.
    function resetGame() {
        if (confirm("Tem certeza que deseja recomeçar? Todo o seu progresso (saldo, VIP, conquistas) será perdido e você voltará para a tela de apelido.")) {
            if(gameState.despairTimerInterval) clearTimeout(gameState.despairTimerInterval);
            // Remove o estado do jogador atual e a marcação de "último jogador".
            localStorage.removeItem(`rouletteGameState_${gameState.playerName}`);
            localStorage.removeItem('rouletteLastPlayer');
            location.reload();
        }
    }

    // MODIFICADO: Lógica de inicialização principal.
    function initialize() {
        const lastPlayer = localStorage.getItem('rouletteLastPlayer');
        if (lastPlayer) {
            // Se existe um último jogador, carrega o jogo diretamente.
            loadState(lastPlayer);
            nicknameOverlay.style.display = 'none';
            gameContainer.style.display = 'block';
            startGame();
        } else {
            // Caso contrário, mostra a tela de apelido.
            nicknameOverlay.style.display = 'flex';
            gameContainer.style.display = 'none';
        }
    }

    // NOVO: Lida com o clique no botão de iniciar jogo.
    function handleStartGame() {
        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            alert('Por favor, insira um apelido.');
            return;
        }
        
        loadState(nickname); // Carrega os dados do jogador ou cria um novo.
        localStorage.setItem('rouletteLastPlayer', nickname); // Define como o último jogador ativo.

        nicknameOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
        
        saveState();
        startGame();
    }

    // NOVO: Contém a lógica de preparação do jogo.
    function startGame() {
        drawRouletteWheel();
        if (gameState.savedCardDetails) {
            startCardLimitTimer();
        }
        if (gameState.loanPrincipal > 0) {
            startLoanTimers();
        }
        createNumberGrid();
        updateAllUI();
    }
    
    // MODIFICADO: Atualiza toda a interface do usuário.
    function updateAllUI() {
        playerNicknameEl.textContent = gameState.playerName || '';
        updatePlayerStatsUI();
        updateChipsOnBoardUI();
        updateWalletUI();
        updateStoreAndInventoryUI();
        updateVipUI();
        updateHistoryUI();
        updateAchievementsUI();
        updateUnlockedAchievementsDisplay();
        updateLoanUI();
        updateLeaderboardUI(); // Atualiza o ranking
        
        if (gameState.balance <= LOAN_SHARK_THRESHOLD && !gameState.isSpinning) {
            triggerLoanSharkEvent();
        }

        checkDespairState();
    }

    // NOVO: Atualiza o ranking de jogadores.
    function updateLeaderboard(name, balance) {
        if (!name) return;
        let leaderboard = [];
        try {
            leaderboard = JSON.parse(localStorage.getItem('rouletteLeaderboard')) || [];
        } catch (e) {
            leaderboard = [];
        }

        const playerIndex = leaderboard.findIndex(p => p.name === name);
        
        if (playerIndex > -1) {
            leaderboard[playerIndex].balance = balance;
        } else {
            leaderboard.push({ name, balance });
        }

        leaderboard.sort((a, b) => b.balance - a.balance);
        localStorage.setItem('rouletteLeaderboard', JSON.stringify(leaderboard));
    }

    // NOVO: Atualiza a exibição do ranking na tela.
    function updateLeaderboardUI() {
        leaderboardListEl.innerHTML = '';
        let leaderboard = [];
        try {
             leaderboard = JSON.parse(localStorage.getItem('rouletteLeaderboard')) || [];
        } catch (e) {
             leaderboard = [];
        }

        if (leaderboard.length === 0) {
            leaderboardListEl.innerHTML = '<p class="text-gray-500 text-center">Ainda não há jogadores no ranking.</p>';
            return;
        }

        const topPlayers = leaderboard.slice(0, 10);

        topPlayers.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-gray-900/50 p-2 rounded-lg';
            
            if (player.name === gameState.playerName) {
                li.classList.add('border-2', 'border-yellow-400');
            }

            const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-yellow-600' : 'text-gray-500';

            li.innerHTML = `
                <div class="flex items-center">
                    <span class="font-bold ${rankColor} w-8">${index + 1}.</span>
                    <span class="font-semibold">${player.name}</span>
                </div>
                <span class="font-bold text-green-400">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(player.balance)}</span>
            `;
            leaderboardListEl.appendChild(li);
        });
    }
    
    // --- Funções Originais do Jogo (Mantidas intactas) ---

    function updatePlayerStatsUI() {
        balanceEl.textContent = `R$${gameState.balance.toFixed(2)}`;
        balanceEl.classList.toggle('text-red-400', gameState.balance < 0);
        balanceEl.classList.toggle('text-green-400', gameState.balance >= 0);
        totalBetEl.textContent = `R$${gameState.totalBet.toFixed(2)}`;
        updateCashWadDisplay();
    }
    
    function placeBet(type, value) {
        if (gameState.isSpinning) return;
        const amount = parseInt(betAmountInput.value);
        if (isNaN(amount) || amount <= 0) { alert("Aposta inválida."); return; }
        if (gameState.isNeighborsBetActive && type === 'number') {
            const totalNeighborsBetAmount = amount * 5;
            if(totalNeighborsBetAmount > gameState.balance) { alert("Saldo insuficiente para aposta de vizinhos."); return; }
            
            const wheelIndex = numbers.indexOf(parseInt(value));
            if (wheelIndex === -1) return;
            
            for(let i = -2; i <= 2; i++) {
                let neighborIndex = (wheelIndex + i + numbers.length) % numbers.length;
                let neighborValue = numbers[neighborIndex];
                const betKey = `number_${neighborValue}`;
                gameState.bets[betKey] = (gameState.bets[betKey] || 0) + amount;
            }
            gameState.totalBet += totalNeighborsBetAmount;
            gameState.balance -= totalNeighborsBetAmount;
        } else {
            if (amount > gameState.balance) { alert("Saldo insuficiente."); return; }
            const betKey = `${type}_${value}`;
            gameState.bets[betKey] = (gameState.bets[betKey] || 0) + amount;
            gameState.totalBet += amount;
            gameState.balance -= amount;
        }
        updatePlayerStatsUI();
        updateChipsOnBoardUI();
    }

    function triggerLoanSharkEvent() {
        if(gameState.despairTimerInterval) clearTimeout(gameState.despairTimerInterval);
        gameState.despairTimerInterval = null;
        
        loanSharkOverlay.classList.remove('opacity-0', 'pointer-events-none');
        loanSharkOverlay.classList.add('opacity-100');
    }

    function updateCashWadDisplay() {
        const balance = gameState.balance;
        let content = '';
        let title = '';
        if (balance <= 0) {
            content = '💨';
            title = 'Sem dinheiro, sem esperança.';
        } else if (balance <= 100) {
            content = '🪙';
            title = 'Algumas moedas para o troco...';
        } else if (balance <= 1000) {
            content = '💵';
            title = 'Um dinheirinho para o básico.';
        } else if (balance <= 10000) {
            content = '💰';
            title = 'Um bom maço de dinheiro!';
        } else if (balance <= 100000) {
            content = '<span class="animate-bounce">💸</span>';
            title = 'Você está nadando na grana!';
        } else {
            content = '🏦';
            title = 'Você poderia comprar um banco!';
        }
        cashWadDisplay.innerHTML = content;
        cashWadDisplay.title = title;
    }

    function checkDespairState() {
        if (loanSharkOverlay.classList.contains('opacity-100')) {
            if(gameState.despairTimerInterval) clearTimeout(gameState.despairTimerInterval);
            gameState.despairTimerInterval = null;
            return;
        }

        const vipBonus = getCurrentVipLevel().card_limit_bonus;
        const isBroke = gameState.balance <= 0;
        const cannotGetLoan = gameState.loanPrincipal > 0;
        const cannotUseCard = !gameState.savedCardDetails || (gameState.cardLimit + vipBonus) <= 0;

        if (isBroke && cannotGetLoan && cannotUseCard) {
            if (!gameState.despairTimerInterval) {
                showNotification("Aviso!", "Você não tem mais como conseguir dinheiro. Os cobradores foram notificados...", 5000);
                gameState.despairTimerInterval = setTimeout(() => {
                    triggerLoanSharkEvent();
                    gameState.despairTimerInterval = null;
                }, 60000); // 1 minuto
            }
        } else {
            if (gameState.despairTimerInterval) {
                clearTimeout(gameState.despairTimerInterval);
                gameState.despairTimerInterval = null;
                showNotification("Ufa!", "Você conseguiu algum dinheiro e despistou os cobradores... por enquanto.", 4000);
            }
        }
    }
    
    function drawRouletteWheel() {
        const numSegments = numbers.length;
        const radius = canvas.width / 2;
        const anglePerSegment = (2 * Math.PI) / numSegments;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 16px Roboto';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < numSegments; i++) {
            const angle = i * anglePerSegment;
            const number = numbers[i];
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius - 5, angle, angle + anglePerSegment);
            ctx.closePath();
            if (number === 0) ctx.fillStyle = '#2f855a';
            else if (redNumbers.includes(number)) ctx.fillStyle = '#c53030';
            else ctx.fillStyle = '#2d3748';
            ctx.fill();
            ctx.strokeStyle = '#a0aec0';
            ctx.stroke();
            ctx.save();
            ctx.fillStyle = 'white';
            const textAngle = angle + anglePerSegment / 2;
            ctx.translate(radius + Math.cos(textAngle) * (radius - 30), radius + Math.sin(textAngle) * (radius - 30));
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.fillText(number.toString(), 0, 0);
            ctx.restore();
        }
    }
    
    function createNumberGrid() {
        const container = document.getElementById('number-grid-container');
        container.innerHTML = '';
        for (let i = 1; i <= 36; i++) {
            const numberDiv = document.createElement('div');
            numberDiv.textContent = i;
            numberDiv.classList.add('bet-spot', 'p-4');
            numberDiv.dataset.betType = 'number';
            numberDiv.dataset.betValue = i;
            if (redNumbers.includes(i)) numberDiv.classList.add('red');
            else numberDiv.classList.add('black');
            container.appendChild(numberDiv);
        }
    }

    function updateChipsOnBoardUI() {
        document.querySelectorAll('.chip').forEach(chip => chip.remove());
        document.querySelectorAll('.bet-spot.active-bet').forEach(el => el.classList.remove('active-bet'));

        for (const betKey in gameState.bets) {
            const [type, value] = betKey.split('_');
            const spot = document.querySelector(`.bet-spot[data-bet-type="${type}"][data-bet-value="${value}"]`);
            if (spot) {
                spot.classList.add('active-bet');
                const chip = document.createElement('div');
                chip.classList.add('chip');
                
                let betValue = gameState.bets[betKey];
                let chipText = betValue >= 1000 ? `${(betValue/1000).toFixed(1).replace('.0','')}k` : `${betValue}`;
                chip.textContent = chipText;
                
                spot.appendChild(chip);
            }
        }
    }

    function showMessage(title, text, isWin) {
        messageTitle.textContent = title;
        messageText.innerHTML = text; 
        messageBox.style.borderColor = isWin ? '#48bb78' : '#f56565';
        messageTitle.style.color = isWin ? '#68d391' : '#fc8181';
        messageBox.classList.remove('opacity-0', 'pointer-events-none', 'scale-90');
        messageBox.classList.add('opacity-100', 'scale-100');
    }

    function hideMessage() {
        messageBox.classList.add('opacity-0', 'pointer-events-none', 'scale-90');
        messageBox.classList.remove('opacity-100', 'scale-100');
    }
    
    function updateHistoryUI() {
        historyDisplay.innerHTML = '';
        
        let hotNumbers = [];
        if (gameState.playerItems.heat_map_spins_left > 0) {
            const counts = {};
            gameState.numberHistory.forEach(num => { counts[num] = (counts[num] || 0) + 1; });
            hotNumbers = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5).map(Number);
        }

        gameState.numberHistory.forEach(num => {
            const el = document.createElement('div');
            el.classList.add('history-number');
            el.textContent = num;
            if (num === 0) el.classList.add('green');
            else if (redNumbers.includes(num)) el.classList.add('red');
            else el.classList.add('black');
            if (hotNumbers.includes(num)) {
                el.classList.add('hot-number');
                el.title = "Número Quente!";
            }
            historyDisplay.appendChild(el);
        });
    }
    
    function updateStoreAndInventoryUI() {
         storeList.innerHTML = '';
         inventoryList.innerHTML = '';
         
         for(const key in storeItems) {
              const item = storeItems[key];
              const itemEl = document.createElement('div');
              itemEl.classList.add('store-item');
              itemEl.innerHTML = `
                   <div class="flex justify-between items-center">
                       <div>
                           <p class="font-bold">${item.name}</p>
                           <p class="text-sm text-gray-400">${item.description}</p>
                       </div>
                       <button data-item-key="${key}" class="buy-item-button bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-lg text-sm">
                           R$${item.cost}
                       </button>
                   </div>
              `;
              storeList.appendChild(itemEl);
         }
         
         let hasItems = false;
         for (const key in gameState.playerItems) {
              const quantity = gameState.playerItems[key];
              if (quantity > 0) {
                   hasItems = true;
                   const itemInfo = storeItems[key.replace('_left','')] || { name: key };
                   const itemEl = document.createElement('div');
                   itemEl.classList.add('inventory-item');
                   
                   let useButton = '';
                   if (itemInfo.usable) {
                       const isActive = gameState.activeItems.isLuckyChipInUse || gameState.activeItems.isXpMagnetActive;
                       const buttonText = isActive && (key === 'lucky_chip' || key === 'xp_magnet') ? 'ATIVO' : 'USAR';
                       const buttonClass = isActive && (key === 'lucky_chip' || key === 'xp_magnet') ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700';
                       useButton = `<button data-item-key="${key}" class="use-item-button ${buttonClass} text-white font-bold py-1 px-3 rounded-lg text-sm">${buttonText}</button>`;
                   }

                   itemEl.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-bold">${itemInfo.name} <span class="text-gray-400 font-normal">x${quantity}</span></p>
                            </div>
                            ${useButton}
                        </div>
                   `;
                   inventoryList.appendChild(itemEl);
              }
         }

         if (!hasItems) {
              inventoryList.innerHTML = `<p class="text-gray-500 text-center">Seu inventário está vazio.</p>`;
         }

         document.querySelectorAll('.buy-item-button').forEach(b => b.addEventListener('click', (e) => buyItem(e.target.dataset.itemKey)));
         document.querySelectorAll('.use-item-button').forEach(b => b.addEventListener('click', (e) => useItem(e.target.dataset.itemKey)));
    }

    function buyItem(itemKey) {
        const item = storeItems[itemKey];
        if (!item) return;

        if (gameState.balance < item.cost) {
            showNotification("Erro", "Saldo insuficiente para comprar este item.", 3000);
            return;
        }

        gameState.balance -= item.cost;
        if(itemKey === 'heat_map') {
            gameState.playerItems.heat_map_spins_left += 3;
        } else {
            gameState.playerItems[itemKey]++;
        }
        
        showNotification("Compra Realizada!", `Você comprou ${item.name}.`);
        checkAchievements(); 
        saveState();
        updateAllUI();
    }

    function useItem(itemKey) {
         if (gameState.playerItems[itemKey] <= 0) return;

         if (itemKey === 'lucky_chip') {
              gameState.activeItems.isLuckyChipInUse = !gameState.activeItems.isLuckyChipInUse;
              if(gameState.activeItems.isXpMagnetActive) gameState.activeItems.isXpMagnetActive = false;
         }
         if (itemKey === 'xp_magnet') {
              gameState.activeItems.isXpMagnetActive = !gameState.activeItems.isXpMagnetActive;
              if(gameState.activeItems.isLuckyChipInUse) gameState.activeItems.isLuckyChipInUse = false;
         }

         showNotification("Item Ativado", `${storeItems[itemKey].name} está pronto para a próxima rodada.`);
         saveState();
         updateAllUI();
    }

    function updateVipUI() {
        const currentLevel = getCurrentVipLevel();
        vipLevelEl.textContent = currentLevel.name;
        vipXpEl.textContent = `${gameState.playerXP} / ${getNextVipLevel()?.xp_required || 'MAX'} XP`;
    }

    function updateAchievementsUI() {
        achievementsList.innerHTML = '';
        for (const key in gameState.achievements) {
            const ach = gameState.achievements[key];
            const li = document.createElement('li');
            li.classList.add('achievement', 'p-2', 'bg-gray-900', 'rounded', 'flex', 'items-center');
            if (ach.unlocked) {
                li.classList.add('unlocked');
            }
            li.innerHTML = `<span class="achievement-icon">${ach.icon}</span> <div><p class="font-bold">${ach.title}</p><p class="text-sm text-gray-400">${ach.description}</p></div>`;
            achievementsList.appendChild(li);
        }
    }
    
    function updateUnlockedAchievementsDisplay() {
        unlockedAchievementsDisplay.innerHTML = '';
        let unlockedCount = 0;
        for (const key in gameState.achievements) {
            const ach = gameState.achievements[key];
            if (ach.unlocked) {
                unlockedCount++;
                const iconEl = document.createElement('span');
                iconEl.classList.add('unlocked-achievement-icon');
                iconEl.textContent = ach.icon;
                iconEl.title = ach.title;
                unlockedAchievementsDisplay.appendChild(iconEl);
            }
        }
        if (unlockedCount === 0) {
             unlockedAchievementsDisplay.innerHTML = `<p class="text-xs text-gray-500">Nenhuma conquista desbloqueada</p>`;
        }
    }

    function showNotification(title, message, duration = 4000) {
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        notificationBox.classList.add('show');
        setTimeout(() => {
            notificationBox.classList.remove('show');
        }, duration);
    }

    function updateWalletUI() {
        if (gameState.savedCardDetails) {
            addCardSection.classList.add('hidden');
            manageCardSection.classList.remove('hidden');
            const lastFour = gameState.savedCardDetails.number.slice(-4);
            savedCardNumberEl.textContent = `**** **** **** ${lastFour}`;
            updateCardLimitUI();
        } else {
            addCardSection.classList.remove('hidden');
            manageCardSection.classList.add('hidden');
        }
    }

    function updateCardLimitUI() {
        if (!gameState.savedCardDetails) return;
        const currentLevel = getCurrentVipLevel();
        const bonus = currentLevel.card_limit_bonus;
        const effectiveLimit = gameState.cardLimit + bonus;
        cardLimitEl.textContent = `R$${effectiveLimit.toFixed(2)}`;
        vipBonusTextEl.textContent = bonus.toFixed(2);
    }

    function saveCard() {
        const cardNumber = cardNumberInput.value;
        if (!cardNumber || cardNumber.length < 10) {
            alert("Por favor, insira um número de cartão válido."); return;
        }
        gameState.savedCardDetails = { number: cardNumber, expiry: cardExpiryInput.value, cvv: cardCvvInput.value };
        gameState.cardLimit = 0;
        startCardLimitTimer();
        saveState();
        updateWalletUI();
    }

    function forgetCard() {
        if (gameState.cardLimitInterval) clearInterval(gameState.cardLimitInterval);
        gameState.cardLimit = 0;
        gameState.savedCardDetails = null;
        saveState();
        updateWalletUI();
    }

    function startCardLimitTimer() {
        if (gameState.cardLimitInterval) clearInterval(gameState.cardLimitInterval);
        gameState.cardLimitInterval = setInterval(() => {
            gameState.cardLimit += 10;
            updateCardLimitUI();
            saveState();
        }, 60000);
    }
    
    function handleAddFunds() {
        const amount = parseInt(fundsAmountInput.value);
        if (isNaN(amount) || amount <= 0) { alert("Por favor, insira um valor válido."); return; }
        const currentLevel = getCurrentVipLevel();
        const effectiveLimit = gameState.cardLimit + currentLevel.card_limit_bonus;
        if (amount > effectiveLimit) { alert(`Limite do cartão insuficiente. Limite disponível: R$${effectiveLimit.toFixed(2)}.`); return; }
        gameState.cardLimit -= amount;
        if (gameState.cardLimit < 0) gameState.cardLimit = 0;
        gameState.balance += amount;
        fundsAmountInput.value = '';
        showNotification("Sucesso", `R$${amount.toFixed(2)} adicionados ao saldo.`);
        checkAchievements();
        saveState();
        updateAllUI();
    }
    
    function handleDepositToCard() {
        const amount = parseInt(depositAmountInput.value);
        if (isNaN(amount) || amount <= 0) { alert("Por favor, insira um valor válido para depositar."); return; }
        if (amount > gameState.balance) { alert(`Saldo insuficiente. Você só pode depositar até R$${gameState.balance.toFixed(2)}.`); return; }
        gameState.balance -= amount;
        gameState.cardLimit += amount;
        depositAmountInput.value = '';
        showNotification("Depósito Realizado", `Você depositou R$${amount.toFixed(2)} no seu cartão.`);
        saveState();
        updateAllUI();
    }
    
    function toggleNeighborsBet() {
        gameState.isNeighborsBetActive = !gameState.isNeighborsBetActive;
        neighborsBetButton.textContent = `Apostar Vizinhos (${gameState.isNeighborsBetActive ? 'ON' : 'OFF'})`;
        neighborsBetButton.classList.toggle('bg-green-600', gameState.isNeighborsBetActive);
        neighborsBetButton.classList.toggle('bg-indigo-600', !gameState.isNeighborsBetActive);
    }

    function triggerRandomEvent() {
        gameState.activeEvent = null;
        eventNotificationBar.textContent = '';
        if (Math.random() < 0.25) {
            if (Math.random() < 0.5) {
                gameState.activeEvent = { type: 'lucky_round', duration: 1 };
                eventNotificationBar.textContent = '🎉 RODADA DE SORTE! Pagamentos +50% 🎉';
            } else {
                gameState.activeEvent = { type: 'unlucky_streak', duration: 1 };
                eventNotificationBar.textContent = '💀 MARÉ DE AZAR! Apostas 1-para-1 não pagam 💀';
            }
        }
    }
    
    function getCurrentVipLevel() {
        let currentLevel = vipLevels[0];
        for(let i = vipLevels.length - 1; i >= 0; i--) {
            if (gameState.playerXP >= vipLevels[i].xp_required) {
                currentLevel = vipLevels[i];
                break;
            }
        }
        return currentLevel;
    }

    function getNextVipLevel() {
        const currentLevel = getCurrentVipLevel();
        const currentLevelIndex = vipLevels.findIndex(l => l.name === currentLevel.name);
        return vipLevels[currentLevelIndex + 1];
    }

    function checkAchievements(context = {}) {
        let newAchievementUnlocked = false;
        
        const unlock = (key) => {
            if (!gameState.achievements[key].unlocked) {
                gameState.achievements[key].unlocked = true;
                newAchievementUnlocked = true;
                showNotification("Conquista Desbloqueada!", gameState.achievements[key].title);
            }
        };
        
        if (context.event === 'loan_repaid') unlock('pay_loan');
        
        if (context.placedBets) {
            if (context.placedBets['number_7'] && context.winningNumber === 7) unlock('win_on_7');
            
            const betAmount = Object.values(context.placedBets).reduce((a, b) => a + b, 0);
            if (betAmount >= (gameState.balance + betAmount - 1) && betAmount >= 100 && context.winnings > betAmount) unlock('all_in_win');
        }
        
        const oldLevel = getCurrentVipLevel();
        gameState.playerXP += context.xpGained || 0;
        const newLevel = getCurrentVipLevel();
        if (newLevel.name !== oldLevel.name) {
            showNotification("Nível VIP Aumentou!", `Parabéns! Você alcançou o nível ${newLevel.name}.`);
            if (newLevel.name === 'Ouro') unlock('reach_gold');
        }
        
        if (context.winningNumber !== undefined) {
            const isRedWin = redNumbers.includes(context.winningNumber);
            if (context.placedBets?.['color_red'] && isRedWin) gameState.consecutiveRedWins++;
            else gameState.consecutiveRedWins = 0;
            
            if (gameState.consecutiveRedWins >= 5) unlock('five_reds');
        }
        
        if (gameState.balance >= 100000) unlock('touched_by_midas');

        if (context.didWin && Object.keys(context.placedBets).length === 1 && context.placedBets[Object.keys(context.placedBets)[0]] > 0) {
             const singleBetKey = Object.keys(context.placedBets)[0];
             if(singleBetKey.startsWith('number_')) {
                   unlock('russian_roulette');
             }
        }

        if (context.wonStraightUp) {
            gameState.consecutiveStraightUpWins++;
        } else if (context.didSpin) {
            gameState.consecutiveStraightUpWins = 0;
        }
        if (gameState.consecutiveStraightUpWins >= 3) unlock('the_prophet');
        
        if (context.wonOnColumnValue) {
            gameState.wonOnColumns[context.wonOnColumnValue] = true;
            if(gameState.wonOnColumns['1'] && gameState.wonOnColumns['2'] && gameState.wonOnColumns['3']) {
                unlock('column_specialist');
            }
        }

        const { lucky_chip, amulet_of_zero, xp_magnet, heat_map_spins_left } = gameState.playerItems;
        if (lucky_chip > 0 && amulet_of_zero > 0 && xp_magnet > 0 && heat_map_spins_left > 0) {
            unlock('collector');
        }

        if (newAchievementUnlocked) {
            updateAchievementsUI();
            updateUnlockedAchievementsDisplay();
            saveState();
        }
    }

    function clearBets() {
        if (gameState.isSpinning) return;
        gameState.balance += gameState.totalBet;
        gameState.totalBet = 0;
        gameState.bets = {};
        updatePlayerStatsUI();
        updateChipsOnBoardUI();
    }

    function spinWheel() {
        if (gameState.isSpinning || gameState.totalBet === 0) return;
        gameState.isSpinning = true;
        spinButton.disabled = true;
        clearButton.disabled = true;
        bettingTable.style.pointerEvents = 'none';
        resultEl.textContent = '...';
        gameState.spinCount++;
        if (gameState.spinCount % 8 === 0) triggerRandomEvent();
        else { gameState.activeEvent = null; eventNotificationBar.textContent = ''; }
        const randomSpins = Math.floor(Math.random() * 5) + 5; 
        const randomStopAngle = Math.random() * (2 * Math.PI);
        const totalRotation = (randomSpins * 2 * Math.PI) + randomStopAngle;
        canvas.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        canvas.style.transform = `rotate(${totalRotation}rad)`;
        gameState.currentAngle = totalRotation % (2 * Math.PI);
        setTimeout(finishSpin, 5000);
    }

    function finishSpin() {
        const numSegments = numbers.length;
        const degreesPerSegment = 360 / numSegments;
        const rotationDegrees = (gameState.currentAngle * 180 / Math.PI) % 360;
        const finalAngle = (270 - rotationDegrees + 360) % 360;
        const winningSegmentIndex = Math.floor(finalAngle / degreesPerSegment);
        const winningNumber = numbers[winningSegmentIndex];
        resultEl.textContent = winningNumber;
        resultEl.style.color = winningNumber === 0 ? '#68d391' : redNumbers.includes(winningNumber) ? '#fc8181' : 'white';
        gameState.numberHistory.unshift(winningNumber);
        if (gameState.numberHistory.length > 15) gameState.numberHistory.pop();
        
        if(gameState.playerItems.heat_map_spins_left > 0) {
            gameState.playerItems.heat_map_spins_left--;
        }

        calculateWinnings(winningNumber);

        gameState.isSpinning = false;
        spinButton.disabled = false;
        clearButton.disabled = false;
        bettingTable.style.pointerEvents = 'auto';

        if(gameState.activeItems.isLuckyChipInUse) {
             gameState.playerItems.lucky_chip--;
             gameState.activeItems.isLuckyChipInUse = false;
        }
         if(gameState.activeItems.isXpMagnetActive) {
             gameState.playerItems.xp_magnet--;
             gameState.activeItems.isXpMagnetActive = false;
        }
        
        gameState.totalBet = 0;
        gameState.bets = {};
        saveState();
        updateAllUI();
    }

    function calculateWinnings(winningNumber) {
        let winnings = 0;
        let totalBetValue = Object.values(gameState.bets).reduce((a, b) => a + b, 0);
        let achievementContext = { placedBets: gameState.bets, winningNumber: winningNumber, didSpin: true };

        if (winningNumber === 0 && gameState.playerItems.amulet_of_zero > 0) {
            let hasWinningBetOnZero = !!gameState.bets['number_0'];
            if (!hasWinningBetOnZero) {
                gameState.balance += totalBetValue;
                gameState.playerItems.amulet_of_zero--;
                showNotification("Amuleto Ativado!", `O número foi 0! Suas apostas (R$${totalBetValue.toFixed(2)}) foram devolvidas.`);
                checkAchievements(achievementContext);
                return;
            }
        }

        const isRed = redNumbers.includes(winningNumber);
        const isBlack = winningNumber !== 0 && !isRed;
        const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
        const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0;
        for (const betKey in gameState.bets) {
            const [type, value] = betKey.split('_');
            const betAmount = gameState.bets[betKey];
            let payoutMultiplier = 0;
            
            if (type === 'number' && parseInt(value) === winningNumber) {
                payoutMultiplier = 36;
                achievementContext.wonStraightUp = true;
            } else if (type === 'column') {
                const col1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
                const col2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
                const col3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
                if ((value === '1' && col1.includes(winningNumber)) || (value === '2' && col2.includes(winningNumber)) || (value === '3' && col3.includes(winningNumber))) {
                    payoutMultiplier = 3;
                    achievementContext.wonOnColumnValue = value;
                }
            } else if (type === 'dozen') {
                if ((value === '1' && winningNumber >= 1 && winningNumber <= 12) || (value === '2' && winningNumber >= 13 && winningNumber <= 24) || (value === '3' && winningNumber >= 25 && winningNumber <= 36)) payoutMultiplier = 3;
            } else {
                const isEvenMoneyBet = ['color', 'even', 'odd', 'range'].includes(type);
                if (isEvenMoneyBet && gameState.activeEvent?.type === 'unlucky_streak') {
                    payoutMultiplier = 0;
                } else {
                    if (type === 'color' && ((value === 'red' && isRed) || (value === 'black' && isBlack))) payoutMultiplier = gameState.activeItems.isLuckyChipInUse ? 3 : 2;
                    if ((type === 'even' && isEven) || (type === 'odd' && isOdd)) payoutMultiplier = 2;
                    if (type === 'range' && ((value === 'low' && winningNumber >= 1 && winningNumber <= 18) || (value === 'high' && winningNumber >= 19 && winningNumber <= 36))) payoutMultiplier = 2;
                }
            }
            winnings += betAmount * payoutMultiplier;
        }
        if (winnings > 0 && gameState.activeEvent?.type === 'lucky_round') winnings *= 1.5;
        
        achievementContext.winnings = winnings;
        achievementContext.didWin = winnings > 0;
        
        if (winnings > 0) {
            const netWin = winnings - totalBetValue;
            let xpGained = Math.floor(netWin > 0 ? netWin : 0);
            if (gameState.activeItems.isXpMagnetActive) {
                xpGained *= 2;
                showNotification("Ímã de XP Ativado!", `Você ganhou ${xpGained} de XP (2x)!`);
            }
            achievementContext.xpGained = xpGained;
            gameState.balance += winnings;
            showMessage("Você Ganhou!", `Parabéns! O número foi <b>${winningNumber}</b>.<br>Você ganhou <b>R$${winnings.toFixed(2)}</b>.`, true);
        } else {
            showMessage("Você Perdeu", `O número foi <b>${winningNumber}</b>.<br>Mais sorte na próxima vez!`, false);
        }
        checkAchievements(achievementContext);
    }

    function calculateCurrentLoanDue() {
        if (!gameState.loanPrincipal) return 0;
        const timeElapsedMs = Date.now() - gameState.loanTakenTimestamp;
        const interestIntervals = Math.floor(timeElapsedMs / LOAN_INTEREST_PERIOD);
        const dueAmount = gameState.loanPrincipal * Math.pow(1 + LOAN_INTEREST_RATE, interestIntervals);
        return dueAmount;
    }

    function updateLoanUI() {
        if (gameState.loanPrincipal > 0) {
            loanRequestArea.classList.add('hidden');
            loanStatusArea.classList.remove('hidden');
            const dueAmount = calculateCurrentLoanDue();
            loanDueAmountEl.textContent = `R$${dueAmount.toFixed(2)}`;
            const timeElapsed = Date.now() - gameState.loanTakenTimestamp;
            const timeLeft = LOAN_DURATION - timeElapsed;
            if (timeLeft <= 0) {
                loanTimerEl.textContent = "00:00";
                if (gameState.loanPrincipal > 0) { 
                    handleLoanDefault();
                }
                return;
            }
            const minutes = Math.floor((timeLeft / 1000) / 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            loanTimerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            loanRequestArea.classList.remove('hidden');
            loanStatusArea.classList.add('hidden');
        }
    }

    function startLoanTimers() {
        if (gameState.loanTimerInterval) clearInterval(gameState.loanTimerInterval);
        if (gameState.loanPrincipal > 0) {
            gameState.loanTimerInterval = setInterval(updateLoanUI, 1000);
        }
    }

    function clearLoanData() {
        if (gameState.loanTimerInterval) clearInterval(gameState.loanTimerInterval);
        gameState.loanPrincipal = 0;
        gameState.loanTakenTimestamp = null;
        gameState.loanTimerInterval = null;
        updateLoanUI();
        saveState();
    }

    function requestLoan() {
        if (gameState.loanPrincipal > 0) {
            alert("Você já tem um empréstimo ativo!");
            return;
        }
        const amount = parseInt(loanAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert("Por favor, insira um valor de empréstimo válido.");
            return;
        }
        gameState.balance += amount;
        gameState.loanPrincipal = amount;
        gameState.loanTakenTimestamp = Date.now();
        showNotification("Empréstimo Realizado!", `Você pegou R$${amount.toFixed(2)}. Pague em 30 minutos.`);
        startLoanTimers();
        updateAllUI();
        saveState();
    }

    function payLoan() {
        const dueAmount = calculateCurrentLoanDue();
        if (gameState.balance < dueAmount) {
            alert(`Saldo insuficiente. Você precisa de R$${dueAmount.toFixed(2)} para pagar a dívida.`);
            return;
        }
        gameState.balance -= dueAmount;
        showNotification("Dívida Paga!", `Você pagou R$${dueAmount.toFixed(2)} com sucesso.`);
        checkAchievements({ event: 'loan_repaid' });
        clearLoanData();
        updateAllUI();
    }

    function handleLoanDefault() {
        const dueAmount = calculateCurrentLoanDue();
        showNotification("Tempo Esgotado!", `A sua dívida de R$${dueAmount.toFixed(2)} foi cobrada automaticamente.`);
        gameState.balance -= dueAmount;
        clearLoanData();
        updateAllUI();
    }
    
    // --- Event Listeners ---
    // NOVO Listener para o botão de iniciar o jogo.
    startGameButton.addEventListener('click', handleStartGame);
    
    // Listeners Originais
    spinButton.addEventListener('click', spinWheel);
    clearButton.addEventListener('click', clearBets);
    sidebarRestartButton.addEventListener('click', resetGame);
    bettingTable.addEventListener('click', (e) => {
        const spot = e.target.closest('.bet-spot');
        if (spot) {
            const { betType, betValue } = spot.dataset;
            placeBet(betType, betValue);
        }
    });
    messageClose.addEventListener('click', hideMessage);
    loanToggle.addEventListener('click', () => {
        loanSidebar.classList.toggle('open');
        loanToggle.classList.toggle('open');
    });
    requestLoanButton.addEventListener('click', requestLoan);
    payLoanButton.addEventListener('click', payLoan);
    restartButton.addEventListener('click', resetGame); 
    neighborsBetButton.addEventListener('click', toggleNeighborsBet);
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sidebarTabs.forEach(t => t.classList.remove('active'));
            sidebarContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + '-content').classList.add('active');
        });
    });
    saveCardButton.addEventListener('click', saveCard);
    forgetCardButton.addEventListener('click', forgetCard);
    addFundsButton.addEventListener('click', handleAddFunds);
    depositToCardButton.addEventListener('click', handleDepositToCard);

    initialize();
});