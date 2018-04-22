(function() {
    'use strict';

    angular.module('app').component('tresEnRaya', {
        controller: TresEnRayaController,
        controllerAs: 'vm',
        templateUrl: 'app/tresEnRaya/tresEnRaya.view.html',
    });

    /** @ngInject */
    function TresEnRayaController($log, PROJECT_NAME, TresEnRayaFactory, ngToast) {
        const vm = this;

        // IU Interaction
        vm.resetGrid = resetGrid;
        vm.resetGame = resetGame;
        vm.resetState = resetState;
        vm.createGrid = createGrid;
        vm.setPosition = setPosition;
        vm.detectWinner = detectWinner;
        vm.notifyWinner = notifyWinner;
        vm.getFirstPlayer = getFirstPlayer;
        vm.updateGameState = updateGameState;
        vm.validateDiagonals = validateDiagonals;
        vm.updateCurrentPlayer = updateCurrentPlayer;
        vm.validateRowsAndColumns =validateRowsAndColumns;
        vm.updateRemoteState = updateRemoteState;

        // Services
        vm.buildMovement = buildMovement;
        vm.getRoundId = getRoundId;
        vm.saveMovement = saveMovement;

        init();

        /**
         * Create a custom grid comming from the backend
         * @param defaultState
         */
        function createGrid(defaultValue, defaultState){

            var grid = [];
            for (var i = 0; i < vm.settings.dimension; ++i){
                var row = [];
                for (var j = 0; j < vm.settings.dimension; ++j) {
                    row.push(defaultState && defaultState[i][j] ? defaultState[i][j] : defaultValue);
                }
                grid.push(row);
            }
            return grid;
        }

        /**
         * @private Creates default game state
         * @returns {{rowCount: *, columnCount: *, diagonal: [number,number]}}
         */
        function createState(){
            var line = [];
            for (var i=0; i<vm.settings.dimension; ++i){
                line.push(0);
            }
            return {
                rowCount: angular.copy(line),
                columnCount: angular.copy(line),
                diagonal: [0, 0]
            };
        }

        /**
         * Raise winner notification
         * @param winner
         */
        function notifyWinner(winner){
            var iconWinner = vm.settings.players[winner.player].icon;
            var message = "Enhorabuena! Han ganado las &nbsp;" +
                "<i class=\"fa-1x "+iconWinner+"\" aria-hidden=\"true\" />&nbsp;!!!";
            vm.toast = ngToast.create({
                className: 'success',
                content: message,
                dismissButton: true,
                dismissOnClick: true,
                maxNumber: 1,
                verticalPosition: "bottom"
            });
        }

        function updateRemoteState(movement) {
            var roundStatus;

            if (angular.isUndefined(vm.roundId) || vm.roundId === null){
                roundStatus = {
                    'status_code': 'NEW'
                };
                vm.getRoundId(roundStatus, movement);
            }else{
                vm.saveMovement(movement);
            }
        }

        function buildMovement(x, y, player, winner){
            return {
                round_id: vm.roundId,
                x_axis: x,
                y_axis: y,
                player: player,
                wining: angular.isDefined(winner),
                movements_counter: vm.movementsCounter,
                max_movements: vm.maxMovements
            }
        }

        /**
         * Set a player into a grid position
         * @param x
         * @param y
         */
        function setPosition(x, y){
            if (angular.isUndefined(vm.winner) && vm.grid && angular.isDefined(x) && x >= 0 && x < vm.grid.length){
                if (vm.grid[x] && angular.isDefined(y) && y >= 0 && y < vm.grid[x].length){
                    if (angular.isUndefined(vm.grid[x][y])){
                        vm.movementsCounter--;
                        vm.currentPlayer = vm.updateCurrentPlayer();
                        vm.nextPlayer = vm.updateCurrentPlayer();
                        vm.grid[x][y] = vm.currentPlayer;
                        vm.updateGameState(vm.currentPlayer, x, y);
                        vm.winner = vm.detectWinner(vm.currentPlayer);

                        if (vm.winner){
                            vm.notifyWinner(vm.winner);
                        }

                        vm.updateRemoteState(
                            vm.buildMovement(x, y, vm.currentPlayer, vm.winner)
                        );
                    }
                }
            }
        }

        /**
         * Generates random integer
         * @param min
         * @param max
         * @returns {*}
         */
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /**
         * Get the first player for all time
         * @returns {string}
         */
        function getFirstPlayer(){
            var r = getRandomInt(0, 1);
            return r ? 'x' : 'o';
        }

        /**
         * Update the player in turn
         * @returns {*}
         */
        function updateCurrentPlayer(){
            var player;
            if (angular.isUndefined(vm.currentPlayer)){
                player = vm.settings.first_player;
            }else{
                player = vm.currentPlayer === 'x' ? 'o' : 'x';
            }
            return player;
        }

        /**
         * Set the new accumulative game state
         * @param player
         * @param x
         * @param y
         */
        function updateGameState(player, x, y){
            vm.settings.players[player].state.rowCount[x] += 1;
            vm.settings.players[player].state.columnCount[y] += 1;
            vm.settings.players[player].state.diagonal[0] += (x === y ? 1 : 0);
            vm.settings.players[player].state.diagonal[1] += (y === vm.settings.dimension - (x+1) ? 1 : 0);
        }

        /**
         * Validate whether current play completes a diagonal or antidiagonal
         * @param player
         * @returns {*}
         */
        function validateDiagonals(player) {
            var winner;
            var conditionDiagonal = vm.settings.players[player].state.diagonal[0] === vm.settings.dimension;
            var conditionAntiDiagonal = vm.settings.players[player].state.diagonal[1] === vm.settings.dimension;

            if (conditionDiagonal){
                winner = {code: "diagonal", index: 1, player: player};
            }else if(conditionAntiDiagonal){
                winner = {code: "antidiagonal", index: -1, player: player};
            }

            return winner;
        }

        /**
         * Validate whether a current play completes a column or a row
         * @param player
         * @returns {*}
         */
        function validateRowsAndColumns(player){
            var winner;

            for (var i=0;i<vm.settings.dimension && !winner; ++i){
                if (vm.settings.players[player].state.rowCount[i] === vm.settings.dimension){
                    winner = {code: "row", index: i, player: player};
                }else if(vm.settings.players[player].state.columnCount[i] === vm.settings.dimension){
                    winner = {code: "column", index: i, player: player}
                }
            }

            return winner;
        }

        /**
         * Detect whether a play makes a player win the game
         * @param player
         * @returns {*}
         */
        function detectWinner(player){
            var winner = vm.validateDiagonals(player);
            if(!winner){
                winner = vm.validateRowsAndColumns(player);
            }
            return winner;
        }

        /**
         * Reset Game UI
         */
        function resetGrid(){
            vm.grid = vm.createGrid();
        }

        /**
         * Reset Game logical State
         */
        function resetState(){
            vm.roundId = null;
            vm.winner = undefined;
            vm.movementsCounter = vm.maxMovements;
            vm.settings.players.x.state = createState();
            vm.settings.players.o.state = createState();
        }

        /**
         * Reset both game and logical state
         */
        function resetGame(){
            if (vm.movementsCounter > 0 && angular.isUndefined(vm.winner)){
                vm.saveMovement(vm.buildMovement(-1, -1, null, vm.winner));
            }
            vm.resetGrid();
            vm.resetState();
        }

        /**
         * Get a round id for the current game
         * @param force
         */
        function getRoundId(roundStatus, movement){
            vm.loading.round = true;
            TresEnRayaFactory.createRound(roundStatus).then(
                function (rs) {
                    vm.loading.round = false;
                    vm.roundId = rs.id;
                    if (angular.isDefined(movement)){
                        movement.round_id = vm.roundId;
                        vm.saveMovement(movement);
                    }
                },
                function (err) {
                    vm.loading.round = false;
                    $log.error("Error during Round creation", err);
                }
            );
        }

        /**
         * Register a game movement
         */
        function saveMovement(movement){
            vm.loading.movement = true;
            var movementBody = movement;
            TresEnRayaFactory.saveMovement(movementBody).then(
                function () {
                    vm.loading.movement = false;
                },
                function (err) {
                    vm.loading.movement = false;
                    $log.error("Error during Movement registering", err);
                }
            );
        }

        /**
         * Component initialization
         */
        function init() {
            vm.roundId = null;
            vm.winner = undefined;
            vm.gameTitle = PROJECT_NAME;
            vm.currentPlayer = undefined;
            vm.loading = {
                round: false,
                movement: false
            };
            vm.settings = {
                dimension: 3,
                players : {
                    x: {
                        icon: "fas fa-times"
                    },
                    o: {
                        icon: "far fa-circle"
                    }
                },
                first_player: vm.getFirstPlayer()
            };
            vm.maxMovements = vm.settings.dimension * vm.settings.dimension
            vm.movementsCounter = vm.maxMovements;
            vm.nextPlayer = vm.settings.first_player;
            vm.settings.players.x.state = createState();
            vm.settings.players.o.state = createState();
            vm.resetGrid();
            $log.debug('tresEnRaya activated');
        }
    }

})();
