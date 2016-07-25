var app = angular.module('meanBB-sharedElements', ['ui.router', 'angular-jwt']);

app.factory('auth', [
	'$http',
	'$window',
	'jwtHelper',
	function($http, $window, jwtHelper){
		var auth = {};

		//Saves the JWT to localStorage
		auth.saveToken = function(token) {
			$window.localStorage.setItem('meanBB-token', token);
		};

		//Retrieves the JWT from localStorage
		auth.getToken = function(){
			return $window.localStorage.getItem('meanBB-token');
		};

		//Returns true if the token hasn't expired
		auth.isLoggedIn = function(){
			var token = auth.getToken();

			if(token != null && token != "undefined"){
				return !jwtHelper.isTokenExpired(token);
			}

			return false;
		};

		//returns the current username
		auth.currentUser = function(){
			var token = auth.getToken();
			if(auth.isLoggedIn()){
				var payload = jwtHelper.decodeToken(token);
				return payload.username;
			}
		};

        //returns the admin status
        auth.isAdmin = function(){
            var token = auth.getToken();
            if(auth.isLoggedIn()){
                var payload = jwtHelper.decodeToken(token);
                return payload.admin;
            }
        }

		//registers the user with a POST /register
		auth.register = function(user){
			return $http.post('/register', user).success(function(data){
				auth.saveToken(data.token);
			});
		};

		//logins with a POST /login
		auth.login = function(user){
			return $http.post('/login', user).success(function(data){
				auth.saveToken(data.token);
			})
		};

		//logs out by deleting the token
		auth.logout = function(){
			$window.localStorage.removeItem('meanBB-token');
		};

		return auth;
}]);

//controller for the navbar
app.controller('NavCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
	$scope.isLoggedIn = function(){
		return auth.isLoggedIn();
	};

	$scope.currentUser = function(){
		return auth.currentUser();
	}

	$scope.logout = function(){
		return auth.logout();
	}

	//When the user clicks on "login"
	// the first time : $scope.showLogin = true and we show the login inputs
	// the second time : we call auth.login
	$scope.showLogin = false;
	$scope.user = {};
	$scope.login = function(){
		if($scope.showLogin){
			auth.login($scope.user).error(function(error){
				$state.go('login', {error: error.message});
			}).then(function(){
				$scope.showLogin = false;
				$state.go('home');
			});
		}
		else{
			$scope.showLogin = true;
		}
	}
}]);

//Page factory, used to store data such as the page title
app.factory('page', function(){
	var page = {};
	var title = "meanBB";

	page.setTitle = function(newTitle){
		title = newTitle;
	}

	page.getTitle = function(){
		return title;
	}

	return page;
});

//Displays the tile
app.controller('TitleCtrl', [
	'$scope',
	'page',
	function($scope, page){
		$scope.page = page;
}]);
