function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function Demo(settings){
	var self = this;

	for (var name in settings) {
	    this[name] = settings[name];
	}
	
	this.ui = typeof this.ui === "undefined" ? {} : this.ui;

	this.shiftDown = false;

	//thanks to http://stackoverflow.com/questions/11101364/javascript-detect-shift-key-down-within-another-function
	this.setShiftDown = function(event){
		if(event.keyCode === 16 || event.charCode === 16){ //for future reference, alt key is 18
			self.shiftDown = true;
		}
	};

	this.setShiftUp = function(event){
		if(event.keyCode === 16 || event.charCode === 16){
			self.shiftDown = false;
		}
	};

	this.addUIElement = function(prop){
		var ui = this.ui;
		// console.log(this, ui);

		var propContainerSelector = '#'+prop+'-interface'; 

		if (ui[prop].className){
			className = ui[prop].className + " ";
		} else {
			className = '';
		}
		$('#ui-container').append("<div class='interface " +className+ "clearfix' id='"+prop+"-interface'></div>");

		//buttons don't need <label> tags because their "label" is determined like so: <button>Label</button>
		if (ui[prop].type != "button"){
			$(propContainerSelector).append("<label>"+ui[prop].title+"</label>");
		}

		if (ui[prop].type == "userInputNumerical"){
  			inputBoxHTML = "<input class='form-control user-input-numerical' value='"+ui[prop].value+"'>";
	  		$(propContainerSelector).append(inputBoxHTML);
  		    $('#'+prop+'-interface input').change(function(){
	    		ui[prop].value = parseFloat($('#'+prop+'-interface input').val());
  		        self.sendEvent(ui[prop].title, 'value changed', window.location.pathname);
  			    // self.update(prop);
			});
		} else if (ui[prop].type == "userInputString"){
			var inputBoxHTML = "";
  			if (ui[prop].prepend){
	  			inputBoxHTML = "<div class='input-group'>";
  				inputBoxHTML += "<span class='input-group-addon'>"+ui[prop].prepend+"</span>";
  			}
  			inputBoxHTML += "<input class='form-control user-input-string' value='"+ui[prop].value+"'>";
  			if (ui[prop].prepend){
	  			inputBoxHTML += "</div>";
	  		}
	  		$(propContainerSelector).append(inputBoxHTML);
  		    $('#'+prop+'-interface input').change(function(){
	    		ui[prop].value = $('#'+prop+'-interface input').val();
  		        self.sendEvent(ui[prop].title, 'value changed', window.location.pathname);
  			    // self.update(prop);
			});
		} else if (ui[prop].type == "userInputTextarea"){
  			inputBoxHTML = "<textarea class='form-control user-input-textarea'>"+ui[prop].value+"</textarea>";
	  		$(propContainerSelector).append(inputBoxHTML);
  		    $('#'+prop+'-interface textarea').change(function(){
	    		ui[prop].value = $('#'+prop+'-interface textarea').val();
  		        self.sendEvent(ui[prop].title, 'value changed', window.location.pathname);
  			    // self.update(prop);
			});
		} else if (isNumber(ui[prop].value) && (!$.isArray(ui[prop].values))){ 
	  		if (ui[prop].units){
	  			sliderInputBoxHTML = "<div class='input-group'><input class='form-control with-units' value='"+ui[prop].value+"'><span class='input-group-addon'>"+ui[prop].units+"</span></div>";
	  		} else if (ui[prop].input === 'readonly'){
	  			sliderInputBoxHTML = "<input value='"+ui[prop].value+"' readonly>";
	  		} else if (ui[prop].input === 'hidden') {
	  			sliderInputBoxHTML = "<input class='form-control' value='"+ui[prop].value+"' type='hidden'>";
	  		} else {
	  			sliderInputBoxHTML = "<input class='form-control' value='"+ui[prop].value+"'>";
	  		}

	  		$(propContainerSelector).append(sliderInputBoxHTML);

			$(propContainerSelector).noUiSlider({
				range: ui[prop].range,
				start: ui[prop].value,
				handles: 1,
				connect: "lower",
				step: (ui[prop].step) ? ui[prop].step : undefined,
				slide: function(){
					ui[prop].value = parseFloat($(this).val());
					self.update(prop);
					if ($('#'+prop+'-interface input').val() === "-0"){
						$('#'+prop+'-interface input').val("0");
					}
					// self.update(prop);
				},
				change: function(){
					ui[prop].value = parseFloat($(this).val());
					self.update(prop);
				},
				set: function(){
					ui[prop].value = parseFloat($(this).val());
					self.update(prop);
					self.sendEvent(ui[prop].title, 'slide', window.location.pathname);
				},
				serialization: {
					to: (ui[prop].input !== 'hidden' || ui[prop].input !== 'readonly') ? [$('#'+prop+'-interface input')] : [false, false],
					resolution: ui[prop].resolution
				}
			});


			//Keyboard increment
			$('#'+prop+'-interface input').keydown(function(e){

				var value = parseInt($(propContainerSelector).val());
				var increment = self.shiftDown ? 10 : 1;

				switch (e.which){
					case 38:
						$('#'+prop+'-interface input').val( value + increment );
						ui[prop].value = parseFloat($(this).val());
					    self.sendEvent(ui[prop].title, 'increment: +'+increment, window.location.pathname);
						break;
				    case 40:
					    $('#'+prop+'-interface input').val( value - increment );
					    ui[prop].value = parseFloat($(this).val());				    
					    self.sendEvent(ui[prop].title, 'decrement: -'+increment, window.location.pathname);
					    break;
				}

				self.update(prop);

			});

			//set color
			if (ui[prop].color){
				$('#'+prop+'-interface .noUi-connect').css("background-color", ui[prop].color);
			}

		} else if (ui[prop].value === true || ui[prop].value === false) {

		    $('#'+prop+'-interface label').attr("for", prop+'-checkbox');

		    initialCheckboxSetting = ui[prop].value === true ? "checked" : "";

		    $(propContainerSelector).append("<div class='checkbox'><input type='checkbox' value='None' id='"+prop+"-checkbox' name='check' "+initialCheckboxSetting+" /><label for='"+prop+"-checkbox'></label></div>");

		    $('#'+prop+'-interface input').change(function(){
		    	if ($(this).prop('checked')){
		    		ui[prop].value = true;
		    		eventLabel = 'checkbox: switch on'
			    } else {
			    	ui[prop].value = false;
			    	eventLabel = 'checkbox: switch on'
			    }
		        self.sendEvent(ui[prop].title, eventLabel, window.location.pathname);
			    self.update(prop);
			});
		} else if ($.isArray(ui[prop].values)){
			//Dropdown Menus
			$(propContainerSelector).append("<select class='form-control'></select");

			for (var i  = 0 ; i < ui[prop].values.length ; i++){
				$('#'+prop+'-interface select').append("<option value='"+ui[prop].values[i][1]+"'>"+ui[prop].values[i][0]+"</option>");
		    }

			$('#'+prop+'-interface select option[value="'+ui[prop].value+'"]').prop('selected', true);

		    $('#'+prop+'-interface select').change(function(){
		    	ui[prop].value = $(this).val();
		    	self.sendEvent(ui[prop].title, 'Dropdown change: ' + ui[prop].value, window.location.pathname);
		    	$('#'+prop+'-interface select option')
			    	.prop('selected', false)
			    	.filter('[value="'+ui[prop].value+'"]').prop('selected', true);
		    	self.update(prop);
		    })

		} else if (ui[prop].type == "button"){
			$(propContainerSelector).append("<button>"+ui[prop].title+"</button>").click(function(){
				self.update(prop);
			});
		} else {
			$(propContainerSelector).append("<input value='"+ui[prop].value+"' readonly>");
		}
	}

	for (var prop in this.ui){
		this.addUIElement(prop);
	}

	//sends data about clicking links in #ui-container. Such as in nuclear crater map
	$("body").on('click', '#ui-container a', function(e){
		self.sendEvent($(this).html(), 'click', window.location.pathname);
	});


	$(document).on("keydown", function(e){
		self.setShiftDown(e);
	});

	$(document).on("keyup", function(e){
		self.setShiftUp(e);
	});

	this.sendEvent = function(category, action, label, value){
		if (window.location.host == 'academo.org'){
			ga('send', 'event', category, action, label, value);
		}
	}


	this.init();
}

