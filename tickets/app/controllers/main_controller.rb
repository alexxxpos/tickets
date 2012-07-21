# -*- encoding : utf-8 -*-

class MainController < ApplicationController
	layout 'main'

  def index
  	@title = "Кабинет"
  	render(:template =>'main/index')
  end

  def logout
    session[:current_user] = nil
    redirect_to root_url
  end

end
