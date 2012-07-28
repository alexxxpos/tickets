# -*- encoding : utf-8 -*-
class CabinetController < ApplicationController

	layout 'cabinet'



  	def index
	    if check_session()
		  	@title = "Кабинет"
		  	render(:template =>'cabinet/cabinet')
	    end
  	end

  	def check_session
	    if session[:current_user] == nil
	        redirect_to(:controller=>'enter',:action =>'index') and return false
	    end

	    return true
  	end

  	def logout
	    session[:current_user] = nil
	    redirect_to root_url
  	end

  	def edit_user_data
	    if check_session()
	    	user = User.find(session[:current_user].id)
	    	user.first_name=params[:first_name]
	    	user.last_name=params[:last_name]
	    	user.last_name=params[:last_name]

	    	salt= Digest::SHA1.hexdigest(session[:current_user].email+(Time.now).to_s)
	    	encrypted_password= Digest::SHA1.hexdigest(params[:password]+salt)

	    	user.password=encrypted_password
	    	user.salt=salt
	    	if user.save
	    		session[:current_user] = user
	    		flash[:notice]="Спасибо. Профиль был успешно изменен!"
				render :json => {:success => true, :text => "success"} and return

			else
				#flash[:notice]="Возникла ошибка! Приносим свои извинения. Повторите операцию позже."
				render :json => {:success => false, :text => "error"} and return
			end
	    end
  	end


end
