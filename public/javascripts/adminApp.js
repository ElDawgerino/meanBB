var app = angular.module('meanBB-admin', ['ui.router', 'angular-jwt', 'meanBB-sharedElements']);

app.factory('adminNet', [
    '$http',
    function($http){
        var o = {};

        o.getUsers = function(callback){
            return $http.get('admin/users').success(function(data){
                callback(data);
            });
        };

        return o;
}]);

app.controller('MainAdminCtrl', [
  '$scope',
  'page',
  'auth',
  'adminNet',
  function($scope, page, auth, adminNet){
    $scope.admin = auth.isAdmin()
    if(!$scope.admin || ($scope.admin == undefined)){
        page.setTitle("Access Denied");
    } else {
        page.setTitle("Admin Panel");
        adminNet.getUsers(function(data){
            $scope.users = data;
        });
    }
}]);
