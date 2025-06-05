
Module.register("MMM-MultiCountdownModule", {
    // Default module config.
    defaults: {
      showNowClock:false,
      forceShow : true,
      mmmPagesHiddenPageName: "multicountdown",
      timers : [
        {
            displayName: "",
            deadlineTime: "",
            active: false,
            showMinutesBefore: 30,
            hideMinutesAfter: 5,
            warningWindowMinutes: 10,
						dangerWindowMinutes: 5,
            importance : 5,
            showDaysOfWeek: [0,1,2,3,4,5,6]
        }
      ]
    },

    getStyles: function() {
        return [
          "MMM-MultiCountdownModule.css"
        ]
      },

    active : false,

    timeout : null, 

    start: function() {
      this.active = false;
      console.log("Multicountdown is INACTIVE.");
      this.startTimeout();
    },

    startTimeout : function() {
      var self = this;
      this.timeout = setInterval(function() {
        self.updateDom(); // no speed defined, so it updates instantly.
      }, 1000); //perform every 1000 milliseconds.
    },

    endTimeout : function() {
      clearInterval(this.timeout);
    },

    // Override dom generator.
    getDom: function () {

      var wrapper = document.createElement("div");
      let config = this.config;

      let now = new Date();
     
      let nowDay = now.getDay();
      var nowHour = now.getHours();
      let nowMinute = now.getMinutes();
      let nowMilliseconds = now.getTime();
      let nowSeconds = nowMilliseconds / 1000;

      var isAnyTimerActive = false;

      config.timers.forEach((timer) => {

          if (!timer.showDaysOfWeek.includes(nowDay)) return;

          var timersWrapper = document.createElement("div");
          timersWrapper.className = "TIMER_WRAPPER";
          wrapper.appendChild(timersWrapper);

          //Is this timer active
          if (timer.active) {

              //console.log(nowMilliseconds);

              //Get the deadline
              let deadline = this.parseTime(timer.deadlineTime);
              let deadlineMilliseconds = deadline.getTime();
              let deadlineSeconds = deadlineMilliseconds / 1000;

              //The start and end window
              let deadlineStartWindowMilliseconds = deadlineMilliseconds - (timer.showMinutesBefore * 60 * 1000);
              let deadlineEndWindowMilliseconds = deadlineMilliseconds + (timer.hideMinutesAfter * 60 * 1000);

              //console.log("Start: " + (new Date(deadlineStartWindowMilliseconds)).toUTCString());
              //console.log("Now: " + (new Date(nowMilliseconds)).toUTCString());
              //console.log("End: " + (new Date(deadlineEndWindowMilliseconds)).toUTCString());

              //Are we in the display timeframe window
              if (nowMilliseconds > deadlineStartWindowMilliseconds && nowMilliseconds < deadlineEndWindowMilliseconds) {

                  //Active and within the window.
                  
                  isAnyTimerActive = true;
                  

                  //console.log("in the window...");

                  //We know we are in the window, are we before the deadline or after?
                  let inTheBeforeWindow = nowMilliseconds > deadlineStartWindowMilliseconds && nowMilliseconds < deadlineMilliseconds;
                  let inTheAfterWindow = nowMilliseconds < deadlineEndWindowMilliseconds && nowMilliseconds > deadlineMilliseconds;

                  let percent = 100;
                  let timeDeltaInMilliseconds = 0;

                  if (inTheBeforeWindow) {
                    //console.log("Before deadline");
                    percent= (deadlineMilliseconds - nowMilliseconds) / (deadlineMilliseconds - deadlineStartWindowMilliseconds) * 100;
                    timeDeltaInMilliseconds = deadlineMilliseconds - nowMilliseconds;

                  }

                  if (inTheAfterWindow) {
                    //console.log("After deadline");
                    percent = (nowMilliseconds - deadlineMilliseconds ) / (deadlineEndWindowMilliseconds - deadlineMilliseconds) * 100;
                    timeDeltaInMilliseconds = nowMilliseconds - deadlineMilliseconds;
                  }

                  let timeDeltaInSeconds = timeDeltaInMilliseconds / 1000;
                  let timeDeltaInMinutes = Math.floor(timeDeltaInSeconds / 60);
                  let timeDeltaRemainingSeconds = Math.floor(timeDeltaInSeconds - (timeDeltaInMinutes * 60));

                  //console.log("Number of minutes until deadline: " + timeDeltaInMinutes);
                  //console.log("Number of leftover seconds until deadline: " + timeDeltaRemainingSeconds);

                  let progressBarText = "Unknown";
                  let progressPercent = "100%";
                  let progressBackgroundColor = "green";
                  let progressBarTextColor = "white";
                  let progressBarClassName = "";

                  if (inTheBeforeWindow) {
                    percent = 100 - percent;

                    if (timeDeltaInMinutes > timer.warningWindowMinutes) progressBackgroundColor = "green";
                    else if (timeDeltaInMinutes > timer.dangerWindowMinutes) progressBackgroundColor = "yellow";
                    else {
                      progressBackgroundColor = "orange";
                      progressBarClassName = "blink-class"
                    }
                    progressBarText = "Remaining: ";

                  }
                  if (inTheAfterWindow) {
                    
                    progressBackgroundColor = "#8B0000";
                    progressBarText = "Over: ";
                    progressBarTextColor = "red"
                    progressBarClassName = "blink-class"
                  }

                  percent = Math.round(percent * 10000) / 10000;

                  progressBarText = progressBarText + timeDeltaInMinutes + " mins, " + timeDeltaRemainingSeconds + " sec";
                  progressPercent = percent + "%";


                  var timerWrapper = document.createElement("div");
                  timerWrapper.className = "TIMER_PARENT";
                  timerWrapper.style.display = "grid";
                  timerWrapper.style.gridTemplateColumns = "repeat(3, 1fr)";
                  timerWrapper.style.border = "solid #111111 1px"

                  timersWrapper.appendChild(timerWrapper);

                  var thirdPiece = document.createElement("div");

                  var deadlineOutput = document.createElement("span");
                  deadlineOutput.innerText = "Time: " + deadline.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  deadlineOutput.style.textAlign = "left";
                  deadlineOutput.style.fontSize = "25px";
                  deadlineOutput.style.float = "left";
                  deadlineOutput.style.marginLeft = "20px";

                  var taskDisplayName = document.createElement("span");
                  taskDisplayName.innerText  = timer.displayName;
                  taskDisplayName.style.fontSize = "50px";
                  taskDisplayName.style.color = "white";
                  taskDisplayName.style.fontWeight = "bold";
                  taskDisplayName.style.textAlign = "right";
                  taskDisplayName.style.float = "right";
                  taskDisplayName.style.marginRight = "20px";

                  thirdPiece.appendChild(deadlineOutput);
                  thirdPiece.appendChild(taskDisplayName);

                  thirdPiece.style.border = "solid #333333 1px"
                  timerWrapper.appendChild(thirdPiece);

                  var secondPiece = document.createElement("div");
                  secondPiece.style.width = progressPercent;
                  secondPiece.style.backgroundColor = progressBackgroundColor;
                  //secondPiece.innerText = progressPercent;
                  secondPiece.className = progressBarClassName;
                  timerWrapper.appendChild(secondPiece);

                  var firstPiece = document.createElement("div");
                  firstPiece.innerText = progressBarText;
                  firstPiece.style.fontSize = "50px";
                  firstPiece.style.color = progressBarTextColor;
                  firstPiece.style.border = "solid #333333 1px"
                  timerWrapper.appendChild(firstPiece);

                 

              }  
          }
      });

      //Any timers active and within the window, i.e. "something to show?"
      if (isAnyTimerActive) {

        if (this.active == false) {
          
          this.startTimeout();
          console.log("Starting showing the timers...");
  
          if (config.showNowClock){
            //Show the current time
            var currentTimeWrapper = document.createElement("div");
            currentTimeWrapper.style.fontSize = "50px";
            currentTimeWrapper.innerText = "Currently: " + now.toLocaleTimeString('en-US');
            wrapper.appendChild(currentTimeWrapper);
          }
  
          //Integration with MMM-Pages, if it is around.
          //We want to tell it to force view of this page that this is on
          //  https://github.com/edward-shen/MMM-pages
          
          if (config.forceShow) {
            //Pause rotation // PAUSE_ROTATION
            this.sendNotification("PAUSE_ROTATION");
          }
  
          //Show this hidden page // SHOW_HIDDEN_PAGE (string)
          this.sendNotification("SHOW_HIDDEN_PAGE", config.mmmPagesHiddenPageName);

          this.active = true;
          console.log("Multicountdown is ACTIVE.");
        }
        

      } else {
        //Tell MMM-pages to resume 

        if (this.active) {

          console.log("Hiding the timers...");
          this.endTimeout();

          //Hide this hidden page //LEAVE_HIDDEN_PAGE
          this.sendNotification("LEAVE_HIDDEN_PAGE");
          //Resume rotation // RESUME_ROTATION
          this.sendNotification("RESUME_ROTATION");
          this.sendNotification("PAGE_CHANGED", 0);
          
          this.active = false;
          console.log("Multicountdown is INACTIVE.");
        }


      }

      return wrapper;
    },

    parseTime : function(timeString) {	
        if (timeString == '') return null;
        
        var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);	
        if (time == null) return null;
        
        var hours = parseInt(time[1],10);	 
        if (hours == 12 && !time[4]) {
              hours = 0;
        }
        else {
            hours += (hours < 12 && time[4])? 12 : 0;
        }	
        var d = new Date();    	    	
        d.setHours(hours);
        d.setMinutes(parseInt(time[3],10) || 0);
        d.setSeconds(0, 0);	 
        return d;
    }

  });
