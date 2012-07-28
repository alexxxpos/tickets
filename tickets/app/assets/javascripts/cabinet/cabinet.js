$(document).ready(function() {
$(function () {

    var AppState = Backbone.Model.extend({
        defaults: {
            state: "info"
        }
    });

    var appState = new AppState();

    var UserModel = Backbone.Model.extend({ // 
        defaults: {
            "Name": "",
            "first_name": "",
            "last_name": "",
            "email": "",
            "password": "",
            "password_confirmation": ""
        }
    });

    var UserCollection = Backbone.Collection.extend({

        model: UserModel,

        checkData: function (edit_array) { // Check user data

            // Check on empty fields
            if(edit_array["first_name"]=="" || edit_array["last_name"]==""){
                $(".mistake").text("* Пожалуйста, заполните необходимые поля личной информации").css("display","block");
                if(edit_array["last_name"]=="") {$('#edit_last_name').focus();}
                if(edit_array["first_name"]=="") {$('#edit_first_name').focus();}
                return 0;
            }
            
            if(edit_array["old_password"]=="" && edit_array["new_password"]=="" && edit_array["password_confirmation"]==""){
               var edit_name=/^[a-zа-я]{2,15}$/i;
                if(!edit_name.test(edit_array["first_name"])) { $('#edit_first_name').focus(); $(".mistake reg").text("* Неверный формат Имени").css("display","block"); return 0;}
                if(!edit_name.test(edit_array["last_name"])) { $('#edit_last_name').focus(); $(".mistake reg").text("* Неверный формат Фамилии").css("display","block"); return 0;}
            }else{
                if(edit_array["old_password"]!="" && edit_array["new_password"]!="" && edit_array["password_confirmation"]!=""){
                    var edit_password=/^(?=.*(\d|[^a-zA-ZА-Я]))(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?!.*\s).{6,12}$/;
                    if(edit_array["new_password"]==edit_array["password_confirmation"]){
                        //return 1; 
                    }else{
                        $(".mistake").text("* Новый пароль и его подтверждение не совпадают! ").css("display","block");
                        $('#edit_password_confirmation').focus();
                        return 0;                   }
                }else{
                    if(edit_array["password_confirmation"]=="") {$('#edit_password_confirmation').focus(); }
                    if(edit_array["new_password"]=="") {$('#edit_new_password').focus();}
                    if(edit_array["old_password"]=="") {$('#edit_old_password').focus();}
                    $(".mistake").text("* Пожалуйста, заполните необходимые поля для смены пароля").css("display","block");
                }
                
            }



            //Check text fields on regular extansions
               
            
            
            if(!edit_password.test(edit_array["old_password"])) { 
                $('#edit_old_password').focus(); 
                $(".mistake reg").html("* Пароль должен содержать минимум 6 символов <br /> Символы верхнего и нижнего регистра <br /> Хотя бы 1 цифру").css("display","block"); 
                return 0;
            }
            if(!edit_password.test(edit_array["new_password"])) { 
                $('#edit_new_password').focus(); 
                $(".mistake reg").html("* Пароль должен содержать минимум 6 символов <br /> Символы верхнего и нижнего регистра <br /> Хотя бы 1 цифру").css("display","block"); 
                return 0;
            }
            if(!edit_password.test(edit_array["password_confirmation"])) { 
                $('#edit_password_confirmation').focus(); 
                $(".mistake reg").html("* Пароль должен содержать минимум 6 символов <br /> Символы верхнего и нижнего регистра <br /> Хотя бы 1 цифру").css("display","block"); 
                return 0;
            }

            if(edit_array['new_password']!=edit_array['password_confirmation']){$('#reg_password_confirmation').focus();$(".mistake").text("* Пароли не совпадают").css("display","block"); return 0;}

            return 1;
            
        }




    });

    var User = new UserCollection();



    var Controller = Backbone.Router.extend({
        routes: {
            "": "info", // default page
            "!/": "info", // First page
            "!/edit_info": "edit_info",// edit page

        },

        info: function () {
            appState.set({ state: "info" });
        },

        edit_info: function () {
            appState.set({ state: "edit_info" });
        }

    });

    var controller = new Controller(); // create controller


    var Block = Backbone.View.extend({
        el: $("#main_block"), // DOM elememt of our widget

        templates: { // template on dif states
            "info": _.template($('#info').html()),
            "edit_info": _.template($('#edit_info').html())
        },

        events: {
            "click #do_edit_info": "do_edit_info",
            "click #cancel_edit_info": "cancel_edit_info",
            "click #save_edit_info": "save_edit_info"
            }, 


        initialize: function () { // Subscribe to the model events
            this.model.bind('change', this.render, this);
        },

        do_edit_info: function(){
            controller.navigate("!/edit_info", true);
        },

        cancel_edit_info: function(){
            controller.navigate("", true);

        },

        save_edit_info:function(){
            var edit_array = [];
            edit_array["first_name"] = this.$el.find("#edit_first_name").val();
            edit_array["last_name"] = this.$el.find("#edit_last_name").val();
            edit_array["old_password"] = this.$el.find("#edit_old_password").val();
            edit_array["new_password"] = this.$el.find("#edit_new_password").val();
            edit_array["password_confirmation"] = this.$el.find("#edit_password_confirmation").val();
            var check = User.checkData(edit_array);
            if (check) {
                $.ajax({
                            type: "POST",
                            url: 'cabinet/edit_user_data',
                            beforeSend: function ( xhr ) {
                                    xhr.setRequestHeader("X-CSRF-Token", $('meta[name=csrf-token]').attr('content'));
                            },
                            data: {first_name:edit_array["first_name"],last_name:edit_array["last_name"], password:edit_array["new_password"]},
                            success: function(data){
                                if (data.success==true){
                                    window.location = "cabinet";
                                }else{
                                    $(".mistake").html("* Возникла ошибка! Приносим свои извинения. <br />Повторите операцию позже.").css("display","block"); 
                                }
                            }
                        });

             }        
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
        $('.nav').find('li').removeClass("active"); // drop styles in tabs
        $('#'+'_'+state+'_').addClass("active");    // use "active" in current tab

        if (state == "info")
            controller.navigate("!/", true); // false because we don't need to call state event
                                              // in controller
        else
            controller.navigate("!/" + state, false);

    });

    Backbone.history.start();  // Start HTML5 History push    


});
    

});