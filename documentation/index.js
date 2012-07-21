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
            stationsFrom: null,
            stationsTo: null,
            dates: null
        }

    });
    
    var Travel= Backbone.Collection.extend({
       model: Trip  
    });
    
    var History= Backbone.Collection.extend({
       collection: Travel 
    });
    //End block models
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
                                        url: "mock.php?type=station/"+request.term+"/",
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
            "click .addTrip" : "createOne",
            "click .search" : "search"
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
        },
        search: function(){
            console.log(travel);
            $("#result").html(JSON.stringify(travel));
            
        }
        
        
        
        
        
    });

   
  //End block views
  
  //Init application
  var travel= new Travel();
  var travelView = new TravelView({ collection: travel, el :$("#app") });
  //End init application
  //  var trip= new Trip();
  //  var tripView = new TripView({ model: trip, el :$("#app") });
  



});