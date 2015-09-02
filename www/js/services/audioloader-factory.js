'use strict';

angular.module('services.AudioLoader-Factory', ['services.AudioContext-Factory','services.AppModelState-Service']);
angular.module('services.AudioLoader-Factory').factory('AudioLoaderFactory', function ($q, WebAudioContext, AppModelState) {




    function AudioBufferLoader() {
        this.context          = WebAudioContext._audioContext;
        this.fileURL          = null;
        this.nsFile           = null;
        this.loadCount        = 0;
        this.audioBufferCount = 1;
        this.errorCount       = 0;

        // I am the possible states that the buffer can be in.
        this.states = {
            PENDING: 1,
            LOADING: 2,
            RESOLVED: 3,
            REJECTED: 4
        };

        //nocsonicstudiomodel || nocsonicdiscoverymodel
        this.requestType = '';
            // I keep track of the current state of the preloader.
        this.state = this.states.PENDING;

        // When loading the images, a promise will be returned to indicate
        // when the loading has completed (and / or progressed).
        this.deferred = $q.defer();
        this.promise = this.deferred.promise;

    }


    // ---
    // STATIC METHODS.
    // ---


    // I reload the given audio [Array] and return a promise. The promise
    // will be resolved with the array of image locations.
    AudioBufferLoader.bufferedAudioURLS = function( url , params, requestType ) {

        var audioBufferLoader = new AudioBufferLoader(  );
        audioBufferLoader.fileURL = url;
        if(params)
        audioBufferLoader.nsFile  = params;
        if(requestType)
        audioBufferLoader.requestType = requestType;

        return( audioBufferLoader.load() );

    };


    // ---
// INSTANCE METHODS.
// ---


AudioBufferLoader.prototype = {

    // Best practice for "instnceof" operator.
    constructor: AudioBufferLoader,


    // ---
    // PUBLIC METHODS.
    // ---


    // I determine if the audioBuffers has started loading data yet.
    isInitiated: function isInitiated() {

        return( this.state !== this.states.PENDING );

    },


    // I determine if the audioBuffers has failed to load all of the audio files.
    isRejected: function isRejected() {

        return( this.state === this.states.REJECTED );

    },


    // I determine if the audioBuffers has successfully loaded all of the audio files.
    isResolved: function isResolved() {

        return( this.state === this.states.RESOLVED );

    },


    // I initiate the audioBuffer loading Returns a promise.
    load: function load() {

        // If the audioBuffers are already loading, return the existing promise.
        if ( this.isInitiated() ) {

            return( this.promise );

        }

        this.state = this.states.LOADING;


        this.audioBufferLoad();

        // Return the deferred promise for the load event.
        return( this.promise );

    },


    // ---
    // PRIVATE METHODS.
    // ---


    // I handle the load-failure of the given image location.
    handleAudioURLError: function handleAudioURLError( error ) {

        $log.info("[AudioLoaderFactory] -- handleAudioURLError error ="+error);
        this.errorCount++;

        // If the preload action has already failed, ignore further action.
        if ( this.isRejected() ) {

            return;

        }

        this.state = this.states.REJECTED;

        this.deferred.reject( error );

    },


    // I handle the load-success of the given image location.
    handleBufferLoaded: function handleBufferLoaded(  ) {

        // If the preload action has already failed, ignore further action.
        if ( this.isRejected() ) {

            return;

        }

        // Notify the progress of the overall deferred. This is different
        // than Resolving the deferred - you can call notify many times
        // before the ultimate resolution (or rejection) of the deferred.
        /*this.deferred.notify({
            percent: Math.ceil( this.loadCount / this.audioBufferCount * 100 ),
            audioBufferObject: audioObject
        });*/

        // If all of the images have loaded, we can resolve the deferred
        // value that we returned to the calling context.
       // if ( this.loadCount === this.audioBufferCount ) {

            this.state = this.states.RESOLVED;

            this.deferred.resolve(true);

       // }

    },

    handleFileProgress: function handleFileProgress(){
        AppModelState.updateAudioDiscoveryPlayState((AppModelState.audioStateType()).PROGRESS,  this.nsFile);
    },


    // I load the given audio file location and then wire the load / error
    // events back into the AudioBuffer instance.
    // --
    // NOTE: The load/error events trigger a $digest.
    audioBufferLoad: function audioBufferLoad() {

        var audioBufferLoader = this;
        // Load buffer asynchronously
        var xhr = new XMLHttpRequest();

        if ('withCredentials' in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            console.log("[AudioLoader-factory] --- audioBufferLoader.fileURL ="+ audioBufferLoader.fileURL)
            xhr.open('GET',audioBufferLoader.fileURL, true);
        } else if (typeof XDomainRequest != 'undefined') {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, audioBufferLoader.fileURL);
        } else {
            // CORS not supported.
        }

        xhr.open('GET',  audioBufferLoader.fileURL, true);
        xhr.responseType = 'arraybuffer';


        xhr.onload = function() {
            // Asynchronously decode the audio file data in request.response
            audioBufferLoader.context.decodeAudioData(xhr.response,
                function(buffer) {
                    if (!buffer) {
                        audioBufferLoader.handleAudioURLError( 'error decoding file data ');
                        return;
                    }
                    audioBufferLoader.nsFile.buffer   = buffer;
                    audioBufferLoader.nsFile.loaded   = true;
                    AppModelState.updateAudioDiscoveryPlayState((AppModelState.audioStateType()).DOWNLOAD,  audioBufferLoader.nsFile);
                    audioBufferLoader.handleBufferLoaded();
                },
                function(error) {
                    if(audioBufferLoader.requestType =='discovery'){
                        audioBufferLoader.nsFile.buffer = 'ERROR';
                    }
                    audioBufferLoader.handleAudioURLError('decodeAudioData error' + error);
                }
            );
        }

        xhr.onprogress= function(evt)
        {
            if (evt.lengthComputable)
            {  //evt.loaded the bytes browser receive
                //evt.total the total bytes seted by the header
                //
                var percentComplete = (evt.loaded / evt.total) * 100;
                audioBufferLoader.handleFileProgress( );
            }
        }

        xhr.onerror = function() {
            audioBufferLoader.handleAudioURLError('BufferLoader: XHR error');
        }

        xhr.send();
    }

}


// Return the factory instance.
return( AudioBufferLoader );


});
