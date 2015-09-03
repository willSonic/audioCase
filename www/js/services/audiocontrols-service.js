'use strict';
angular.module('services.AudioControls-Service', ['services.AudioContext-Factory']);
angular.module('services.AudioControls-Service').factory('AudioControlsFactory',
      function ($rootScope, $q, WebAudioContext, $log ) {

    var isLoading       = false;
    var isSuccessful    = false;
    var nocBeatPlaying  = false;
    var audioPlaying    = false;


    var playNocMashUpRequest   = false;


    var maxGain = 100;
    var currentMicLevel= -1;



    var nocSource          = null;
    var nocGainNode        = null;
    var nocGainAmount      = null;
    var beatSource         = null;
    var beatGainNode       = null;
    var beatGainAmount     = null;
    var vocalSource        = null;
    var vocalGainNode      = null;
    var vocalGainAmount    = null;

    var startOffset = 0;
    var startTime = 0;
    var actionStates = {
            PLAY:   "playAudioClip",
            STOP:   "stopAudioClip",
            BEAT_VOLUME: "updateBeatVolume",
            NOC_VOLUME:  "updateNocVolume"

         };

    var playTypes = {
             NOC_FILE:'nocFile',
             BEAT_CLIP:'singleBeatClip'
          };



     var NocSonicStudioModel = {};
     NocSonicStudioModel.nocSource       = null;
     NocSonicStudioModel.nocGainNode     = null;
     NocSonicStudioModel.nocGainAmount   = 70;
     NocSonicStudioModel.nocBuffer       = null;
     NocSonicStudioModel.nocFile         = null;
     NocSonicStudioModel.nocLoaded       = true;
     NocSonicStudioModel.nocCurrentTime  = 0;
     NocSonicStudioModel.nocPlayOn       = false;
     NocSonicStudioModel.beatSource      = null;
     NocSonicStudioModel.beatBuffer    = null;
     NocSonicStudioModel.beatFile        = null;
     NocSonicStudioModel.beatGainNode    = null;
     NocSonicStudioModel.oaded           = true;
     NocSonicStudioModel.currentTime     = 0;
     NocSonicStudioModel.beatGainAmount  = 70;
     NocSonicStudioModel.beatSource      = null;
     NocSonicStudioModel.beatPlayOn      = false;

    function setVolumeGain(gainAmount, gainRefNode ) {
         if(gainAmount && gainRefNode) {
            var fraction = parseInt(gainAmount) / parseInt(maxGain);
            gainRefNode.gain.value = gainAmount >=99?1:fraction * fraction;
         }
    }

    function playBackAudio( type){
         var startPlay          = 0;
         var offSetPlay         = 0;
         var durPlay            = 0;
         var loopPlay           = false;

         nocSource          = null;
         nocGainNode        = null;
         nocGainAmount      = null;
         beatSource         = null;
         beatGainNode       = null;
         beatGainAmount     = null;
         vocalSource        = null;
         vocalGainNode      = null;
         vocalGainAmount    = null;
         switch(type){
             case playTypes.NOC_FILE:
                 if(audioPlaying)
                     return ;

                 NocSonicStudioModel.nocSource      = WebAudioContext.createBufferSource();
                 nocSource                          = NocSonicStudioModel.nocSource;
                 nocGainNode                        = NocSonicStudioModel.nocGainNode ? NocSonicStudioModel.nocGainNode : WebAudioContext.createGain();
                 NocSonicStudioModel.nocGainNode    = nocGainNode;
                 nocGainAmount                      = NocSonicStudioModel.nocGainAmount;
                 nocSource.buffer                   = NocSonicStudioModel.nocBuffer;
                 nocSource.onended                   = stopNocFileAudio;

                 startTime                          = WebAudioContext._audioContext.currentTime;
                 audioPlaying                       = true;
                 NocSonicStudioModel.nocPlayOn       = true;
                 break;
             case playTypes.BEAT_CLIP:
                 if (audioPlaying)
                     return ;
                 loopPlay = true;

                 NocSonicStudioModel.beatSource     = WebAudioContext.createBufferSource();
                 beatSource                         = NocSonicStudioModel.beatSource;
                 beatGainNode                       = NocSonicStudioModel.beatGainNode ? NocSonicStudioModel.beatGainNode : WebAudioContext.createGain();
                 NocSonicStudioModel.beatGainNode   = beatGainNode;
                 beatGainAmount                     = NocSonicStudioModel.beatGainAmount;
                 beatSource.buffer                  = NocSonicStudioModel.beatBuffer;
                 startTime                          = WebAudioContext._audioContext.currentTime;
                 beatSource.loop                    = loopPlay;
                 audioPlaying                       = true;
                 NocSonicStudioModel.beatPlayOn     = true;
                 break;
         }

         if(beatSource){
             beatSource.connect(beatGainNode);
             setVolumeGain(beatGainAmount,  beatGainNode);
             beatGainNode.connect(WebAudioContext.destination);
             if(!beatSource.start) {
                 beatSource.start = beatSource.noteOn;
             }
             if(beatSource.buffer.duration)
                 durPlay = beatSource.buffer.duration;
             }

         if(nocSource){
            nocSource.start(startPlay);
        }

         if(beatSource){
            beatSource.start(startPlay);
        }
    }

    function stopAudioPlayBack(type) {
        switch (type) {
            case playTypes.NOC_FILE:
                if (!audioPlaying)
                    return;
                if (!NocSonicStudioModel.nocSource.stop){
                    NocSonicStudioModel.nocSource.source.stop = NocSonicStudioModel.nocSource.noteOff;
                }
                NocSonicStudioModel.nocSource.stop(0);
                NocSonicStudioModel.nocPlayOn = false;
                audioPlaying = false;
                startTime = 0;
                break;
            case playTypes.BEAT_CLIP:
                if (!audioPlaying)
                    return;
                if (!NocSonicStudioModel.beatSource.stop){
                    NocSonicStudioModel.beatSource.source.stop = NocSonicStudioModel.beatSource.noteOff;
                }

                NocSonicStudioModel.beatSource.stop(0);
                NocSonicStudioModel.beatPlayOn = false;
                if(NocSonicStudioModel.vocalBeat){
                    NocSonicStudioModel.vocalBeat = false;
                }
                audioPlaying = false;
                startTime = 0;
                break;

        }
        if(nocSource)
            nocSource.disconnect();

        if(nocGainNode)
            nocGainNode.disconnect();

        if(beatSource)
            beatSource.disconnect();

        if(beatGainNode)
            beatGainNode.disconnect();
    }

    return{
        actionStates :actionStates,
        playTypes :playTypes,
        audioControlsAction : function(actionType,params){
            switch(actionType){
                case actionStates.PLAY:

                   NocSonicStudioModel.beatBuffer = params.buffer;

                   playBackAudio(playTypes.BEAT_CLIP);
                break;
                case actionStates.STOP:
                    if(NocSonicStudioModel.beatPlayOn && !params)
                        params = playTypes.BEAT_CLIP;

                    if(NocSonicStudioModel.nocPlayOn && !params)
                        params = playTypes.NOC_FILE;

                    stopAudioPlayBack(params);
                break;
            }
        },

        endAudioPlayBack : function(){
            if(NocSonicStudioModel.beatPlayOn){
                stopAudioPlayBack(playTypes.BEAT_CLIP);
            }
            if(NocSonicStudioModel.nocPlayOn){
                stopAudioPlayBack(playTypes.NOC_FILE);
            }
        }

    }
});



