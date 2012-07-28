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
	  	@title = "Функционал"
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
        count=0
        post_string.each_byte do |byte| 
          count+= 1
        end  

        host = 'booking.uz.gov.ua'     # The web serve
        #host= 'mock.my'
        port = 80                           # Default HTTP port
        path = '/ru/purchase/'+params[:type]    # The file we want 
        #path = '/proxy.php'
        #equest = "POST #{path} HTTP/1.1\r\n"+"Host: #{host} \r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
        request="POST #{path} HTTP/1.1\r\n"
        request+="Host: #{host} \r\n"
        request+="Content-Type: application/x-www-form-urlencoded\r\n"
        #request+="Content-Length: "+post_string.size.to_s+"\r\n"
        request+="Content-Length: "+count.to_s+"\r\n"
        request+="Connection: close\r\n\r\n"
        request+=post_string
        socket = TCPSocket.open(host,port)  # Connect to server
        socket.print(request)               # Send request
        response = socket.read              # Read complete response
        # Split response at first blank line into headers and body
        headers,body = response.split("\r\n\r\n", 2) 
        #render(text => body)
        render :json => body and return                          # And display it

      else
          render :json => {:success => false, :text => "There are no parameters"} and return  
      end



    #end

  end

  def view_history
    if check_session()
      history=History.select('id, title, json,created_at').where(:user_id => session[:current_user]).limit(100).order("created_at")
      render :json => history
    end
  end

end
