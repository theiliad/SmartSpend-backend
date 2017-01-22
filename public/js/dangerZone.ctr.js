angular.module('dangerZone')
        .config(function($mdThemingProvider) {
          $mdThemingProvider.definePalette('transaction-ai', {
            '50': 'ff3855',
            '100': 'ff3855',
            '200': 'ff3855',
            '300': 'ff3855',
            '400': 'ff3855',
            '500': 'ff3855',
            '600': 'ff3855',
            '700': 'ff3855',
            '800': 'ff3855',
            '900': 'ff3855',
            'A100': 'ff3855',
            'A200': 'ff3855',
            'A400': 'ff3855',
            'A700': 'ffffff',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light

            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
             '200', '300', '400', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
          });
          $mdThemingProvider.theme('default')
            .primaryPalette('transaction-ai')
            .accentPalette('amber');
        })
        
        .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

          $stateProvider          
          .state('index', {
            url: '/index',
            templateUrl: 'js/index.html',
            controller: 'indexCtrl'
          })
          
          .state('transactions', {
            url: '/transactions',
            templateUrl: 'js/transactions.html',
            controller: 'transactionsCtrl'
          })

          $urlRouterProvider.otherwise('/index');
        }])
        
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }])

        .run(['$rootScope', '$state', function($rootScope, $state) {
            $rootScope.$on('$stateChangeStart', function(evt, to, params) {              
              if (to.redirectTo) {
                evt.preventDefault();
                $state.go(to.redirectTo, params, {location: 'replace'})
              }
            });
        }])
        
        .controller("dangerZoneCtrl", function($rootScope, $scope, $mdSidenav, $mdToast, $state, $http) {
            $scope.$root.progress = false;
        })
        
        .controller("indexCtrl", function($rootScope, $scope, $mdSidenav, $mdToast, $state, $http) {
            
        })
        
        .controller("transactionsCtrl", function($rootScope, $scope, $mdSidenav, $mdToast, $state, $stateParams, $http, $mdDialog, $firebaseObject, $firebaseArray, $interval, $timeout) {
            var interval;
            
            $scope.$root.progress = true;
            $scope.simulation = false;
            
            var ref = firebase.database().ref().child("transactions");
            var syncObject = $firebaseObject(ref);
                
            syncObject.$bindTo($scope, "transactions").then(function(unbind) {
                $scope.$root.progress = false;
                $scope.loaded = true;
            });
            
            $scope.numOfKeys = function() {
                var counter = 0;
                for (var key in syncObject) {
                    if (!isNaN(key) || key.indexOf('-K') == 0) {
                        counter = counter + 1;
                    }
                }
                
                return counter;
            }
    
            $scope.startUpdating = function() {
                interval = $interval($scope.updateTime, 1000);
                $scope.simulation = true;
            }
            
            $scope.stopUpdating = function() {
                $scope.simulation = false;
                $interval.cancel(interval);
            }
              
              var last = {
                  bottom: true,
                  top: false,
                  left: false,
                  right: true
              };
              
              $scope.toastPosition = angular.extend({},last);
              $scope.getToastPosition = function() {
                sanitizePosition();

                return Object.keys($scope.toastPosition)
                  .filter(function(pos) { return $scope.toastPosition[pos]; })
                  .join(' ');
              };

              function sanitizePosition() {
                var current = $scope.toastPosition;
                last = angular.extend({},current);
              }

              $scope.showSimpleToast = function(message) {
                var pinTo = $scope.getToastPosition();

                $mdToast.show(
                  $mdToast.simple()
                    .textContent(message)
                    .position(pinTo)
                    .hideDelay(3000)
                );
              };
            
            $scope.remove = function(objKey) {
                for (var key in syncObject) {
                    if (key == objKey) {
                        delete $scope.transactions[objKey];
                        console.log("DELETED");
                    }
                }
            }
            
            $scope.addTransaction = function() {
                $mdDialog.show({
                  controller: ['$rootScope', '$scope', '$mdDialog', '$mdToast', '$filter', function ($rootScope, $scope, $mdDialog, $mdToast, $filter) {
                      $scope.item = {
                          what: "750 Ml. Jackson Triggs",
                          cost: 14.99,
                          category: "Wine",
                          type: "bad",
                          img: "https://d13yacurqjgara.cloudfront.net/users/24885/screenshots/1799551/page-cannot-be-found.png"
                      };
                      
                      $scope.closeDialog = function() {
                          $mdDialog.hide();
                      };

                      var last = {
                          bottom: true,
                          top: false,
                          left: false,
                          right: true
                      };
                      
                      $scope.submit = function() {
                          $scope.progress = true;
                          
                          var ref = firebase.database().ref().child("transactions");
                          $scope.transactionsRef = $firebaseArray(ref);

                          $http.get('/bing/' + $scope.item.what + ' ' + $scope.item.category)
                                  .success(function(data, status, headers, config) {
                                      $scope.item.img = data.result;
                              
                                      $scope.transactionsRef.$add({
                                          category : $scope.item.category,
                                          cost : $scope.item.cost,
                                          img : $scope.item.img,
                                          type : $scope.item.type,
                                          what : $scope.item.what,
                                          when : $filter('date')($scope.item.when, "yyyy-MM-dd"),
                                          where : {
                                            lat : -79.378547,
                                            lng : 43.640908,
                                            name : "Cisco Systems Inc"
                                          }
                                      });
                                      
                                      $scope.showSimpleToast('Record Created!');
                                      $scope.progress = false;
                              
                                      $timeout(function() {
                                          $scope.closeDialog();
                                      }, 1000);
                                  })
                                  .error(function(data, status, headers, config) {
                                      $scope.showSimpleToast("Error Requesting Item Photo!");
                                      
                                      $scope.transactionsRef.$add({
                                          category : $scope.item.category,
                                          cost : $scope.item.cost,
                                          img : $scope.item.img,
                                          type : $scope.item.type,
                                          what : $scope.item.what,
                                          when : $filter('date')($scope.item.when, "yyyy-MM-dd"),
                                          where : {
                                            lat : -79.378547,
                                            lng : 43.640908,
                                            name : "Cisco Systems Inc"
                                          }
                                      });
                              
                                      $scope.showSimpleToast('Record Created!');
                                      $scope.progress = false;
                              
                                      $timeout(function() {
                                          $scope.closeDialog();
                                      }, 1000);
                          });
                      }

                      $scope.toastPosition = angular.extend({},last);
                      $scope.getToastPosition = function() {
                        sanitizePosition();

                        return Object.keys($scope.toastPosition)
                          .filter(function(pos) { return $scope.toastPosition[pos]; })
                          .join(' ');
                      };

                      function sanitizePosition() {
                        var current = $scope.toastPosition;
                        last = angular.extend({},current);
                      }

                      $scope.showSimpleToast = function(message) {
                        var pinTo = $scope.getToastPosition();

                        $mdToast.show(
                          $mdToast.simple()
                            .textContent(message)
                            .position(pinTo)
                            .hideDelay(3000)
                        );
                      };
                  }],
                  templateUrl: 'js/partials/addTransaction.html',
                  parent: angular.element(document.body),
                  clickOutsideToClose: true,
                  fullscreen: false,
                  openFrom: '#brand',
                  closeTo: '#brand'
                });
            }
        });