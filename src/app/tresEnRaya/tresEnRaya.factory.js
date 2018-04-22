(function() {
    'use strict';

    angular.module('app').factory('TresEnRayaFactory', TresEnRayaFactory);

    /** @ngInject **/
    function TresEnRayaFactory($http, RequestHandler, API_URL){

        function createRound(roundBody){
            RequestHandler.setCallerName("createRound");
            return $http(
                {
                    method: "POST",
                    data: roundBody,
                    header: {"Content-Type": "application/json"},
                    url: API_URL + "/rounds"
                }
            ).then(
                RequestHandler.success,
                RequestHandler.error
            );

        }

        function saveMovement (movementBody){
            RequestHandler.setCallerName("saveMovement");
            return $http(
                {
                    method: "POST",
                    data: movementBody,
                    header: {"Content-Type": "application/json"},
                    url: API_URL + "/movements"
                }
            ).then(
                RequestHandler.success,
                RequestHandler.error
            );
        }

        return {
            createRound: createRound,
            saveMovement: saveMovement
        };
    }
})();