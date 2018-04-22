(function(){
    'use strict';

    angular
        .module('app')
        .factory('RequestHandler', RequestHandler);

    /** @ngInject **/
    function RequestHandler($log){
        var vm = this;
        init();

        function init(){
            vm.verbose = true;
            vm.name = '';
        }

        function setCallerName(name) {
            vm.name = name || '';
        }

        function success(response){
            if (vm.verbose){
                $log.info('Successful request [' + vm.name + '] responded: ' + response);
            }
            response.success = true;
            response.data = response.data || {};
            return response.data;
        }

        function error(response){
            if (vm.verbose){
                let text = 'HTTP code: ' + (response.status > 0 ? response.status : 'Unkown');
                $log.error('Unexpected error [' + vm.name + '] ' + text, response.errors ? response.errors : '');
            }
            response.success = false;
            response.data = {};
            return response;
        }

        return {
            setCallerName: setCallerName,
            error: error,
            success: success
        };
    }
})();
