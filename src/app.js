 testdata=null;
 testdata2=null;
(function () {
'use strict'


angular.module('RoutingApp')
.config(RoutesConfig)
.controller('ScheduleController',ScheduleController)
.controller('EventDetailController',EventDetailController)
.service('EventListService',EventListService)
.constant('servAddr','http://acoustic.ifp.illinois.edu:8080')
.constant('ApiBasePath', "http://davids-restaurant.herokuapp.com");




EventDetailController.$inject=['EventListService', 'UtilitiesService'];
function EventDetailController(EventListService, UtilitiesService){
  var ctrl=this;
  ctrl.playSound = EventListService.playSound;
  ctrl.activeEvent = EventListService.getActiveEvent(); //$state.params.activeEvent;
  ctrl.tags =[{recordDate:'2016-10-14T17:00:05.000Z',tag:'how are you?'}];
  console.log(ctrl);
  var t1=  new Date(ctrl.activeEvent.realStart).toISOString(); //new Date('Fri Oct 14 2016 12:00:05 GMT-0500').toISOString();  //new Date(ctrl.activeEvent.startTime).toISOString();
  var t2 = new Date(ctrl.activeEvent.realEnd).toISOString();//new Date('Fri Oct 14 2016 13:00:05 GMT-0500').toISOString();  //new Date(ctrl.activeEvent.endTime).toISOString();

  var promise = EventListService.getQAEvents(t1,t2);

  promise.then(function (response) {
    console.log('promise done');
    var temp=response.data;
    temp.sort(function(e1,e2){ // make sure every event is short by time 
      return new Date(e1.recordDate).getTime() - new Date(e2.recordDate).getTime();
    });
    ctrl.tags= temp;
   console.log (response);
  })
  .catch(function (error) {
    console.log("Something went terribly wrong.");
  });
}



//creat an controller  for Schedule page
ScheduleController.$inject = ['EventListService','$state','UtilitiesService'];
function ScheduleController(EventListService,$state,UtilitiesService){
  var ctrl = this;
  ctrl.events= EventListService.getEventList();
  console.log('cotroller is running');
  console.log(ctrl);
  var schedule = UtilitiesService.getScheduleformat(ctrl.events);
  
  var t1=   new Date().toISOString();//"2016-10-13T20:04:06.000Z";1476735695371-60*1000
  var t2 =  new Date(Math.min(Date.now(),new Date(t1).getTime()+1000*60*60*24)).toISOString();   //"2016-10-13T21:06:06.595Z";


  var promise=[];
  setInterval(function(){

  promise= EventListService.getStartStopEvents(t1,new Date().toISOString());
  //promise= EventListService.getStartStopEvents(t1,t2);

  promise.then(function (response) {
    console.log('promise done');
    testdata= response.data; // for test only
    
    testdata= UtilitiesService.convertToTimeTuple(testdata);
    var matchedInd= -1; // valid index should start at 0, -1 means no valid index found
    //update the timestamp
    if (testdata.length){
      t1 = new Date(testdata[testdata.length-1].Tend+100).toISOString(); //+100 to exculde the last stop event
    }
    
    for (var i = 0; i < testdata.length; i++) {
      matchedInd =UtilitiesService.findMatchEvent(testdata[i],schedule)
      UtilitiesService.updateStartStopTime(ctrl.events[matchedInd],testdata[i]);
      EventListService.setEventinProgess(matchedInd);
      console.log(matchedInd);
    };
    if (matchedInd>0){
      for (var j = 0; j < matchedInd ; j++) {
        EventListService.setEventisDone(j);
      };
       
    }
   console.log (response);
  })
  .catch(function (error) {
    console.log("Something went terribly wrong.");
  });},15*1000);
  
  //for click event
  ctrl.gotoDetail= function (e){
    EventListService.setActiveEvent(e);
    $state.go('event');
  }
}


//create evetListService
EventListService.$inject =['$http','ApiBasePath','servAddr']
function EventListService($http,ApiBasePath,servAddr){
  var service= this;
  var events =[]; // this will be share between controller
  var activeEvent = null;
  //put some example event in
                  //'{"$and":['+strArr.join(',')+']}';
    // Construct the query string
  //var qStr = JSON.stringify({'dbname':DB, 'colname': EVENT, 'user': USER, 'passwd': PWD, 'classname': q.cname});
  var qStr='dbname=publicDb&colname=event&user=&passwd=publicPwd&classname=none';
  var qStr1='dbname=publicDb&colname=data&user=&passwd=publicPwd&classname=none';

  // add log start log stop for an event when capture form database //1476735695371
  var baseTime = new Date().getTime();//1476464405000+20*60*1000;  // time of recent recording for poster purpose //new Date().getTime();    //1477409400000; //8:30 on Oct 25th 2016
  var baseTime2= baseTime +4*60*60*1000; // 13:00 start afternoon section
  //add duration interval
  events=[{
    name:'Welcome',
    speaker:'Edward Lee, Director',
    startTime:baseTime,
    endTime:baseTime+ 2*60*1000,//5*60*1000,
    status:"Upcoming",
    isdone: false,
    isactive:false
    //realStart:baseTime+ 3*60*1000,
    //realEnd:baseTime + 4*60*1000
  },{
    name:'MARCO Perspective Stakeholder for TerraSwarm Annual Review',
    speaker:'Gil Vandentop (SRC)',
    startTime:baseTime+2*60*1000,//5*60*1000,
    endTime:baseTime+4*60*1000,//10*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },{
    name: 'TerraSwarm: State of the Center',
    speaker:'Edward Lee, Director',
    startTime:baseTime+ 4*60*1000,//75*60*1000,//'8:45',
    endTime:baseTime+  6*60*1000,//105*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: 'Introduction to Demos',
    speaker:'John Wawrzynek (Berkeley)',
    startTime:baseTime+75*60*1000,//'8:45',
    endTime:baseTime+105*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: 'Theme 1/ Proactive Worlds',
    speaker:'Prabal Dutta (Michigan) and Richard Murray (Caltech)',
    startTime:baseTime+130*60*1000,//'8:45',
    endTime:baseTime+165*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: 'Theme 1/ Proactive Worlds Tweets',
    speaker:'Students',
    startTime:baseTime+165*60*1000,//'8:45',
    endTime:baseTime+195*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: 'Theme 2/ Methodologies, Models and Tools',
    speaker:'Alberto Sangiovanni-Vincentelli (Berkeley) and Sanjit Seshia (Berkeley)',
    startTime:baseTime2,//'8:45',
    endTime:baseTime2+45*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: 'Theme 2 Tweets',
    speaker:'Students',
    startTime:baseTime2+45*60*1000,//'8:45',
    endTime:baseTime2+75*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: ' Theme 3/ Services and Cloud Interactions',
    speaker:'Jeff Bilmes (Washington) and Anthony Rowe (CMU)',
    startTime:baseTime2+75*60*1000,//'8:45',
    endTime:baseTime2+120*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  {
    name: 'Theme 3 Tweets',
    speaker:'Students',
    startTime:baseTime2+120*60*1000,//'8:45',
    endTime:baseTime2+150*60*1000,
    status:"Upcoming",
    isdone:false,
    isactive:false
  },
  ];
// for testing
  testdata2=events;
//----------------
  service.setEventinProgess= function(ind){
    events[ind].status='in progress ...'
    events[ind].isactive=true;
  };

  service.setEventisDone =function(ind){
    events[ind].isdone=true;
    events[ind].status='Done';
    events[ind].isactive='false;'
  };

  service.getEventList = function(){
    console.log('events:'+events);
    return events;
  };
  service.setActiveEvent = function(e){
    activeEvent=e;
  };
  service.getActiveEvent = function(){
    return activeEvent;
  };
  service.getStartStopEvents= function(t1,t2){
     var q={};
      q.t1=t1// "2016-10-13T20:04:06.000Z";    //'2016-10-12T17:40:51.000Z';
      q.t2 =t2 //"2016-10-13T21:06:06.595Z";//'2016-10-12T17:45:51.000Z';
      q.isStart = '{"$exists":true}';
      q.mask ={'_id':false,'androidID':true, 'maxDur':true,'tag':true,'recordDate':true,'isStart':true};
      var strArr = [];
      strArr = strArr.concat('{"recordDate":{"$gte":{"$date":"'+ q.t1+'"}, "$lte":{"$date":"'+q.t2+'"}}}');
      strArr = strArr.concat('{"isStart":'+q.isStart+'}');
      var postDat = '[{"$and":['+strArr.join(',')+']},'+ JSON.stringify(q.mask) + ']';    
    var response = $http({
      method: "POST",
      url: (servAddr + "/query?"+ qStr),
      data: postDat
    });

    return response;
  }
  service.getQAEvents= function(t1,t2){
    var q={};
  q.t1=t1;
  q.t2=t2;
  q.androidID="b8a9953125a933af";
  q.isStart = '{"$exists":false}';
  q.mask ={'_id':false,'androidID':true,'tag':true,'recordDate':true,'isStart':true,'filename':true};
  var strAtt2 =[];
  strAtt2 = strAtt2.concat('{"recordDate":{"$gte":{"$date":"'+ q.t1+'"}, "$lte":{"$date":"'+q.t2+'"}}}');
  strAtt2 = strAtt2.concat('{"isStart":'+q.isStart+'}');
  var postDat1 = '[{"$and":['+strAtt2.join(',')+']},'+ JSON.stringify(q.mask) + ']';  

  var response = $http({
      method: "POST",
      url: (servAddr + "/query?"+ qStr),
      data: postDat1
    });

    return response;
  }

  service.playSound = function(filename){
    console.log(filename);
    
    $http({
        method: "GET",
        url:(servAddr+'/gridfs?'+qStr1+'&filename='+filename),
        responseType: "arraybuffer"
    }).then(function(resp){
        //console.log(resp);
        var data = resp.data;
        console.log('data.byteLength = '+data.byteLength);
        soundPlay(data);
    }).catch(function(err){
        console.log('cannot download data');
        alert('cannot download data');
    });
  }
}

var audioCtx = new AudioContext(); // should only have 1 per doc
var soundPlay = function(data){
	audioCtx.decodeAudioData(data, function(buf){
		// play the sound
		var source = audioCtx.createBufferSource();
		source.buffer = buf;
		source.connect(audioCtx.destination);
		source.start(0);
	}, function(error){
			console.log('audio decoding error');
	});
};

RoutesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
function RoutesConfig($stateProvider, $urlRouterProvider) {

  // Redirect to tab 1 if no other URL matches
  $urlRouterProvider.otherwise('/schedule');

  // Set up UI states
  $stateProvider
    .state('event', {
      url: '/eventDetails',
      templateUrl: 'src/eventDetails.html'
    })

    .state('schedule', {
      url: '/schedule',
      templateUrl: 'src/schedule.html',    
    });
}


})();
