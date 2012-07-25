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

    #if check_session()
      if params[:type]


       data= Array.new

        request.POST.each_with_index {|item, index| data[data.length]= item[0]+'='+item[1]}
         post_string= data.join('&')

        require 'socket'
         
        host = 'booking.uz.gov.ua'     # The web serve
        port = 80                           # Default HTTP port
        path = '/ru/purchase/'+params[:type]    # The file we want 
        #equest = "POST #{path} HTTP/1.1\r\n"+"Host: #{host} \r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
        request="POST #{path} HTTP/1.1\r\n"
        request+="Host: #{host} \r\n"
        request+="Content-Type: application/x-www-form-urlencoded\r\n"
        request+="Content-Length: "+post_string.length.to_s+"\r\n"
        request+="Connection: close\r\n\r\n"
        request+=post_string
        socket = TCPSocket.open(host,port)  # Connect to server
        socket.print(request)               # Send request
        response = socket.read              # Read complete response
        # Split response at first blank line into headers and body
        headers,body = response.split("\r\n\r\n", 2) 
        render :json => body and return                          # And display it

      else
          render :json => {:success => false, :text => "There are no parameters"} and return  
      end



    #end

  end

  def view_history
    if check_session()
      history=History.select('title,json,created_at').where(:user_id => session[:current_user]).limit(100)
      render :json => history
    end
  end

end
