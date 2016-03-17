var app = angular.module('meanBB-admin', ['ui.router', 'angular-jwt', 'sharedElements']);

app.controller('HomeCtrl', [
  '$scope',
  'page'
  function($scope, page){
    page.setTitle("Admin Panel");
}]);
