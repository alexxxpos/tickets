class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
	  t.string "first_name",  :limit =>25
      t.string "last_name",  :limit =>50
      t.string "password",  :limit =>250
      t.string "salt",  :limit =>250
      t.decimal "activated",  :limit =>4
      t.string "role",  :limit =>25
      t.string "email",  :limit =>50, :default => "", :null => "false"
      t.timestamps
    end
  end
end
