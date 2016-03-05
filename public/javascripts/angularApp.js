var app = angular.module('MeanBB', ['ui.router']);

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
	function($http, $window){
		var auth = {};

		//Saves the JWT to localStorage
		auth.saveToken = function(token) {
			$window.localStorage['meanBB-token'] = token;
		};

		//Retrieves the JWT from localStorage
		auth.getToken = function(){
			return $window.localStorage['meanBB-token'];
		};

		//Returns true if the token hasn't expired
		auth.isLoggedIn = function(){
			var token = auth.getToken();

			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			}

			return false;
		};

		//returns the current username
		auth.currentUser = function(){
			if(auth.isLoggedIn()){
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

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
		auth.logOut = function(){
			$window.localStorage.removeItem('meanBB-token');
		}

		return auth;
}]);

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

	$urlRouterProvider.otherwise('home');
}]);

//Controller of the index
app.controller('HomeCtrl', [
'$scope',
'$state',
'discussionsList',
function($scope, $state, discussionsList){
	$scope.discussionsList = discussionsList.discussionsList;

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

//controller for the discussion page
app.controller('DiscussionCtrl', [
'$scope',
'$state',
'discussionsList',
'discussion',
function($scope, $state, discussionsList, discussion){
	$scope.discussion = discussion;

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
