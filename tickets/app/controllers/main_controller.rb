# -*- encoding : utf-8 -*-

class MainController < ApplicationController
  layout 'main'

  def check_session
    if session[:current_user] == nil
        redirect_to(:controller=>'enter',:action =>'index') and return false
    end
    return true
  end

  def index
    if check_session()
	  	@title = "Кабинет"
	  	render(:template =>'main/index')
    end
  end

  def logout
    session[:current_user] = nil
    redirect_to root_url
  end

  def search
    
    if check_session()
      if params[:type]
        require 'net/http'                 
        host = 'booking.uz.gov.ua'     # The web server
        path = '/purchase/'+params[:type] # The file we want 

        http = Net::HTTP.new(host)          # Create a connection
        headers, body = http.get(path)      # Request the file
        if headers.code == "200"            # Check the status code   
          render :json => {:success => true, :text => headers.body} and return                    
        else                                
          render :json => {:success => false, :text => "Server is not found"} and return
        end

      else
          render :json => {:success => false, :text => "There are no parameters"} and return  
      end
    end

  end


end
