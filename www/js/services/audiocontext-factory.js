angular.module('services.AudioContext-Factory', []);

angular.module('services.AudioContext-Factory').factory('WebAudioContext', function ( $log ) {

            var _audioContext = null;
            var format = null;
            var isSupported = null;

            var getAudioContext = function(){
                return (window.hasOwnProperty('AudioContext')) ? new window.AudioContext() :
                              (window.hasOwnProperty('webkitAudioContext'))? new window.webkitAudioContext() : null;
            };

            var getOffLineAudioContext = function(){
                return (window.hasOwnProperty('OfflineAudioContext')) ? window.OfflineAudioContext :
                       (window.hasOwnProperty('webkitOfflineAudioContext'))? window.webkitOfflineAudioContext: null;
            }

            function AudioContextService(){
                this._audioContext = getAudioContext();
                this._OfflineAudioAudioContext =  getOffLineAudioContext();
                this.isSupported = (this._audioContext !== null);
                if (isSupported) {
                     console.log("[AudioContext-Factory]---creatd has this_audio this._audioContext ");
                    // this assumes that every browser with an AudioContext has an Audio element, too
                    this.format = !!(new window.Audio()).canPlayType('audio/ogg') ? 'ogg' : 'mp3';
                }else{
                    //TODO: let user know that the browser is unable to play back audio
                }
            };

            Object.defineProperty(AudioContextService.prototype, 'destination', {
                get: function () {
                    return this._audioContext.destination;
                }
            });

            Object.defineProperty(AudioContextService.prototype, 'currentTime', {
                get: function () {
                    return this._audioContext.currentTime;
                }
            });

            Object.defineProperty(AudioContextService.prototype, 'format', {
                writable: true
            });

            Object.defineProperty(AudioContextService.prototype, 'isSupported', {
                writable: true
            });

            AudioContextService.prototype.createMediaStreamSource = function (mediaStream) {

                var realAudioInputStream = this._audioContext.createMediaStreamSource(mediaStream);
                return realAudioInputStream;
            };

            AudioContextService.prototype.createOffLineContext = function(buffer1, buffer2){
                var bufferLength = buffer1[0].length > buffer2[0].length ? buffer1[0].length :
                                  buffer1[0].length < buffer2[0].length ? buffer2[0].length :
                                  buffer1[0].length == buffer2[0].length ? buffer1[0].length: null;

                var  channelCount   = 2;
                var  OfflineAudioAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                return  new OfflineAudioAudioContext( channelCount,   44100.0 * 10, 44100.0 );

            };

            AudioContextService.prototype.createBufferSource = function () {
                var bufferSource = this._audioContext.createBufferSource();

                if (!bufferSource.start) {
                    bufferSource.start = function (when, offset, duration) {
                        if (offset || duration) {
                            bufferSource.noteGrainOn(when, offset, duration);
                        } else {
                            bufferSource.noteOn(when);
                        }
                    };
                }

                if (!bufferSource.stop) {
                    bufferSource.stop = bufferSource.notOff;
                }

                return bufferSource;
            };

            AudioContextService.prototype.createBufferFromAudioBuffer = function( channelCount, stereoBuffer) {

                var audioBufferSource = this._audioContext.createBuffer( 2, stereoBuffer[0].length, this._audioContext.sampleRate );
                audioBufferSource.getChannelData(0).set(stereoBuffer[0]);
                audioBufferSource.getChannelData(1).set(stereoBuffer[1]);

                if (!audioBufferSource.start) {
                    audioBufferSource.start = function (when, offset, duration) {
                        if (offset || duration) {
                            audioBufferSource.noteGrainOn(when, offset, duration);
                        } else {
                            audioBufferSource.noteOn(when);
                        }
                    };
                }

                if (!audioBufferSource.stop) {
                    audioBufferSource.stop = audioBufferSource.noteOff;
                }
                return audioBufferSource;
            };


            AudioContextService.prototype.createAudioNode = function(bufferSize, numInputChannels, numOutputChannels) {
                var audioNode;
                if (!this._audioContext.createScriptProcessor) {
                    audioNode= this._audioContext.createJavaScriptNode(bufferSize, numInputChannels, numOutputChannels);
                } else {
                    audioNode = this._audioContext.createScriptProcessor(bufferSize, numInputChannels, numOutputChannels);
                }
                return audioNode;
            };

            AudioContextService.prototype.cloneAudioBuffer = function (audioBuffer) {
                return this._audioContext.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
            };


            AudioContextService.prototype.createGain = function () {
                return this._audioContext.createGain();
            };

            AudioContextService.prototype.decodeAudioData = function (audioData, successCallback, errorCallback) {
                return this._audioContext.decodeAudioData(audioData, successCallback, errorCallback);
            };

            AudioContextService.prototype.createChannelSplitter = function(val){
                return this._audioContext.createChannelSplitter(val);
            };


            AudioContextService.prototype.createChannelMerger = function(val){
                return this._audioContext.createChannelMerger(val);
            };


            AudioContextService.prototype.sampleRate = function(){
                return this._audioContext.sampleRate;
            };

            AudioContextService.prototype.createAnalyser = function(bufferSize ){
                var visualAnalyser = this._audioContext.createAnalyser();
                visualAnalyser.fftSize = typeof bufferSize !== 'undefined' ? bufferSize : 2048;
                return visualAnalyser;
            };


            return new AudioContextService();
    });
