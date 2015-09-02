'use strict';

angular.module('services.AppModelState-Service', []);
angular.module('services.AppModelState-Service').service('AppModelState', ['$rootScope', '$log', '$filter', function($rootScope, $log, $filter) {

    var audioState = {
        START_PLAYLIST:'startplaylist',
        PLAY:'play',
        STOP:'stop',
        PAUSE:'pause',
        PROGRESS:'progress',
        LOOP:'loop',
        NEXT:'next',
        MUTE:'mute',
        DOWNLOAD:'download'
    }

    var discoveryState={
        UNSELECTED:'unselected',
        NAVIGATOR:'navigator',
        PLAYLIST:'playlist',
        PORTAL:'portal',
        MANIFESTO:'manifesto'
    }

    var userStudioSonicList         = [];

    this.studioIsOpen              = false;
    this.discoveryIsOpen           = false;
    this.defaultNocView            = true;
    this.discoveryRightSelected    = discoveryState.UNSELECTED;
    this.nocsonicGenres            = null;
    this.nocsonicSubGenresById     = null;
    this.nocsonicGenresByTopClass  = {};
    this.nocsonicGenreById         = {};
    this.nocsonicRanktags          = [];
    this.mbNSTypeRequest           =  null;

    this.currentNocSonicFile       = null;
    this.playListAutoPlay          = false; //default


    this.initialLeaderBoardSeeded = function(){
        $log.debug("[services.AppModelState-Service] -- initialLeaderBoardSeeded broadcast event" );
        $rootScope.$broadcast('leaderBoardSeeded::change', {} );
    }


    this.audioStateType = function(){
        return audioState;
    }
    this.discoveryStateType = function(){
        return discoveryState;
    }

    this.setPlayListAutoPlay = function(value){
        this.playListAutoPlay = value;
        $rootScope.$broadcast('playListAutoPlay::change', this.playListAutoPlay );
    }

    this.playRequestedItem = function(itemId){
        $rootScope.$broadcast('playItemRequest::change', itemId );
    }

    this.getPlayListAutoPlay= function(){
        return this.playListAutoPlay;
    }

    this.setSideDiscoverySelectChange = function(value){
       this.discoveryRightSelected = value;
        $rootScope.$broadcast('discoverySelectState::change', this.discoveryRightSelected);
    }

    this.getDiscoverySelected = function(){
        return this.discoveryRightSelected;
    }

    this.setNocSonicGenres = function(genreData){
        var genres     = genreData.genres;
        var subgenres  = genreData.subgenres;
        var index      = 0;
        var genreByTop = {};
        var genreById  = {};
        var subGenreListById={}
        angular.forEach(genres, function(genre){
            var subGenreList={};
            var count = 0;
            angular.forEach(subgenres, function(sub){
                var found =  $filter('filter')(genre.sub_genres,  sub.id, true);
                if( found.length != 0) {
                    sub['statsView'] = false;
                    sub['seleected'] = false;
                    subGenreList[sub.topclass]=sub;
                    subGenreListById[sub.id]=sub;
                    count++;
                }
            });

            genre['subQnty'] = count;
            genre['subgenre_list'] = subGenreList;
            genreByTop[genre.topclass] = genre;
            genreById[genre.id] = genre;
            subGenreListById
            index++;
        })
        this.nocsonicGenres = genres;
        this.nocsonicGenreById = genreById;
        this.nocsonicGenresByTopClass = genreByTop;
        this.nocsonicSubGenresById = subGenreListById;
    }

    this.getNocSonicGenres = function(){
        return this.nocsonicGenres;
    }

    this.doNocSonicIsotopeChange = function(filterType, filterParams){
        $rootScope.$broadcast('isotopeEvent::change', {filterType:filterType, filterParams:filterParams});
    }

    this.getNocSonicGenresByTopClass = function(value){
        return this.nocsonicGenresByTopClass[value];
    }

    this.getNocSonicGenreById= function(value){
        return this.nocsonicGenreById[value];
    }

    this.getNocSonicGenreNameById= function(value){
        if(this.nocsonicGenreById[value]){
            return this.nocsonicGenreById[value].genre_name;
        }
        return false;
    }

    this.getNocSonicSubGenreById= function(value){
        return this.nocsonicSubGenresById[value];
    }

    this.getNocSonicSubGenreNameById= function(value){
        return this.nocsonicSubGenresById[value].subgenre_name;
    }

    this.setNocSonicRankTags = function(qts){
        this.nocsonicRanktags =qts;
    }
    this.getNocSonicRankTags = function(){
        return this.nocsonicRanktags;
    }
    this.setLeftBorderMenuState = function(boolVal){
        this.studioIsOpen = boolVal;
        $rootScope.$broadcast('updateBorderLeftOpenState::change', {studioIsOpenChange: this.studioIsOpen});
    }

    this.setRightBorderMenuState = function(boolVal){
        this.discoveryIsOpen = boolVal;
        $rootScope.$broadcast('updateBorderRightOpenState::change', {discoveryIsOpenChange:this.discoveryIsOpen});
    }

    this.updateLoggedInENVstate  =  function(){
        $rootScope.$broadcast('updateLoggedInENVstate::change',{});
    }

    this.setQuickViewState = function(boolVal){
        $rootScope.$broadcast('quickViewScreenPresence::change', boolVal);
    }
    this.setNocOrSonicState = function(boolVal){
        this.defaultNocView = boolVal;
        $rootScope.$broadcast('nocOrSonciDefaultView::change', this.defaultNocView);
    }


    this.getLeftBorderMenuState = function(boolVal){
        return this.studioIsOpen;
    }

    this.getRightBorderMenuState = function(boolVal){
        return this.discoveryIsOpen;
    }

    this.setLeftBorderMenuState = function(boolVal){
        this.studioIsOpen = boolVal;
        $rootScope.$broadcast('updateBorderLeftOpenState::change', {studioIsOpenChange:this.studioIsOpen});
    }

    this.setNewMediaList = function(){
        $rootScope.$broadcast('updateNewMediaList::change');
    }

    this.updateUserStudio = function(){
        userStudioSonicList = $rootScope.authStatus.studio.audio_library;
    }

    this.checkListForUserSonic = function(sonicId){
        var sonicFound = false;
        for(var i=0; i < userStudioSonicList.length; ++i ){
           if(userStudioSonicList[i].id == sonicId){
               sonicFound = true;
               break;
           }
        }
        return sonicFound;
    }

    this.setMbNSTypeRequest  = function(type){
        this.mbNSTypeRequest = type;
    }

    this.getMbNSTypeRequest  = function(){
       return  this.mbNSTypeRequest;
    }

    this.updateAudioDiscoveryPlayState = function(audioStateType, param){
        var eventObject
        switch(audioStateType){
            case audioState.START_PLAYLIST:
                eventObject =  { action:audioState.START_PLAYLIST};
             break;
            case audioState.PLAY:
                eventObject =  {nsFile:param,  action:audioState.PLAY};
            break;
             case audioState.STOP:
                 eventObject =  {nsFile:param,  action:audioState.STOP};
                break;
            case audioState.DOWNLOAD:
                eventObject =   {nsFile:param,  action:audioState.DOWNLOAD};
                break;
            case audioState.PROGRESS:
                eventObject =  {nsFile:param,  action:audioState.PROGRESS};
                break;
            case audioState.PAUSE:
                eventObject =     {nsFile:param,  action:audioState.PAUSE};
                break;
            case audioState.NEXT:
                eventObject =    {action:audioState.NEXT};
                break;
            case audioState.LOOP:
                eventObject =     {action:audioState.LOOP};
                break;
            case audioState.MUTE:
                eventObject =  {muteVal:param, action:audioState.MUTE};
                break;
        }
        $rootScope.$broadcast('nocAudioAction::change', eventObject);
    }

    this.getNewMediaList = function(){
        return this.newMediaList;
    }
}]);
