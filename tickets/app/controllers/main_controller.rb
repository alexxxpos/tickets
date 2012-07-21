# -*- encoding : utf-8 -*-

class MainController < ApplicationController
  layout 'main'

  def index
    if session[:current_user] == nil
      	redirect_to(:controller=>'enter',:action =>'index')
    else
	  	@title = "Кабинет"
	  	render(:template =>'main/index')
    end

  end

  def logout
    session[:current_user] = nil
    redirect_to root_url
  end

end
