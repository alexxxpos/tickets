//$(document).ready(function() {
	$(function () {
var arrType=new Array();
    arrType[1]="Л";
    arrType[3]="К";
    arrType[4]="П";
    arrType[14]="С2";

      

     
    _.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
    
    var Facade = Backbone.Model.extend({
        path: "main/search?type=",
        defaults:{
            allTasks:0,
            doneTasks:0
        },
        newTask: function(){
            this.set({"allTasks" : this.get("allTasks")+1});
         
        },
        doneTask:function(){
            this.set({"doneTasks" : this.get("doneTasks")+1});
        },
        percent: function(){
            var percent=0;
            if (this.get("allTasks")!=0){
                percent= (this.get("doneTasks")/this.get("allTasks"))*100;
            }
            
            return percent;
            
        },
        zero: function(){
          this.set({allTasks:0,doneTasks:0});  
        },
        ask: function(type, data, sender, receiver){
            this.newTask();
            var senderIN=sender;
            var receiverIN=receiver;
            var tasksIN=this;
            $.ajax({
                url: this.path+type+"/",
                type: "post",
                 beforeSend: function ( xhr ) {
                    xhr.setRequestHeader("X-CSRF-Token", $('meta[name=csrf-token]').attr('content'));
                },
                data: data,


                success: function( data ) {
                    if (typeof(data.value)!="string"){
                        senderIN.answerFacade(data, receiverIN);
                    }
                    tasksIN.doneTask();   
                },
                error:function(){
                    tasksIN.doneTask();

                }
            });
        }
    });
    
  
    
    
    
    
    
    
    //Start TravelResultView
    
    var TravelResultView= Backbone.View.extend({
        template: _.template($('#TravelResultView').html()),
        initialize: function(){
            arrayTasks=new Array();
            this.render();
            //this.renderNext();
           
           
        },
        render: function() {
            $(this.el).html(this.template());
            travelResult.get("tableTrips").each(this.addOne, this)
            return this;
        },
        createOne: function() {
            this.collection.add();
        },
        addOne: function(one) {
            var oneView = new SimpleTripsResultView({
                model: one,
                collection: travelResult.get("tableSimpleTrips")
            });
            $(this.el).children("div").append(oneView.render().el);
        },
        renderNext: function(){
            _.each(arrayTasks,function(one){
                one.next();

            });
        }


    });
    
    var SimpleTripsResultView = Backbone.View.extend({
        template: _.template($('#SimpleTripsResultView').html()),
        render: function() {
            $(this.el).html(this.template());
            _.each( this.collection.where({tidTrip: this.model.get("tid")}), this.addOne,this);
            return this;
        },
        addOne: function(one) {
            
            var oneView = new SimpleTripResultView({
                model: one,
                collection: travelResult.get("tableTrains")
                    
            });
            $(this.el).children("div").append(oneView.render().el);

        }
    });
    
    var SimpleTripResultView= Backbone.View.extend({
        template: _.template($('#SimpleTripResultView').html()),
        events:{
            "click .toggle" : "toggle"
        },
         initialize: function () {
            this.stateNext=true; 
            this.on('next', this.next, this);
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            $(this.el).find("button").button();
            $(this.el).find(".accordion").hide();
            
            return this;
        },
        next: function(){
            _.each(this.collection.where({tidSimpleTrip: this.model.get("tid")}),this.addOne,this);
            $(this.el).find(".accordion").accordion({
                collapsible: true,
                autoHeight: false,
                active: false
            });
            

        },
        addOne: function(one) {
            if ( one.get("goodPlaces")>0 ) {
                var oneView = new TrainResultView({
                    model: one,
                    collection: travelResult.get("tableCoaches")
                    
                });
                $(this.el).find(".accordion").append(oneView.header());
                $(this.el).find(".accordion").append(oneView.render().el);
            }
        },
        toggle:function(){
            if (this.model.get("goodPlaces")>0 && this.stateNext){
                this.stateNext=false;
                this.next();
            }

            $(this.el).find(".accordion").toggle();
        }
        
        
    });
    
    var TrainResultView= Backbone.View.extend({
        template: _.template($('#TrainHeader').html()),
        render: function() {
            $(this.el).append($("<ul>"));
            $(this.el).tabs({
                tabTemplate: "<li><a href='#{href}'>#{label}</a></li>",
                collapsible: true

            });
            _.each(this.collection.where({tidTrain: this.model.get("tid")}),this.addOne,this);
            $(this.el).tabs( "option", "selected", -1 );
            return this;
        },
        addOne: function(one) {
            if ( one.get("goodPlaces")>0 ) {
                switch(one.get("coach_type_id")){
                    case "1":
                        var oneView = new LResultView({
                            model: one,
                            collection: travelResult.get("tablePlaces")
                        });


                    break;
                    case "3":
                        var oneView = new KResultView({
                            model: one,
                            collection: travelResult.get("tablePlaces")
                        });


                    break;
                    case "4":
                        var oneView = new PResultView({
                            model: one,
                            collection: travelResult.get("tablePlaces")
                        });

                    break;
                    default:
                        var oneView = new CoachResultView({
                        model: one,
                        collection: travelResult.get("tablePlaces")
                    });


                }

                $(this.el).tabs( 
                    "add", 
                    "#tab-" + one.get("tid"), 
                    "Вагон "+one.get("num")+arrType[one.get("coach_type_id")]+" "+one.get("goodPlaces")+"мест" 
                );
                
                $(this.el).find("#tab-"+one.get("tid")).append(oneView.render().el);
            }
        },
        header: function(){
            var obj=this.model.toJSON();
            obj.date_from=this.model.showTime("from");
            obj.date_till=this.model.showTime("till");

            return $("<h3>").html(this.template(obj));

        }
        
        
    });

    var CoachResultView =Backbone.View.extend({
        render: function(){
            _.each(this.collection.where({tidCoach: this.model.get("tid")}),this.addOne,this);
            return this;
        },
        addOne: function(one){
            $(this.el).append($("<button>").button({
                label: one.get("place") + (one.get("goodPlace")?"*": "")
            }));



        }
    })

    var OneCoachView=Backbone.View.extend({
        render: function(){
            $(this.el).html(this.template());
            _.each(this.collection.where({tidCoach: this.model.get("tid")}),this.addOne,this);
            return this;
        },
        addOne: function(one){
            $(this.el).find("#p"+one.get("place")).html($("<button>").button({
                label: one.get("place") + (one.get("goodPlace")?"*": "")
            }));



        }
    });

    var KResultView =OneCoachView.extend({
        template: _.template($('#KView').html()),
        
    });

    var PResultView =OneCoachView.extend({
        template: _.template($('#PView').html()),
        
    });

    var LResultView =OneCoachView.extend({
        template: _.template($('#LView').html()),
        
    });


    //End TravelResultView  
     
    //Block models
    var Parametrs= Backbone.Model.extend({
       defaults: {
           number:0,
           l:false,
           k:true,
           p:false,
           s1:false,
           s2:false,
           down:false,
           one:false,
           side:false,
           from: "00:00",
           till: "23:59"

           
       },
       getTime:function(type){
            var time;
            time=this.get(type);
            time=time.split(":");
            time=parseInt(time[0])*60+parseInt(time[1]);
            return time;
            

            }

    });
    
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
            "parametrs" : Parametrs,
            "stationsFrom": Stations,
            "stationsTo": Stations,
            "dates": Dates
        },
        constructFrom:function (obj){
               var parametrs = new Parametrs(obj.parametrs);
               var stationsFrom = new Stations(obj.stationsFrom);
               var stationsTo = new Stations(obj.stationsTo);
               var dates = new Dates(obj.dates);
               this.set({
                   "parametrs" : parametrs,
                   "stationsFrom": stationsFrom,
                   "stationsTo": stationsTo,
                   "dates": dates
                                  
               });
               
               
               
               
       
        },
        combinated: function(tid){
            var arr =  new Array();
            this.get("dates").each(function(date){
                this.get("stationsFrom").each(function(stationFrom){
                    this.get("stationsTo").each(function(stationTo){
                        arr[arr.length]={
                            date_start: date.get("date"),
                            station_id_from: stationFrom.get("station_id"),
                            station_from: stationFrom.get("title"),
                            station_id_till: stationTo.get("station_id"),
                            station_till: stationTo.get("title")
                        };
                       
                    },this)
                    
                },this)
                
                
            },this);
            return arr;
            
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

    //End block model search
    //Block AppViews
    var AppView=Backbone.View.extend({
        initialize: function (options) {
            //var testString='[{"parametrs":{"number":"2","l":false,"k":true,"p":false,"s1":false,"s2":false,"down":true,"one":true,"side":false,"from":"15:00","till":"23:59"},"stationsFrom":[{"title":"Днепропетровск Главный","station_id":2210700}],"stationsTo":[{"title":"Евпатория-Курорт","station_id":2210770},{"title":"Симферополь","station_id":2210001}],"dates":[{"date":"24.08.2012"}]},{"parametrs":{"number":"2","l":false,"k":true,"p":false,"s1":false,"s2":false,"down":true,"one":true,"side":false,"from":"15:00","till":"23:59"},"stationsFrom":[{"title":"Евпатория-Курорт","station_id":2210770},{"title":"Симферополь","station_id":2210001}],"stationsTo":[{"title":"Днепропетровск Главный","station_id":2210700}],"dates":[{"date":"31.08.2012"}]}]';
            
            changer.on("change", this.up, this);
            this.render();
            
            travel= new Travel();
            this.travelView = new TravelView({collection: travel, el :$(this.el).children($(".TravelView"))});
            
                // Дикий хай. Начало. Модуль сохранения шаблона
                $('#save_template_button span').click(function(event) {
                    var save_search_dialog = $('#save_search_dialog').html();
                    $('<div id="dialog">'+save_search_dialog+'</div>').appendTo('body');            
                        event.preventDefault();

                                $("#dialog").dialog({ 
                                        title: "Укажите название шаблона",                                  
                                        width: 250,
                                        height: 150,
                                        draggable: true,
                                        position: "center",
                                        buttons: {
                                  "Сохранить": function() {
                                    var title=$("#dialog input").val();
                                    if (title.length!=0){

                                        $.ajax({
                                                type: "POST",
                                                url: 'main/save_template',
                                                beforeSend: function ( xhr ) {
                                                    xhr.setRequestHeader("X-CSRF-Token", $('meta[name=csrf-token]').attr('content'));
                                                },
                                                data:{title:title, json:JSON.stringify(travel)},
                                                success: function(data){
                                                    if(data.success==true){
                                                        $(this).dialog("close");
                                                        $('#dialog').remove();
                                                        controller.navigate("!/history", true);
                                                    }else{
                                                        $(this).dialog("close");
                                                        $('#dialog').remove();
                                                        alert("Возникла ошибка записи шаблона");
                                                    }
                                                    //controller.navigate("!/search", true);
                                                    //alert(data.json);
                                                    //appView=new AppView({el: $("#search_box")});
                                                    //changer.set({type:"from", jsonstring:data.json});
                                                }
                                    
                                        });

                                        $(this).dialog("close");

                                        
                                    }
                                    
                                  },
                                  "Закрыть": function() {
                                    $(this).dialog("close");
                                    $('#dialog').remove();
                                  }
                                }
                                });
                    });  
                //Дикий хай. Конец


            //travel.constructFrom(JSON.parse(testString));
            
        },
        up:function(){
            if (changer.get("type")=="from"){
                var jsonstring=changer.get("jsonstring");
                travel.constructFrom(JSON.parse(jsonstring));
                changer.set({type:"none"});
            }

        },
        events: {
           
            "click .search" : "search",
            "click .research" : "showResult",
        },
        
        template: _.template($('#AppView').html()),
        search: function(){
            facade.zero();
            var tasksView= new TasksView({model:facade, el :$(this.el).find($(".Result"))});

            travelResult=new TravelResult();
            travelResult.downloadPlaces(travel);
            $("#save_template_button").show("slow");
            
        },
        consoleShow: function(){
            
            console.log(JSON.stringify(travel));
            console.log(travel);
            console.log(JSON.stringify(travelResult));

            
        },
        render: function(){
            $(this.el).html(this.template());
            $(this.el).children("button").button();
            
        },
        showResult:function(){
            this.travelView.hide();
            travelResult.falseGoodPlaces();
            travelResult.searchGoodPlaces();
            travelResult.countGoodPlaces();
            var travelResultView = new TravelResultView({model: travelResult, el:$(this.el).find($(".Result"))});
            
        }

        
        
        
            
        
    });
    //End block AppViews
    // Block views
    var ParametrsView = Backbone.View.extend({
        template: _.template($('#ParametrsView').html()),
        events: {
            "change .changing" : "changeParam"
        },
        changeParam:function(e){
            //this.model.set("number", $(this.el).find(".number").val());
            var param=e.currentTarget.id;
            var value=e.currentTarget.value;
            if (e.currentTarget.checked){value=true;}
            if (!e.currentTarget.checked && e.currentTarget.value=="on"){value=false;}
            var obj={};
            obj[param]=value;
            this.model.set(obj);
            
        },
        render: function(){
            $(this.el).html(this.template(this.model.toJSON()));
            $(this.el).find("#from").timepicker({});
            $(this.el).find("#till").timepicker({});
            

            //$(this.el).find("#buttonset").buttonset();

           /* $(this.el).find("#l").button( "option", "label", "Л" );
            $(this.el).find("#k").button( "option", "label", "К" );
            $(this.el).find("#p").button( "option", "label", "П" );
            $(this.el).find("#s1").button( "option", "label", "С1" );
            $(this.el).find("#s2").button( "option", "label", "С2" );

            $(this.el).find("#down").button({ label: "Только нижние" });
            $(this.el).find("#one").button({ label: "В одном купе" });
            $(this.el).find("#side").button({ label: "Не боковые" });
            */           

            $(this.el).find("#number").val(this.model.get("number"));

            $(this.el).find("#l").attr('checked', this.model.get("l"));
            $(this.el).find("#k").attr('checked', this.model.get("k"));
            $(this.el).find("#p").attr('checked', this.model.get("p"));
            $(this.el).find("#s1").attr('checked', this.model.get("s1"));
            $(this.el).find("#s2").attr('checked', this.model.get("s2"));
            $(this.el).find("#down").attr('checked', this.model.get("down"));
            $(this.el).find("#one").attr('checked', this.model.get("one"));
            $(this.el).find("#side").attr('checked', this.model.get("side"));




           $(this.el).find("#from").val(this.model.get("from"));
           
           $(this.el).find("#till").val(this.model.get("till"));
          

            return this;
            
            
        }
        
    });
    
    
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
                            request.answerFacade= function(data, response){
                                response( $.map( data.value, function( item ) {
                                    return {
                                            label: item.title,
                                            value: item.title,
                                            station_id: item.station_id
                                    }
                                }));
                            
                            };
                            facade.ask("station/"+request.term, null, request, response);
                            
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
            this.model.on('toggle', this.toggle, this);
            this.model.trigger("change");
            //this.render();

        },
        events: {        
            "click .del" : "deleteOne"
        },

        render: function(one){
            $(this.el).html(this.template());
            var parametrsView = new ParametrsView ({model: this.model.get("parametrs")});
            var stationsFromView = new StationsView({collection: this.model.get("stationsFrom")});
            var stationsToView = new StationsView({collection: this.model.get("stationsTo")});   
            var datesView = new DatesView({collection: this.model.get("dates")});
            
            $(this.el).children(".parametrsView").append(parametrsView.render().el);
            $(this.el).children(".stationsFromView").append(stationsFromView.render().el);
            $(this.el).children(".stationsToView").append(stationsToView.render().el);
            $(this.el).children(".datesView").append(datesView.render().el);
            $(this.el).children("button").button();
            return this;
        
        
        
        },
        toggle:function(){
            $(this.el).find(".toggleIN").toggle();

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
            "click .toggleTrip": "toggle"
            
        },
        initialize: function() {

            this.collection.on('add', this.addOne, this);
            $(this.el).html(this.template());
            $(this.el).children("button").button();
            

        },
        toggle:function(){
            this.collection.each(function(one){
                one.trigger("toggle");

            },this);
            $(this.el).children(".addTrip" ).toggle();
            var label = $(this.el).children(".toggleTrip" ).button( "option", "label" );
            label=="Свернуть"?label="Развернуть":label="Свернуть";
            $(this.el).find(".toggleTrip").button( "option", "label", label );

        },
        hide:function(){
            var label = $(this.el).children(".toggleTrip" ).button( "option", "label" );
            if(label=="Свернуть"){this.toggle();}

        },

        createOne: function() {
            var newParametrs = new Parametrs();
            var newStationsFrom = new Stations();
            var newStationsTo = new Stations();
            var newDates = new Dates();
            
            this.collection.add({parametrs: newParametrs, stationsFrom:newStationsFrom,stationsTo:newStationsTo,dates:newDates});
        },
        addOne: function(one){
            var oneView = new TripView({model: one});
            $(this.el).children("div").append(oneView.render().el);
        }
        

            
        
        
        
        
        
        
    });
    
    
   
  //End block views
  //Block TasksView
      
    
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
            if (percent==100){
                appView.showResult();
            }
        }
        
    })
  //End block TasksView
  //Block SearchResult
  //Relation Logic
   var TravelResult = Backbone.Model.extend({
       defaults:{
           tableTrips:TableTrips,
           tableSimpleTrips:TableSimpleTrips,
           tableTrains:TableTrains,
           tableTypes:TableTypes,
           tableCoaches:TableCoaches,
           tablePlaces:TablePlaces
       },
       initialize: function(){
           var tableTrips =  new TableTrips();
           var tableSimpleTrips = new TableSimpleTrips();
           var tableTrains = new TableTrains();
           var tableTypes = new TableTypes();
           var tableCoaches = new TableCoaches();
           var tablePlaces = new TablePlaces();
           
           this.set({
               
               "tableTrips": tableTrips,
               "tableSimpleTrips": tableSimpleTrips,
               "tableTrains": tableTrains,
               "tableTypes": tableTypes,
               "tableCoaches": tableCoaches,
               "tablePlaces": tablePlaces
               
           });
           
           
       },
       downloadPlaces:function (){
           travel.each(function(one){
               var row={}
               this.get("tableTrips").addRow(row);
               
               
                
           
           },this);
       },
       getTrainByTid: function (tidTrain){
           return this.get("tableTrains").models[tidTrain];
       },
       countGoodPlaces: function(){
           var arr=this.get("tablePlaces").countGoodPlaces();
           arr=this.get("tableCoaches").countGoodPlaces(arr);
           arr=this.get("tableTrains").countGoodPlaces(arr);
           this.get("tableSimpleTrips").countGoodPlaces(arr);
           
       },
       searchGoodPlaces: function(){
            var goodTrains=this.get("tableTrains").searchGoodPlaces();
            var goodCoaches=this.get("tableCoaches").searchGoodPlaces(goodTrains);
            var goodPlaces=this.get("tablePlaces").searchGoodPlaces(goodCoaches);

       },
       falseGoodPlaces:function(){
            this.get("tablePlaces").each(function(one){
                one.set({goodPlace:false});

            },this);
       }
       
       
   });
   var RowTrip = Backbone.Model.extend({
       defaults:{
           "tid":0
       }
   });
   
   
   var TableTrips = Backbone.Collection.extend({
       model: RowTrip,
       initialize: function(){
           this.on('add', this.buildNext, this);
           
       },
       addRow:function(row){
           row.tid=this.length;
           this.add(row);
       },
       buildNext:function(one){
           var tid=one.get("tid");
           var arr=travel.models[tid].combinated();
           _.each(arr, function(row){
               row.tidTrip=tid;
               row.tid=this.length;
               travelResult.get("tableSimpleTrips").addRow(row);
               
           },this);
       }
   });
   
   
   var RowSimpleTrip = Backbone.Model.extend({
      defaults:{
          tid: 0,
          tidTrip: 0,
          station_id_from:0,
          station_id_till:0,
          station_from: "",
          station_till: "",
          date_start: "",
          goodPlaces: 0
      },
      getData: function(){
          
          return {
              "station_id_from": this.get("station_id_from"),
              "station_id_till": this.get("station_id_till"),
              "station_from": this.get("station_from"),
              "station_till": this.get("station_till"),
              "date_start": this.get("date_start"),
              "time_from": "00:00",
              "search" : ""
              
          }
      }
      
   });
   
   
   var TableSimpleTrips = Backbone.Collection.extend({
       model: RowSimpleTrip,
       initialize: function(){
           this.on('add', this.buildNext, this);
           
       },
       addRow:function(row){
           row.tid=this.length;
           this.add(row);
       },
       
       buildNext:function(one){
           var tid=one.get("tid");
           var data=one.getData();
           facade.ask("search", data, this , tid);
           
       },
       answerFacade: function(data, tid){
           var tidSimpleTrip=tid;
           _.each(data.value,function(eachTrain){
               var rowTrain = {
                    "tidSimpleTrip": tidSimpleTrip,
                    "num": eachTrain.num,
                    "model":eachTrain.model,
                    "station_id_from": eachTrain.from.station_id,
                    "station_from": eachTrain.from.station,
                    "date_from": eachTrain.from.date,
                    "station_id_till": eachTrain.till.station_id,
                    "station_till": eachTrain.till.station,
                    "date_till": eachTrain.till.date
            
                            
               };
               
               var tidTrain=travelResult.get("tableTrains").addRow(rowTrain);
               _.each(eachTrain.types,function(eachType){
                    var rowType = {
                        "tidTrain" : tidTrain,
                        "type_id" : eachType.type_id
                   
                    };
                    travelResult.get("tableTypes").addRow(rowType);
                    
               
               },this);
           },this)
           
       },
       countGoodPlaces: function(arr){
           this.each(function(one){
               arr[one.get("tid")]==undefined ? arr[one.get("tid")]=0 :arr[one.get("tid")];
               one.set({"goodPlaces": arr[one.get("tid")]});             
           },this);
       }
   });
   
   var RowTrain = Backbone.Model.extend({
       defaults: {
           tid:0,
           tidSimpleTrip:0,
           num:0,
           model:0,
           station_id_from:0,
           station_from: "",
           date_from: 0,
           station_id_till:0,
           station_till:"",
           date_till: 0,
           goodPlaces:0
       },
       showTime:function(type){
            var ret=this.getTime(type);
            var minute=ret%60;
            var hour=(ret-minute)/60;
            ret=hour+":"+minute;
            return ret;

       },
       getTime:function(type){
            var ret;
            switch(type){
                case "from":
                    ret=this.get("date_from");
                break;
                case "till":
                    ret=this.get("date_till");
                break;
                default:
                    ret=this.get("date_from");

            }
            ret=((ret % (24*3600))+(3*3600))/60;
            return ret;

       }
   });
   
   var TableTrains = Backbone.Collection.extend({
       model: RowTrain,
       initialize: function(){
           
           
       },
       addRow:function(row){
           row.tid=this.length;
           this.add(row);
           return row.tid;
       },
       countGoodPlaces: function(arr){
           var newArr=new Array();
           this.each(function(one){
               arr[one.get("tid")]==undefined ? arr[one.get("tid")]=0 :arr[one.get("tid")];
               one.set({"goodPlaces": arr[one.get("tid")]});
               newArr[one.get("tidSimpleTrip")]==undefined ? newArr[one.get("tidSimpleTrip")]=one.get("goodPlaces") : newArr[one.get("tidSimpleTrip")]+=one.get("goodPlaces");
                    
               
               
           },this);
           return newArr;
           
       },
       getArrTrips:function(){
            var ArrTrips=new Array();
            travelResult.get("tableSimpleTrips").each(function(one){
                ArrTrips[one.get("tid")]=one.get("tidTrip");

            },this);
            return ArrTrips;

       },

       searchGoodPlaces:function(){
            var arrTrips=this.getArrTrips();
            var arrGoodTrains=new Array();
            //Проверка времени отправления
            this.each(function(one){
                var paramsId=arrTrips[one.get("tidSimpleTrip")];
                var params=travel.models[paramsId].get("parametrs");
                
                if (one.getTime("from") >= params.getTime("from") && one.getTime("from") <= params.getTime("till")){
                    arrGoodTrains[one.get("tid")]=paramsId;

                }  

            },this);
            return arrGoodTrains;

       }
   });
   
   var RowType= Backbone.Model.extend({
       defaults:{
           tid:0,
           tidTrain:0,
           type_id:0
       }
   });
   
   var TableTypes = Backbone.Collection.extend({
       model: RowType,
       initialize: function(){
           this.on('add', this.buildNext, this);
           
       },
       addRow:function(row){
           row.tid=this.length;
           this.add(row);
       },
       buildNext:function(one){
           
           var tidTrain=one.get("tidTrain");
           var train=travelResult.getTrainByTid(tidTrain);
           data={                    
                "station_id_from":  train.get("station_id_from"),
                "station_id_till":  train.get("station_id_till"),
                "train":    train.get("num"),
                "coach_type_id": one.get("type_id"),
                "date_start": train.get("date_from"),
                "round_trip":0    
           };

           facade.ask("coaches", data, this , tidTrain);

       },
       answerFacade: function(data, tid){
           var tidTrain=tid;
           _.each(data.value.coaches,function(eachCoach){
               var row={
                   "tidTrain" : tidTrain,
                   "num": eachCoach.num,
                   "service":eachCoach.service,
                   "price": eachCoach.price,
                   "reserve_price":eachCoach.reserve_price,
                   "station_id_from":eachCoach.station_id_from,
                   "station_id_till":eachCoach.station_id_till,
                   "train":eachCoach.train,
                   "date_start":eachCoach.date_start,
                   "coach_type_id":eachCoach.coach_type_id
                };
                travelResult.get("tableCoaches").addRow(row);

            },this);
            
           
       }
   });
   
   var RowCoach = Backbone.Model.extend({
       defaults:{
           tid:0,
           tidTrain:0,
           num:0,
           service: true,
           price: 0,
           reserve_price:0,
           station_id_from:0,
           station_id_till:0,
           train: "",
           date_start:"",
           coach_type_id:0,
           goodPlaces:0
               
       }
   });
   
   var TableCoaches = Backbone.Collection.extend({
       model: RowCoach,
       initialize: function(){
           this.on('add', this.buildNext, this);
           
       },
       addRow:function(row){
           row.tid=this.length;
           this.add(row);
       },
       buildNext:function(one){
           
           var tidCoach=one.get("tid");
           var data={
                        "station_id_from": one.get("station_id_from"),
                        "station_id_till": one.get("station_id_till"),
                        "train": one.get("train"),
                        "coach_num": one.get("num"),
                        "coach_type_id": one.get("coach_type_id"),
                        "date_start": one.get("date_start")
              
                    };
           

           facade.ask("coach", data, this , tidCoach);
          
           
       },
       answerFacade: function(data, tid){
           var tidCoach=tid;
           _.each(data.value,function(eachPlace){
               var row={
                   "tidCoach":tidCoach,
                   "place":eachPlace
                   
               }
               travelResult.get("tablePlaces").addRow(row);
               
           },this);
           
            
           
       },
       countGoodPlaces: function(arr){
           var newArr=new Array();
           this.each(function(one){
               arr[one.get("tid")]==undefined ? arr[one.get("tid")]=0 :arr[one.get("tid")];
               one.set({"goodPlaces": arr[one.get("tid")]});
               newArr[one.get("tidTrain")]==undefined ? newArr[one.get("tidTrain")]=one.get("goodPlaces") : newArr[one.get("tidTrain")]+=one.get("goodPlaces");
                    
               
               
           },this);
           return newArr;
           
       },
       searchGoodPlaces:function(goodTrains){
        //поиск по типу вагона
            var goodCoaches=new Array();
            this.each(function(one){
                if ( goodTrains[one.get("tidTrain")] != undefined){
                    var paramsId=goodTrains[one.get("tidTrain")];
                    var params=travel.models[paramsId].get("parametrs");
                    if (params.get("l") && one.get("coach_type_id")==1){goodCoaches[one.get("tid")]=paramsId;}
                    if (params.get("k") && one.get("coach_type_id")==3){goodCoaches[one.get("tid")]=paramsId;}
                    if (params.get("p") && one.get("coach_type_id")==4){goodCoaches[one.get("tid")]=paramsId;}
                    if (params.get("s2") && one.get("coach_type_id")==14){goodCoaches[one.get("tid")]=paramsId;}
                    
                }


            },this);
            return goodCoaches;

       }

       
       
       
       
       
   });
   
   
   var RowPlace = Backbone.Model.extend({
       defaults:{
           tid:0,
           tidCoach:0,
           place:0,
           order:false,
           goodPlace:false
       }
   })
   var TablePlaces = Backbone.Collection.extend({
       model: RowPlace,
       initialize: function(){
           
           
       },
       addRow:function(row){
           row.tid=this.length;
           this.add(row);
       },
       countGoodPlaces:function(){
           var newArr=new Array();
           this.each(function(one){
               if (one.get("goodPlace")){
                   newArr[one.get("tidCoach")]==undefined ? newArr[one.get("tidCoach")]=1 : newArr[one.get("tidCoach")]++;
                    
               }
               
           },this);

           return newArr;
       },
       checkL: function(params, one, arrPlaces, arr){
            if ( !(params.get("one") && params.get("number") >2) ) {
                if (!params.get("one") ){
                    if(arrPlaces.length>=params.get("number")){
                        _.each(arrPlaces, function(one){
                            one.set({goodPlace:true});
                        },this);
                    }
                }

                if ( params.get("one") ){
                        
                    for (var i=1; i<20; i=i+2){
                        var all=(arr[i]?1:0)+(arr[i+1]?1:0);
                        
                        if (all >=params.get("number") ){
                            _.each(arrPlaces, function(one){
                                if(one.get("place")==i || one.get("place")==i+1){
                                    one.set({goodPlace:true});
                                }
                            },this);

                        }                         


                    }

                }




            }

       },
       checkK:function(params, one, arrPlaces, arr){
                if ( !(params.get("one") && params.get("number") >4) ) {
                    
                
                    
                    if (!params.get("one") && params.get("down")){
                        var coutPlaces=0;
                        _.each(arrPlaces, function(one){
                            if(one.get("place")%2==1){coutPlaces++;}

                        },this)
                        
                        if (coutPlaces >=params.get("number")){
                            _.each(arrPlaces, function(one){
                                if(one.get("place")%2==1){
                                    one.set({goodPlace:true});
                                }
                            },this)

                        }

                    }

                    if (!params.get("one") && !params.get("down") ){
                        if(arrPlaces.length>=params.get("number")){
                            _.each(arrPlaces, function(one){
                                one.set({goodPlace:true});
                            },this);
                        }
                    }

                    if ( params.get("one") && params.get("down") ){
                        
                        for (var i=1; i<40; i=i+4){
                            var down=(arr[i]?1:0)+(arr[i+2]?1:0);
                            var up=(arr[i+1]?1:0)+(arr[i+3]?1:0);

                            if (params.get("number")==1 && down>=1){
                                _.each(arrPlaces, function(one){
                                    if(one.get("place")==i || one.get("place")==i+2){
                                        one.set({goodPlace:true});
                                    }
                                },this);

                            }
                            if (params.get("number")==2 && down==2){
                                _.each(arrPlaces, function(one){
                                    if(one.get("place")==i || one.get("place")==i+2){
                                        one.set({goodPlace:true});
                                    }
                                },this);

                            }
                            if (params.get("number")==3 && down==2 && up>=1){
                                _.each(arrPlaces, function(one){
                                    if(one.get("place")==i || one.get("place")==i+2 || one.get("place")==i+1 || one.get("place")==i+3){
                                        one.set({goodPlace:true});
                                    }
                                },this);

                            }
                            if (params.get("number")==4 && down==2 && up==2){
                                _.each(arrPlaces, function(one){
                                    if(one.get("place")==i || one.get("place")==i+2 || one.get("place")==i+1 || one.get("place")==i+3){
                                        one.set({goodPlace:true});
                                    }
                                },this);

                            }                         


                        }


                    }

                    if ( params.get("one") && !params.get("down") ){
                        
                        for (var i=1; i<40; i=i+4){
                            var all=(arr[i]?1:0)+(arr[i+2]?1:0)+(arr[i+1]?1:0)+(arr[i+3]?1:0);
                            
                            if (all >=params.get("number") ){
                                _.each(arrPlaces, function(one){
                                    if(one.get("place")==i || one.get("place")==i+2 || one.get("place")==i+1 || one.get("place")==i+3){
                                        one.set({goodPlace:true});
                                    }
                                },this);

                            }                         


                        }

                    }


                }

       },
       checkP:function(params, one, arrPlaces, arr){
            if (params.get("side")){
                arrPlaces = _.filter(arrPlaces, function(one){ return one.get("place") <=36; },this);
                arr=new Array();
                _.each(arrPlaces, function(one){
                    arr[one.get("place")]=true;

                },this)
                this.checkK(params, one, arrPlaces, arr);
            } else {
                if ( params.get("one") && !params.get("down") ){
                    for (var i=1; i<36; i=i+4){
                        var all=(arr[i]?1:0)+(arr[i+2]?1:0)+(arr[i+1]?1:0)+(arr[i+3]?1:0)+(arr[54-Math.floor(i/4)*2-1]?1:0)+(arr[54-Math.floor(i/4)*2]?1:0);                     
                        if (all >=params.get("number") ){
                            _.each(arrPlaces, function(one){
                                if(one.get("place")==i || one.get("place")==i+2 || one.get("place")==i+1 || one.get("place")==i+3 || one.get("place")==54-Math.floor(i/4)*2-1|| one.get("place")==54-Math.floor(i/4)*2){
                                    one.set({goodPlace:true});
                                }
                            },this);
                        }                         
                    }
                }
                if (!params.get("one") && !params.get("down") ){
                    if(arrPlaces.length>=params.get("number")){
                        _.each(arrPlaces, function(one){
                            one.set({goodPlace:true});
                        },this);
                    }
                }

                if (!params.get("one") && params.get("down")){
                    var coutPlaces=0;
                    _.each(arrPlaces, function(one){
                        if(one.get("place")%2==1){coutPlaces++;}

                    },this)
                    
                    if (coutPlaces >=params.get("number")){
                        _.each(arrPlaces, function(one){
                            if(one.get("place")%2==1){
                                one.set({goodPlace:true});
                            }
                        },this)

                    }

                }

                if ( params.get("one") && params.get("down") ){
                        
                    for (var i=1; i<40; i=i+4){
                        var down=(arr[i]?1:0)+(arr[i+2]?1:0)+(arr[54-Math.floor(i/4)*2-1]?1:0);
                        var up=(arr[i+1]?1:0)+(arr[i+3]?1:0)+(arr[54-Math.floor(i/4)*2]?1:0);

                        if ( (params.get("number")==1 && down>=1) || (params.get("number")==2 && down>=2) || (params.get("number")==3 && down>=3)){
                            _.each(arrPlaces, function(one){
                                if(one.get("place")==i || one.get("place")==i+2 || one.get("place")==54-Math.floor(i/4)*2-1){
                                    one.set({goodPlace:true});
                                }
                            },this);

                        }
                        
                        if ( (params.get("number")==4 && down==3 && up>=1) || (params.get("number")==5 && down==3 && up>=2) || (params.get("number")==6 && down==3 && up==3)){
                            _.each(arrPlaces, function(one){
                                if( one.get("place")==i || one.get("place")==i+2 || one.get("place")==i+1 || one.get("place")==i+3 || one.get("place")==54-Math.floor(i/4)*2-1 || one.get("place")==54-Math.floor(i/4)*2 ) {
                                    one.set({goodPlace:true});
                                }
                            },this);

                        }
                        



                    }


                }







            }

       },
       searchGoodPlaces:function(goodCoaches){
           /* */
            for (var index in goodCoaches){
                var tidCoach=parseInt(index)
                var arrPlaces=this.where({tidCoach:tidCoach});
                
                var arr=new Array();
                _.each(arrPlaces, function(one){
                    arr[one.get("place")]=true;

                },this)

                var paramsId=goodCoaches[index];
                var params=travel.models[paramsId].get("parametrs");

                var coach_type_id=travelResult.get("tableCoaches").models[tidCoach].get("coach_type_id");
                
                switch (coach_type_id){
                    case "1":
                        this.checkL(params, one, arrPlaces, arr);
                    break;
                    case "3":
                        this.checkK(params, one, arrPlaces, arr);
                    break;
                    case "4":
                         this.checkP(params, one, arrPlaces, arr);
                    break;

                    default:
                        this.each(function(one){
                            if ( goodCoaches[one.get("tidCoach")] != undefined){
                                one.set({goodPlace:true});
                            }
                        },this);
                }

                
            }


       }
   });
   
   
   
        
        
  //End Relation Logic      
    //End block SearchResult

    var Changer= Backbone.Model.extend({
            defaults:{
                jsonstring:"",
                type:"none"

            }
        });

        var changer=new Changer();


    //end changer
    //paste here

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
	            "!/orders": "orders", // orders view
	            "!/history": "history" // Page with link on email
	        },
            initialize: function(){
                appView=new AppView({el: $("#search_box")});


            },

            hider: function(){
                $('#history_box').css("display","none");
                $('#orders_box').css("display","none");
                $('#search_box').css("display","none");

                $('#search_panel').find('li.tab').removeClass("active");

            },
	        search: function () {
	            //appState.set({ state: "search" });
                this.hider();
                $('#search_box').css("display","block");
                $('#search').addClass("active");
	        },


	        orders: function () {
	            //appState.set({ state: "orders" });
                this.hider();
                $('#orders_box').css("display","block");
                $('#orders').addClass("active");
	        },

	        history: function () {
	            appState.set({ state: "history" });
                this.hider();
                $('#history_box').css("display","block");
                $('#history').addClass("active");

                $.ajax({
                    type: "POST",
                    url: 'main/view_history',
                    beforeSend: function ( xhr ) {
                        xhr.setRequestHeader("X-CSRF-Token", $('meta[name=csrf-token]').attr('content'));
                    },
                    success: function(data){
                        if(data.length<1) { 
                            var str="<div id='no_history_found'><h3>У Вас нет текущих шаблонов</h3><p>Используя пунк меню <strong>'Поиск'</strong>, Вы можете сохранять важные маршруты. Для этого Вам необходимо <br />выбрать пункт - <strong>Добавить поездку</strong>, указать станцию прибытия, станцию отправления и желаемую дату.</p><p>Зайдействовать нужный шаблон поиска можно на этой вкладке.</p><br /><br /><br /><p class='signup_adm'>C уважением, администрация сайта<p></div>";

                            $("#history_box").html(str);
                            return;
                        } 
                        var history_content="<table cellspacing='4'>";

                        $.each(data, function(index, value) {
                            my_date=(value.created_at).substring(0,10) + " / "+(value.created_at).substring(11,19);
                            history_content+="<tr><td>"+(index+1)+".</td><td>"+value.title+"</td><td>"+my_date+"</td><td><button button_do='use' id='history_template_"+value.id+"' class='add ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' role='button' history_id='"+value.id+"'aria-disabled='false'><span class='ui-button-text'>Применить</span></button><button  button_do='del' class='add ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' role='button' history_id='"+value.id+"'aria-disabled='false'><span class='ui-button-text'>X</span></td></tr>";
                        });

                        history_content+="</table>";
                        $("#history_box").html(history_content);

                        $('#history_box button').bind('click', function() {

                            if ($(this).attr('button_do')=="use"){
                                $.ajax({
                                    type: "POST",
                                    url: 'main/view_history',
                                    beforeSend: function ( xhr ) {
                                        xhr.setRequestHeader("X-CSRF-Token", $('meta[name=csrf-token]').attr('content'));
                                    },
                                    data:{history_id:$(this).attr('history_id')},
                                    success: function(data){
                                        controller.navigate("!/search", true);
                                        //alert(data.json);
                                        appView=new AppView({el: $("#search_box")});
                                        changer.set({type:"from", jsonstring:data.json});
                                        
                                    }
                        
                                 });
                            }else{
                                $.ajax({
                                    type: "POST",
                                    url: 'main/del_template',
                                    beforeSend: function ( xhr ) {
                                        xhr.setRequestHeader("X-CSRF-Token", $('meta[name=csrf-token]').attr('content'));
                                    },
                                    data:{history_id:$(this).attr('history_id')},
                                    success: function(data){
                                        controller.navigate("!/test", true);
                                        controller.navigate("!/history", true);
                                    }
                        
                                 });
                            }
                        });
                    }

                }); 
	        }
    	});
                    var travel;
                    var travelResult;
                    var appView;
                    var facade= new Facade(); 

    	var controller = new Controller(); // create controller



    Backbone.history.start();  // Start HTML5 History push  
                               

//JSON.stringify(travel)


}); 
//});