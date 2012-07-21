$(document).ready(function() {
	$(function () {

		var AppState = Backbone.Model.extend({
	        defaults: {
	            state: "search"
	        }
    	});

    	var appState = new AppState();


    	var Controller = Backbone.Router.extend({
	        routes: {
	            "": "search", // default page
	            "!/search": "search", // First page
	            "!/templates": "templates", // templates view
	            "!/orders": "orders", // orders view
	            "!/history": "history" // Page with link on email
	        },

	        search: function () {
	            appState.set({ state: "search" });
	        },

	        templates: function () {
	            appState.set({ state: "templates" });
	        },

	        orders: function () {
	            appState.set({ state: "orders" });
	        },

	        history: function () {
	            appState.set({ state: "history" });
	        }
    	});

    	var controller = new Controller(); // create controller

    	var Block = Backbone.View.extend({
	        el: $("#main_block"), // DOM elememt of our widget

	        templates: { // template on dif states
	            "search": _.template($('#search_block').html()),
	            "templates": _.template($('#template_block').html()),
	            "orders": _.template($('#order_block').html()),
	            "history": _.template($('#history_block').html())
	        },

	        events: {
	            //"click #do_registration": "registration", // handler on click button to registrate 
	            //"click #do_login": "login",               // handler on click button to login
            }, 


	        initialize: function () { // Subscribe to the model events
	            this.model.bind('change', this.render, this);
	        },

	        render: function () {
	            var state = this.model.get("state");
	            $(this.el).html(this.templates[state](this.model.toJSON()));
	            return this;
        	}
    	});

    	var block = new Block({ model: appState }); // create container for our templates

    	appState.trigger("change"); // Call event 'change' in our model

    	appState.bind("change:state", function () { // event on change state in controller
	        var state = this.get("state");
	        $('#search_panel').find('li.tab').removeClass("active"); // drop styles in tabs
	        $('#'+state).addClass("active");    // use "active" in current tab

	        if (state == "search")
	            controller.navigate("!/", false); // false because we don't need to call state event
	                                              // in controller
	        else
	            controller.navigate("!/" + state, true);

    	});

    	Backbone.history.start();  // Start HTML5 History push  

	});   
});