var demo = new Demo({
	ui: {
		addOne: {
			title: "Add a Point!",
			type: "button"
		},
		animate: {
			title: "Animate",
			value: false,
		},
		speed: {
			title: "Speed",
			value: 1,
			range: [5, 100],
			resolution: 1,
			input: "hidden",
		},
		reset: {
			title: "Reset",
			type: "button"
		},
	},
	animateID: null,
	totalPoints: 0,
	innerPoints: 0,
	radius: 250,
	init: function(){
		$('<canvas>').attr({
			id: "my-canvas",
		    height: "500px",
		    width: "500px",
		}).css({
			width: "100%",
			"max-width": "500px",
			"max-height": "500px",
			"height": "100%",
			"margin": "0 auto",
			"display": "block",
			"border": "solid 1px #CCC"
		}).appendTo('#demo');
		this.scale = d3.scale.linear()
                    .domain([-1, 1])
                    .range([0, 500]);
        this.canvas = document.getElementById("my-canvas");
		this.context = this.canvas.getContext("2d");
		this.initCanvas();
		$("#ui-container").append("<div class='interface' id='js-points-data'></div>");
		$("#js-points-data").append("Total Number of points: <span class='js-total-points'>0</span><br />");
		$("#js-points-data").append("Points within circle: <span class='js-inner-points'>0</span><br />");
		$("#js-points-data").append("Pi estimation: <span class='js-pi-estimation'></span><br />");
	},
	initCanvas: function(){
		this.context.clearRect(0,0,500,500);
		this.context.strokeStyle = "#999";
		this.context.beginPath();
		this.context.arc(this.scale(0), this.scale(0), this.radius, 0, 2 * Math.PI);
		this.context.stroke();
	},
	animate: function(){
		this.animateID = window.requestAnimationFrame(this.animate.bind(this));
		this.update();
	},
	reset: function(){
		this.totalPoints = 0;
		this.innerPoints = 0;
		this.updateDisplay();
	},
	updateDisplay: function(){
		$(".js-inner-points").html(this.innerPoints);
		$(".js-total-points").html(this.totalPoints);
		var piEstimate = (4 * this.innerPoints / this.totalPoints).toFixed(5);
		if (this.totalPoints == 0){
			piEstimate = "";
		}
		$(".js-pi-estimation").html(piEstimate);
	},
	update: function(e){
		if (e == "speed"){
		} else if (e == "animate" && this.ui.animate.value == true) {
			this.animate();
		} else if (e == "animate" && this.ui.animate.value == false) {
			window.cancelAnimationFrame(this.animateID);
		} else if (e == "reset") {
			this.initCanvas();
			this.reset();
		} else {
			if (e == "addOne"){
				var numberToAdd = 1;
			} else {
				var numberToAdd = this.ui.speed.value;
			}
			for (var i = 0 ; i < numberToAdd ; i++){
				var randomX = Math.random() * 2 - 1;
				var randomY = Math.random() * 2 - 1;
				this.context.beginPath();
				if (Math.pow(this.scale(randomX) - this.scale(0), 2) + Math.pow(this.scale(randomY) - this.scale(0), 2) > Math.pow(this.radius, 2)){
					this.context.fillStyle = "black";
				} else {
					this.context.fillStyle = "orange";
					this.innerPoints++;
				}
				this.context.fillRect(this.scale(randomX),this.scale(randomY),1,1);
				this.totalPoints++;
				this.updateDisplay();
			}
		}
	}
});