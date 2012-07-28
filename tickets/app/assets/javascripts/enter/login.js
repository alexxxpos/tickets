$(document).ready(function() {
$(function () {

    var AppState = Backbone.Model.extend({
        defaults: {
           /* first_name: "",
            last_name: "",
            email: "",
            password: "",
            password_confirmation: "", */
            state: "login"
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

        checkData: function (user_array) { // Check user data

            // Check on empty fields
            if(user_array['first_name']==""||user_array['last_name']==""||user_array['email']==""||user_array['password']==""||user_array['password_confirmation']==""){
                $(".mistake").text("* Пожалуйста, заполните все поля").css("display","block");
                return 0;
            }

            //Check text fields
            var reg_name=/^[a-zа-я]{2,15}$/i;
            var reg_email=/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i;
            var reg_password=/^(?=.*(\d|[^a-zA-ZА-Я]))(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?!.*\s).{6,12}$/;
            if(!reg_name.test(user_array['first_name'])) { $('#reg_first_name').focus(); $(".mistake reg").text("* Неверный формат Имени").css("display","block"); return 0;}
            if(!reg_name.test(user_array['last_name'])) { $('#reg_last_name').focus(); $(".mistake reg").text("* Неверный формат Фамилии").css("display","block"); return 0;}
            if(!reg_email.test(user_array['email'])) { $('#reg_email').focus(); $(".mistake reg").text("* Неверный формат Email").css("display","block"); return 0;}
            if(!reg_password.test(user_array['password'])) { $('#reg_password').focus(); $(".mistake reg").html("* Пароль должен содержать минимум 6 символов <br /> Символы верхнего и нижнего регистра <br /> Хотя бы 1 цифру").css("display","block"); return 0;}
            if(user_array['password']!=user_array['password_confirmation']){$('#reg_password_confirmation').focus();$(".mistake").text("* Пароли не совпадают").css("display","block"); return 0;}

            //If everything ok -> send 'true'
            return 1;
            
        },

        checklogin: function (login_array) { // Check user data

            // Check on empty fields
            if(login_array['email']==""){
                $('#login_email').focus();
                $(".mistake").text("* Вы не указали email").css("display","block");
                return 0;
            }
            if(login_array['password']==""){
                $('#login_password').focus();
                $(".mistake").text("* Вы не указали пароль").css("display","block");
                return 0;
            }

            //Check text fields
            var reg_email=/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i;
            var reg_password=/^(?=.*(\d|[^a-zA-ZА-Я]))(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?!.*\s).{6,12}$/;
            if(!reg_email.test(login_array['email'])) { $('#login_email').focus(); $(".mistake").text("* Неверный формат Email").css("display","block"); return 0;}
            if(!reg_password.test(login_array['password'])) { $('#login_password').focus(); $(".mistake").html("* Пароль должен содержать минимум 6 символов <br /> Символы верхнего и нижнего регистра <br /> Хотя бы 1 цифру").css("display","block"); return 0;}
            
            //If everything ok -> send 'true'
            return 1;
            
        },

        checkEmail: function(rp_email){
            if(rp_email==""){
                $('#rp_email').focus();
                $(".mistake").text("* Вы не указали email").css("display","block");
                return 0;
            }
            var rpt_email=/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i;
            if(!rpt_email.test(rp_email)) { $('#login_email').focus(); $(".mistake").text("* Неверный формат Email").css("display","block"); return 0;}
            return 1;
        }

    });

    var User = new UserCollection();



    var Controller = Backbone.Router.extend({
        routes: {
            "": "login", // default page
            "!/": "login", // First page
            "!/signup": "signup", // Registration view
            "!/retrieve_password": "retrieve_password", // retrieve_password view
            "!/finish_registration": "finish_registration" // Page with link on email
        },

        login: function () {
            appState.set({ state: "login" });
        },

        signup: function () {
            appState.set({ state: "signup" });
        },

        retrieve_password: function () {
            appState.set({ state: "retrieve_password" });
        },

        finish_registration: function () {
            appState.set({ state: "finish_registration" });
        }
    });

    var controller = new Controller(); // create controller


    var Block = Backbone.View.extend({
        el: $("#enter_block"), // DOM elememt of our widget

        templates: { // template on dif states
            "login": _.template($('#login').html()),
            "signup": _.template($('#signup').html()),
            "retrieve_password": _.template($('#retrieve_password').html()),
            "finish_registration": _.template($('#finish_registration').html())
        },

        events: {
            "click #do_registration": "registration",           // handler on click button to registrate 
            "click #do_login": "login",                         // handler on click button to login
            "click #do_retrieve_password": "retrieve_password", // handler on click button to retrieve_password
            }, 


        initialize: function () { // Subscribe to the model events
            this.model.bind('change', this.render, this);
        },

        login: function () {
            var login_array = [];
            login_array["email"] = this.$el.find("#login_email").val();
            login_array["password"] = this.$el.find("#login_password").val();
            $('.mistake').css("display","none");

            var check = User.checklogin(login_array);
            if(check){
                $.post(
                        "enter/login",
                        {
                            email:login_array["email"],
                            password:login_array["password"]
                           
                        },
                        onAjaxSuccess
                        );
 
                        function onAjaxSuccess(data)
                        {
                            if (data.success==true) {
                                window.location = "main"
                            }else{
                                if (data.text=="email_error") {
                                    $(".mistake").text("* Пользователя с таким email не существует!").css("display","block");
                                }else if(data.text=="not_activated"){
                                    $(".mistake").html("* Ваш аккаунту неактивен. <br />Инструкции по активации были высланы Вам при регистрации на Email").css("display","block");
                                }else{
                                    $(".mistake").text("* Ошибка ввода пароля!").css("display","block");
                                }    
                            }
                        }
                    }

            
        },

        registration: function () {
            var user_array = [];
            user_array["first_name"] = this.$el.find("#reg_first_name").val();
            user_array["last_name"] = this.$el.find("#reg_last_name").val();
            user_array["email"] = this.$el.find("#reg_email").val();
            user_array["password"] = this.$el.find("#reg_password").val();
            user_array["password_confirmation"] = this.$el.find("#reg_password_confirmation").val();
            $('.mistake').css("display","none");
      
            var check = User.checkData(user_array);
            //
            if(check){
                $.post(
                        "enter/reg",
                        {
                            first_name:user_array["first_name"],
                            last_name:user_array["last_name"],
                            email:user_array["email"],
                            password:user_array["password"]
                           
                        },
                        onAjaxSuccess
                        );
 
                        function onAjaxSuccess(data)
                        {
               
                            if (data.success==true) {
                                appState.set({ state: "finish_registration" });
                                $("#link_to_activate").html("<a href='enter/activate?user="+data.salt+"'>Активировать</a>");
                            }else{
                                if (data.text=="email already exist") {
                                    $(".mistake").text("* Пользователь с таким email уже существует!").css("display","block");
                                }else{
                                    $(".mistake").text("* Возникла ошибка при обработке запроса. Приносим свои извинения. Попробуйте еще раз").css("display","block");
                                }
                            }
                        }
                    }


        },

        retrieve_password: function(){
            $('.mistake').css("display","none");
            var check = User.checkEmail($('#rp_email').val());
            if(check){
                $.post(
                        "enter/retrieve_password",
                        {
                            email:$('#rp_email').val()
                        },
                        onAjaxSuccess
                        );
 
                        function onAjaxSuccess(data)
                        {
                           if (data.success==true) {
                                $(".mistake").text("На Ваш Email отправлено письмо с инструкциями по смене пароля").css({"display":"block","color":"blue"});
                           }else{
                                    $(".mistake").text("* Пользователя с таким email не существует!").css({"display":"block", "color":"red"});



                           }
                        }
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

        if (state == "login")
            controller.navigate("!/", false); // false because we don't need to call state event
                                              // in controller
        else
            controller.navigate("!/" + state, false);

    });

    Backbone.history.start();  // Start HTML5 History push    


});
    

});