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
		console.log("In show message");
		
		var alertObject = {
            title: "Save your progress, earn rewards...",
            body: "<p>Please enter your <b>email</b> address in the box below. You will receive an email linking to your unique profile so you can save your progress, earn rewards and resume your learning on any device.</p><br/><div align='center'><input type='email' id='email' class='email-input' placeholder='Email address' required></input><br/><br/><input type='submit' id='email_submit' value='OK' style='padding: 10px;' class='notify-popup-done course_link' role='button' aria-label='submit email' onClick='getEmail();'></input></div>"
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

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getEmail() {
	var Adapt = require('coreJS/adapt');
	email = $("input[id='email']").val();
	if (validateEmail(email)) {
		user = {};
		user.email = email;
		Adapt.trigger('userDetails:updated',user);
	}
}
function callTrigger(type) {
	var Adapt = require('coreJS/adapt');
	console.log(type);
	if (type == "skillsFramework:showSkills") {
		Adapt.trigger('skillsFramework:showSkills');
	}
	if (type == "aboutPage:showAboutPage") {
		Adapt.trigger('aboutPage:showAboutPage');
	}
	if (type == "credits:showCredits") {
		Adapt.trigger('credits:showCredits');
	}
}