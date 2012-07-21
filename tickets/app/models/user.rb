class User < ActiveRecord::Base
   attr_accessible :first_name, :last_name, :password, :salt, :activated, :role, :email
end
