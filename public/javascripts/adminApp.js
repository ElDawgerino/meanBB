var app = angular.module('meanBB-admin', ['ui.router', 'angular-jwt', 'meanBB-sharedElements']);

app.controller('MainAdminCtrl', [
  '$scope',
  'page',
  'auth',
  function($scope, page, auth){
    $scope.admin = auth.isAdmin()
    if(!$scope.admin || ($scope.admin == undefined)){
        page.setTitle("Access Denied");
    } else {
        page.setTitle("Admin Panel");
    }
}]);
