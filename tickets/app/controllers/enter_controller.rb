# -*- encoding : utf-8 -*-
class EnterController < ApplicationController
	layout 'enter'

  def index
    if session[:current_user]
      redirect_to(:controller=>'main',:action =>'index')
    else
    	@title = "Вход"
    	render(:template =>'enter/enter')
    end
  end

  def enter
  	@title = "Вход"
  end

  def reg
    check=User.where(:email => params[:email]).count
    if check>0
       render :json => {:success => false, :text => "email already exist"} and return
    end

  	salt= Digest::SHA1.hexdigest(params[:email]+(Time.now).to_s)
  	encrypted_password= Digest::SHA1.hexdigest(params[:password]+salt)
  	
  	@user=User.new(:first_name => params[:first_name], :last_name => params[:last_name], :password => encrypted_password, :salt =>salt,:activated => false, :email =>params[:email], :role => 'user')
  	
  	if @user.save
  			UserMailer.welcome_email(@user).deliver
  			#format.html { redirect_to(@user, :notice => 'User was successfully created.') }
        #format.json { render :json => @user, :status => :created, :location => @user }

			render :json => {:success => true, :text => "success", :salt=> salt} and return

		else
			render :json => {:success => false, :text => "db error"} and return
	end

  end



  #def mail
  #	@user = User.find(6)
	#render(:text =>@user.first_name)
  #	UserMailer.welcome_email(@user).deliver
  #	format.html {render :xml => @user }
  #	#format.json { render :json => @user, :status => :created, :location => @user }
  #end

  def login
    user=User.where(:email => params[:email])
    if user.count<1
      render :json => {:success => false, :text => "email_error"} and return
    end

    user=user.fetch(0)
    encrypted_password= Digest::SHA1.hexdigest(params[:password]+user.salt)
    if user.password==encrypted_password && user.activated==true
        session[:current_user] = user
        render :json => {:success => true, :text => "success"} and return

    elsif user.password==encrypted_password && user.activated==false
        render :json => {:success => false, :text => "not_activated"} and return
    else
        render :json => {:success => false, :text => "password_error"} and return
    end  

  end

  def activate
    if !params[:user] || params[:user]==""
      render('public/404.html') and return
    end
    user=User.where(:salt =>params[:user])
    if user.count>0 && user.fetch(0).activated==false
      user.fetch(0).update_attributes(:activated => true)
      render(:text =>'Спасибо. Ваш аккаунт был успешно активирован!<br />Теперь вы можете зайти на наш сайт. <br /><a href="/">Перейти на страницу входа</a>') and return
    else
      render('public/404.html') and return
    end

  end

  def retrieve_password
      if params[:email]
          user=User.where(:email => params[:email])
          if user.count<1
            render :json => {:success => false, :text => "email_error"} and return
          else
            render :json => {:success => true, :text => "success"} and return
          end
      else
          render :json => {:success => false, :text => "no_data"} and return
      end
  end

end
