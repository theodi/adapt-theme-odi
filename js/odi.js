var theme="ODI";
define(function(require) {
	
	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	var ThemeBlock = require('theme/adapt-theme-odi/js/theme-block');
	var emailPresent = false;

	// Block View
	// ==========

	Adapt.on('blockView:postRender', function(view) {
		var theme = view.model.get('_theme');
		
		if (theme) {
			new ThemeBlock({
				model: new Backbone.Model({
					_themeBlockConfig: theme
				}),
				el: view.$el
			});
		}
	});

	Adapt.on('pageView:ready', function(view) {
		$('.intro-logo .graphic-widget img').attr('src','adapt/css/assets/intro-logo.png');
		$('.intro-logo .graphic-widget img').attr('data-large','adapt/css/assets/intro-logo.png');
		$('.intro-logo .graphic-widget img').attr('data-small','adapt/css/assets/intro-logo.png');
		try {
            email = Adapt.course.get('_globals')._extensions._aboutPage.contactEMail;
            text = Adapt.course.get('_globals')._extensions._aboutPage.contactLinkText;
			if (!email) { email = Adapt.course.get('_globals')._theme._ukraine.contactEMail; }
			if (!text) { text = Adapt.course.get('_globals')._theme._ukraine.contactLinkText; }
			if( $('.about-links').size() > 0) {
            	$('.about-links').append(' | ');
        	} 
        	$('.about-links').append('<a class="contact" href="mailto:'+email+'">'+text+'</a>');
		} catch (err) {}
	});

	Adapt.on('userDetails:updated', function(user) {
		emailSave(user);
		emailPresent = true;
	});

	Adapt.on('trackingHub:saving', function() {
		if (!emailPresent) { return; }
		$('#save-section').addClass('saving');
		var sl = document.getElementById('save-section');
		var toClass = "cloud_saving";
		$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
	});

	Adapt.on('trackingHub:success', function() {
		if (!emailPresent) { return; }
		$('#save-section').addClass('success');
		var sl = document.getElementById('save-section');
		var toClass = "cloud_success";
		$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
	});
	
	Adapt.on('trackingHub:failed', function() {
		if (!emailPresent) { return; }
		$('#save-section').addClass('failed');
		var sl = document.getElementById('save-section');
		var toClass = "cloud_failed";
		$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
	});

	Adapt.on('trackingHub:getUserDetails', function(user) {
		checkState(user);
	});


	// Custom bits
	// ============
	var click_bind = false;

	function showMessage(phraseId) {
		var saveTitle = Adapt.course.get('_trackingHub').saveTitle;
		var saveBody = Adapt.course.get('_trackingHub').saveBody;
		var items = Adapt.course.get('_trackingHub').fields;

		var fields = "<div align='center'>";
		_.each(items, function(item) {
			var required = "";
			if(item.required) {
				required = "required";
			}
			fields += item.title + ": <input id='"+item.id+"' type='" + item.type + "' class='email-input' placeholder='" + item.placeholder + "' " + required + "></input><br/>";
		});
		fields += "<br/><br/><input type='submit' id='email_submit' value='OK' style='padding: 10px;' class='notify-popup-done course_link' role='button' aria-label='submit email' onClick='getUser();'></input></div>";

		saveBody = saveBody + fields;

		var alertObject = {
            		title: saveTitle,
		        body: saveBody
	        };
	
        
        Adapt.once("notify:closed", function() {
            Adapt.trigger("tutor:closed");
        });

        Adapt.trigger('notify:popup', alertObject);

        Adapt.trigger('tutor:opened');
	}

	function addListeners() {
		if (!click_bind) {
			$('.save-section-outer').click(function() {
				$('#cloud-status').slideToggle();
			});
			click_bind = true;
		}
		$('#saveSession').click(function() {
			showMessage();
		});
	}

	function emailSave() {
		$('#save-section').fadeOut( function() {
    		var sl = document.getElementById('save-section');
			var ss = document.getElementById('cloud-status-text');
			$(sl).html("");
			$(sl).addClass('saving');
			var toClass = "cloud_saving";
			$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
			$(sl).fadeIn();
		});
	}


	function checkWelcome(user) {
		if (!user.email && !localStorage.getItem("ODI_Welcome_Done")) {
			showMessage('enter_email');
			localStorage.setItem("ODI_Welcome_Done",true);
		}
	}

	function checkState(user) {
		if (user) { 
			var sessionEmail = user.email || false; 
			var lastSave = user.lastSave;	
		}
		if (!sessionEmail) {
			emailPresent = false;
			checkWelcome(user);
			$('#save-section').html("<button class='slbutton' id='saveSession'>Save progress</button>");
			$('#save-section').fadeIn();
			click_bind = false;
			$('.save-section-outer').unbind('click');
			addListeners();
		} else {
			emailPresent = true;
			$('#save-section').fadeIn();
			addListeners();
		}
	}

});


function validateInput(user) {
	valid = true;
	var Adapt = require('coreJS/adapt');
	var items = Adapt.course.get('_trackingHub').fields;
	_.each(items, function(item) {
		if (item.required && !user[item.id]) {
			valid = false;
		}
		if (item.type == "email" && !validateEmail(user[item.id])) {
			valid = false;
		}
	});
	return valid;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getUser() {
	var Adapt = require('coreJS/adapt');
	user = {};
	var items = Adapt.course.get('_trackingHub').fields;

	_.each(items, function(item) {
		user[item.id] = $("input[id='" + item.id + "']").val();
	});

	if (validateInput(user)) {
		Adapt.trigger('userDetails:updated',user);
	}
}
