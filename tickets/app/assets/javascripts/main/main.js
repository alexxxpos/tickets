$(document).ready(function() {
	$(function () {
		//Block models
    

    var Station= Backbone.Model.extend({ 
        defaults: {
            "title": "",
            "station_id": 0
        }
    });
    
    var Stations= Backbone.Collection.extend({
        model: Station
    });
    
    var Date = Backbone.Model.extend({ 
        defaults: {
            "date": "" 
        }
    });
    
    var Dates = Backbone.Collection.extend({
        model: Date
    });
    
    var Trip= Backbone.Model.extend({
        defaults: {
            "stationsFrom": Stations,
            "stationsTo": Stations,
            "dates": Dates
        },
        constructFrom:function (obj){
               var stationsFrom = new Stations(obj.stationsFrom);
               var stationsTo = new Stations(obj.stationsTo);
               var dates = new Dates(obj.dates);
               this.set({
                   "stationsFrom": stationsFrom,
                   "stationsTo": stationsTo,
                   "dates": dates
                                  
               });
               
               
               
               
       
        },
        combinated: function(){
            var simplesTrip=new SimplesTrip();
            this.get("dates").each(function(date){
                this.get("stationsFrom").each(function(stationFrom){
                    this.get("stationsTo").each(function(stationTo){
                        
                        simplesTrip.add({date:date, stationFrom:stationFrom, stationTo:stationTo});
                    },this)
                    
                },this)
                
                
            },this);
            return simplesTrip;
            
        }

    });
    
    var Travel= Backbone.Collection.extend({
       model: Trip,
       constructFrom:function (obj){
           _.each(obj, function (one){
               var trip=new Trip();
               trip.constructFrom(one);
               this.add(trip);
               
               
           },this );
       }
       
    });
    
    var History= Backbone.Collection.extend({
       collection: Travel 
    });
    //End block models
    //Block model search
    var Coach = Backbone.Model.extend({
        defaults:{
            "num":9,
            "service":true,
            "places_cnt":4,
            "places":[],
            "price":13638,
            "reserve_price":1700,
            "station_id_from":"2210700",
            "station_id_till":"2210770",
            "train":"226\u0428",
            "date_start":"2012-07-21",
            "coach_type_id":"3"
        }
        
    });
    var Coaches=Backbone.Collection.extend({
        model: Coach,
        initialize: function () { 
            this.on('add', this.buildOne, this);
        },
        buildOne: function(one){
            //var tasksIN=tasks;
            tasks.newTask();
            $.ajax({
                    url: "main/search?type=coach/",
                    type: "post",
                    data:{
                        "station_id_from": one.get("station_id_from"),
                        "station_id_till": one.get("station_id_till"),
                        "train": one.get("train"),
                        "coach_num": one.get("num"),
                        "coach_type_id": one.get("coach_type_id"),
                        "date_start": one.get("date_start")
           	  
                    },

                    success: function( data ) {
                            one.set({ "places" : data.value});
                            tasks.newDone();
                            
                    },
                    error: function(){
                        tasks.newDone();
                    }
                        
            });
        }
    });
    
    var Type = Backbone.Model.extend({
        defaults:{
            coaches: Coaches
            
            
                
        }
        
       
    }) ;
    
    var Types=Backbone.Collection.extend({
        model: Type
    });
    
    var Train = Backbone.Model.extend({
        defaults:{
            "num":"226\u0428",
            "model":0,
            "from":
            {
                    "station_id":"2210700",
                    "station":"\u0414\u041d\u0415\u041f\u0420\u041e\u041f\u0415\u0422\u0420\u041e\u0412\u0421\u041a \u0413\u041b\u0410\u0412\u041d\u042b\u0419",
                    "date":1342895880
            },
            "till":
            {
                    "station_id":"2210770",
                    "station":"\u0415\u0412\u041f\u0410\u0422\u041e\u0420\u0418\u042f-\u041a\u0423\u0420\u041e\u0420\u0422",
                    "date":1342925100
            },
            "dateForSearch":"",
            "typesForSearch": {},
            "station_id_from": 2210700,
            "station_id_till": 2210770,
            "types": null

        }
        
        
        
        
    });
    var Trains=Backbone.Collection.extend({
        model: Train,
        initialize: function () { 
            this.on('add', this.buildOne, this);
        },
        buildOne: function (one){
            var types=new Types();
            one.set("types", types);
            _.each(one.get("typesForSearch"),function(eachType){
                //var tasksIN=tasks;
                tasks.newTask();
                $.ajax({
                    url: "main/search?type=coaches/",
                    type: "post",
                    data:{                    
                        "station_id_from":	one.get("station_id_from"),
                        "station_id_till":	one.get("station_id_till"),
                        "train":	one.get("num"),
                        "coach_type_id": eachType.type_id,
                        "date_start": one.get("dateForSearch"),
                        "round_trip":0	  
                    },



                    success: function( data ) {
                        tasks.newDone();
                        var type=new Type();
                        var coaches=new Coaches();
                        
                        _.each(data.value.coaches,function(eachCoach){
                            
                            var coach=new Coach();
                            coach.set({
                                "num": eachCoach.num,
                                "service":eachCoach.service,
                                "places_cnt":eachCoach.places_cnt,
                                "places":[],
                                "price": eachCoach.price,
                                "reserve_price":eachCoach.reserve_price,
                                "station_id_from":eachCoach.station_id_from,
                                "station_id_till":eachCoach.station_id_till,
                                "train":eachCoach.train,
                                "date_start":eachCoach.date_start,
                                "coach_type_id":eachCoach.coach_type_id


                            });
                            coaches.add(coach);
                            
                        },this)
                        type.set({"coaches":coaches});
                        one.get("types").add(type);
                    },
                    error: function(){
                        tasks.newDone();
                    }
                });
            },this);
                
        }
        
        
    });
    
    var SimpleTrip=Backbone.Model.extend({
        defaults:{
          "stationFrom": Station,
          "stationTo": Station,
          "date": Date,
          "trains": Trains
             
        }
        
        
    });
    
    var SimplesTrip=Backbone.Collection.extend({
       model: SimpleTrip,
       initialize: function () { 
            this.on('add', this.buildOne, this);
            
        },
        buildOne: function (one){
            var trains=new Trains();
            one.set("trains", trains);
            //var tasksIN=tasks;
            tasks.newTask();
            $.ajax({
                url: "main/search?type=search/",
                type: "post",
                data:{                    
                    "station_id_from": one.get("stationFrom").get("station_id"),
                    "station_id_till": one.get("stationTo").get("station_id"),
                    "station_from": one.get("stationFrom").get("title"),
                    "station_till": one.get("stationTo").get("title"),
                    "date_start": one.get("date").get("date"),
                    "time_from": "00:00",
                    "search" : ""	  
                },



                success: function( data ) {
                    tasks.newDone();
                    _.each(data.value,function(eachTrain){
                        var train=new Train();
                        train.set({
                            "station_id_from": one.get("stationFrom").get("station_id"),
                            "station_id_till": one.get("stationTo").get("station_id"),
                            "num": eachTrain.num,
                            "model":eachTrain.model,
                            "from": eachTrain.from,
                            "till": eachTrain.till,
                            "dateForSearch": eachTrain.from.date,
                            "typesForSearch": eachTrain.types
            
                            
                        });
                        one.get("trains").add(train);
                        
                        
                    },this)
                },
                error: function(){
                        tasks.newDone();
                    }
            });
                
        }
            
        
       
    });
    
    var TripResult=Backbone.Model.extend({
        defaults: {
            "trip": "Trip",
            "simplesTrip": "SimplesTrip"

        }

    });
    
    var TravelResult= Backbone.Collection.extend({
        model: TripResult,
        initialize: function () { 
            this.on('add', this.buildOne, this);
            
        },
        build: function (travel) {
              travel.each(function(one){
                
                this.add({trip:one})
            },this);
        },
        buildOne: function (one) {
            var simplesTrip= one.get("trip").combinated();
            one.set("simplesTrip", simplesTrip);
            
            
            
        }
        
    }); 
  
    //End block model search
    //Block AppViews
    var AppView=Backbone.View.extend({
        initialize: function (options) {
            //var testString='[{"stationsFrom":[{"title":"Днепропетровск Главный","station_id":2210700}],"stationsTo":[{"title":"Евпатория-Курорт","station_id":2210770},{"title":"Симферополь","station_id":2210001}],"dates":[{"date":"24.08.2012"},{"date":"25.08.2012"},{"date":"26.08.2012"}]},{"stationsFrom":[{"title":"Евпатория-Курорт","station_id":2210770},{"title":"Симферополь","station_id":2210001}],"stationsTo":[{"title":"Днепропетровск Главный","station_id":2210700}],"dates":[{"date":"29.08.2012"},{"date":"30.08.2012"},{"date":"31.08.2012"}]}]';
            this.travel= new Travel();
            this.travelResult;
            this.render();
            var travelView = new TravelView({ collection: this.travel, el :$(this.el).children($(".TravelView")) });
            
            
            //this.travel.constructFrom(JSON.parse(testString));
            
        },
        events: {
           
            "click .search" : "search",
            "click .console" : "consoleShow"
        },
        
        template: _.template($('#AppView').html()),
        search: function(){
            tasks= new Tasks();
            var tasksView= new TasksView({model:tasks, el :$(this.el).find($(".Result"))});

            this.travelResult=new TravelResult();
            this.travelResult.build(this.travel);

            
        },
        consoleShow: function(){
            
            console.log(JSON.stringify(this.travel));
            console.log(this.travel);
            console.log(JSON.stringify(this.travelResult));
            
        },
        render: function(){
            $(this.el).html(this.template());
            $(this.el).children("button").button();
            
        }
        
            
        
    });
    //End block AppViews
    // Block views
    var InputView = Backbone.View.extend({
        tagName: "span",
        events: {        
            "click .del" : "deleteOne"
        },
        initialize: function (options) { 
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
 
            this.model.trigger("change");
        },
        deleteOne: function() {
            this.model.destroy();
            return false;
        },
        remove: function() {
            $(this.el).fadeOut('slow', function() {$(this).remove()});
	}      
    });
    
    var DateView = InputView.extend({
        template: _.template($('#DateView').html()),
        render: function () {
            var modelIN=this.model;
            $(this.el).html(this.template(this.model.toJSON()));
            $(this.el).children("input").datepicker( {
                dateFormat: "dd.mm.yy",
                firstDay:1,
                onSelect: function(dateText, inst) {
                    modelIN.set( {"date": dateText}) 
                }
            });
            $(this.el).children("button").button();    
            return this;  
        }
           
    });
    
    var StationView = InputView.extend({
        template: _.template($('#StationView').html()),
        render: function () {
            var modelIN=this.model;
            $(this.el).html(this.template(this.model.toJSON()));
            $(this.el).children("input").autocomplete({
                        source: function( request, response ) {
                                $.ajax({
                                        url: "main/search?type=station/"+request.term+"/",
                                        type: "post",
                                        
                                            
                                        
                                        success: function( data ) {
                                                response( $.map( data.value, function( item ) {
                                                        return {
                                                                label: item.title,
                                                                value: item.title,
                                                                station_id: item.station_id
                                                        }
                                                }));
                                        }
                                });
                        },
                        minLength: 3,
                        select: function( event, ui ) {
                            modelIN.set( {"title": ui.item.label, "station_id" : ui.item.station_id});
                        }
            });
            $(this.el).children("button").button();
            return this;
        }
    });
    
    
    var EnumsView = Backbone.View.extend({

        events: {
            "click .add" : "createOne"
        },
        initialize: function() {
            

            this.collection.on('add', this.addOne, this);

        },   
        render: function() {
            $(this.el).html(this.template());
            $(this.el).children("button").button();
            this.collection.each(this.addOne, this)
            return this;
        },
        createOne: function() {
            this.collection.add();
        }


    });
    

    var StationsView = EnumsView.extend({
        template: _.template($('#StationsView').html()),
        addOne: function(one) {
            var oneView = new StationView({model: one});
            $(this.el).children("span").append(oneView.render().el);
        }
        
        
    });
    
    var DatesView = EnumsView.extend({
        template: _.template($('#DatesView').html()),
        addOne: function(one) {
            var oneView = new DateView({model: one});
            $(this.el).children("span").append(oneView.render().el);
        }

    });

    var TripView= Backbone.View.extend({
        tagName: "div",
        className: "Trip",
        template: _.template($('#TripView').html()),
        initialize: function(){
            this.model.on('destroy', this.remove, this);
            this.model.on('change', this.render, this);
            this.model.trigger("change");
            //this.render();

        },
        events: {        
            "click .del" : "deleteOne"
        },

        render: function(one){
            $(this.el).html(this.template());
            var stationsFromView = new StationsView({ collection: this.model.get("stationsFrom")});
            var stationsToView = new StationsView({ collection: this.model.get("stationsTo")});   
            var datesView = new DatesView({ collection: this.model.get("dates")});
            
            $(this.el).children(".stationsFromView").append(stationsFromView.render().el);
            $(this.el).children(".stationsToView").append(stationsToView.render().el);
            $(this.el).children(".datesView").append(datesView.render().el);
            $(this.el).children("button").button();
            return this;
        
        
        
        },
        deleteOne: function() {
            this.model.destroy();
            return false;
        },
        remove: function() {
            $(this.el).fadeOut('slow', function() {$(this).remove()});
	}  
        
        
    });
    
    var TravelView = EnumsView.extend({
        template: _.template($('#TravelView').html()),
        events: {
            "click .addTrip" : "createOne"
        },
        initialize: function() {

            this.collection.on('add', this.addOne, this);
            $(this.el).html(this.template());
            $(this.el).children("button").button();
            

        },
        createOne: function() {
            var newStationsFrom = new Stations();
            var newStationsTo = new Stations();
            var newDates = new Dates();
            
            this.collection.add({stationsFrom:newStationsFrom,stationsTo:newStationsTo,dates:newDates});
        },
        addOne: function(one){
            var oneView = new TripView({model: one});
            $(this.el).children("div").append(oneView.render().el);
        }
        

            
        
        
        
        
        
        
    });
    
    
   
  //End block views
    var Tasks = Backbone.Model.extend({
        defaults:{
            allTasks:0,
            doneTasks:0
        },
        newTask: function(){
            this.set({"allTasks" : this.get("allTasks")+1});
         
        },
        newDone:function(){
            this.set({"doneTasks" : this.get("doneTasks")+1});
        },
        percent: function(){
            var percent=0;
            if (this.get("allTasks")!=0){
                percent= (this.get("doneTasks")/this.get("allTasks"))*100;
            }
            return percent;
            
        }
    })
    
    var TasksView = Backbone.View.extend({
        template: _.template($('#Progress').html()),
        initialize: function() {
            $(this.el).html(this.template());
            this.progress=$(this.el).find(".progressBar").progressbar({
			value: 0
		});

            this.model.on('change', this.render, this);
        

        },
        render: function(){
            var percent=this.model.percent();
            if (percent>this.progress.progressbar( "option", "value" )){
               this.progress.progressbar( "option", "value", percent );
            }
        }
        
    })
  
  
  

  


		//end index/js

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

    	var tasks;
  //Init application
  //var travel= new Travel();
  //var travelView = new TravelView({ collection: travel, el :$("#app") });
  var appView=new AppView({el :$("#app")});
  //End init application
  //  var trip= new Trip();
  //  var tripView = new TripView({ model: trip, el :$("#app") });

	});   
});