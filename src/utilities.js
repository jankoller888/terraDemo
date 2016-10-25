

(function(){
	'use strict'
	angular.module('RoutingApp',['ui.router']);
	angular.module('RoutingApp')
	.service('UtilitiesService',UtilitiesService);

function UtilitiesService(){
	var service = this ;
	var customSort= function(e1,e2){
		return new Date(e1.recordDate).getTime() - new Date(e2.recordDate).getTime();
		}

	var OriginalSchedule=[{'startT':1476418012000, 'endT':1476418412000}, {'startT':1476418512000, 'endT':1476411012000}];

	var data =[{'Tstart':1476418012000, 'Tend':1476418412000}, {'Tstart':1476418512000, 'Tend':1476411012000}]


	service.findMatchEvent =function (timeTuple,schedule){
		// expect timeTUple is object with ({{'Tstart':1476418012000, 'Tend':1476418412000}})
		// event which have closest distance to the stop and start pari in timeTuple
		var minInd=0;

		var minDist = Math.abs(timeTuple.Tstart- schedule[0].startT)/1000 + Math.abs(timeTuple.Tend- schedule[0].endT)/1000;
		var temp =0;
		for (var i = 1; i < schedule.length; i++) {
			 temp=Math.abs(timeTuple.Tstart- schedule[i].startT)/1000 + Math.abs(timeTuple.Tend- schedule[i].endT)/1000;
			 if (temp < minDist){
			 	minDist = temp;
			 	minInd = i;
			 }
		};

		return minInd;
	}

	service.updateStartStopTime= function(session,timeTuple){
		
		if (session.hasOwnProperty('realStart')){
			session.realStart=Math.min(timeTuple.Tstart,session.realStart);
		}
		else{
			session.realStart=timeTuple.Tstart;
		}
		
		if (session.hasOwnProperty('realEnd')){
			session.realEnd=Math.max(timeTuple.Tend,session.realEnd);
		}
		else{
			session.realEnd=timeTuple.Tend;
		}

	}

	service.convertToTimeTuple = function(eventList){
		// expect is array of of events with isStart
		// assume first element is all isStart after sorting 
		eventList.sort(customSort);
		if ((eventList.length>0)&&!eventList[0].isStart){
			eventList.shift();
		}

		var dataArr =[];
		for (var i = 0; i < Math.floor(eventList.length/2); i++) {
			dataArr.push({'Tstart':new Date(eventList[i*2].recordDate).getTime(),'Tend': new Date(eventList[i*2+1].recordDate).getTime()}) ;  
			
		};

		return dataArr;

	}

	service.getScheduleformat = function(scheduleEvents){
		var dataArr=[];

		for (var i = 0; i < scheduleEvents.length; i++) {
			dataArr.push({'startT': scheduleEvents[i].startTime, 'endT': scheduleEvents[i].endTime});
		};

		return dataArr;
	}

}
		
	
})();

