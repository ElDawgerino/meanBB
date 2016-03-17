var app = angular.module('MeanBB', ['ui.router', 'angular-jwt']);

//Creates the object containing the site data
app.factory('discussionsList', ['$http', function($http){
	var o = {
		discussionsList: []
	};

	//Retrieve the discussionsList with GET /discussionsList
	o.getDiscussionsList = function() {
		return $http.get('/discussionsList').success(function(data){
			angular.copy(data, o.discussionsList);
		});
	};

	//Create a new discussion with POST /discussionsList
	o.create = function(discussion) {
		return $http.post('/discussionsList', discussion).success(function(data){
			o.discussionsList.push(data);
		});
	};

	//Retrive the content of a discussion with GET /discussion/id
	o.getDiscussion = function(id) {
		return $http.get('/discussion/' + id).then(function(res){
			return res.data;
		});
	};

	//Add a post to the discussion with POST /discussion/id
	o.add = function(discussion, post) {
		return $http.post('/discussion/' + discussion._id, post);
	};

	return o;
}]);

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

//Passing JWTs to requests
app.config([
	'$httpProvider',
	'jwtInterceptorProvider',
	function($httpProvider, jwtInterceptorProvider){
		jwtInterceptorProvider.tokenGetter = function(){
			return localStorage.getItem('meanBB-token');
		}
		$httpProvider.interceptors.push('jwtInterceptor');
	}
]);

//Routing
app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	//The home (default) route, loads home.html template and resolves the discussionsList
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller: 'HomeCtrl',
		resolve: {
			discussionsPromise: ['discussionsList', function(discussionsList){
				return discussionsList.getDiscussionsList();
			}]
		}
	});

	//The discussion route, loads the discussion.html template and resolves the discussion
	$stateProvider.state('discussion', {
			url: '/discussion/{id}',
			templateUrl: '/discussion.html',
			controller: 'DiscussionCtrl',
			resolve: {
				discussion: ['$stateParams', 'discussionsList', function($stateParams, discussionsList){
					return discussionsList.getDiscussion($stateParams.id);
				}]
			}
	});

	$stateProvider.state('login', {
		url: '/login/{error}',
		templateUrl: '/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	});

	$stateProvider.state('register', {
		url: '/register',
		templateUrl: '/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	});

	$urlRouterProvider.otherwise('home');
}]);

//Controller of the index
app.controller('HomeCtrl', [
'$scope',
'$state',
'discussionsList',
function($scope, $state, discussionsList){
	$scope.discussionsList = discussionsList.discussionsList;

	$scope.getDate = function(dateToParse){
		return Date.parse(dateToParse);
	};

	//Creates the discussion and adds the first post on success
	//It thens redirect the user to the created discussion
	$scope.createDiscussion = function(){
		if(!$scope.title || $scope.title === '') {return;}

		discussionsList.create({
			title: $scope.title
		}).success(function(discussion) {
			$scope.title= '';

			if(!$scope.text || $scope.text === '') {$state.go('discussion', {id: discussion._id}, {});}
			discussionsList.add(discussion, {
				text: $scope.text
			});
			$scope.text= '';

			$state.go('discussion', {id: discussion._id}, {reload: true});
		});

	};
}]);

//Controller for the authentification
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	function($scope, $state, $stateParams, auth) {
		$scope.user = {};
		$scope.error = {};
		$scope.error.message = $stateParams.error;

		$scope.register = function() {
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.login = function() {
			auth.login($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
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
}])

//controller for the discussion page
app.controller('DiscussionCtrl', [
'$scope',
'$state',
'discussionsList',
'discussion',
function($scope, $state, discussionsList, discussion){
	$scope.discussion = discussion;
	$scope.discussion.date = Date.parse($scope.discussion.date);

	//Adds a new post to the discussion and reloads the page
	$scope.addPost = function(){
		if(!$scope.text || $scope.text === '') {return;}

		discussionsList.add(discussion,{
			text: $scope.text,
		}).success(function(discussion){
			$scope.text = '';
			$state.go($state.current, {}, {reload: true});
		});

	};
}]);
