class CreateHistories < ActiveRecord::Migration
  def change
    create_table :histories do |t|

      t.integer "user_id",  :limit =>4
      t.string "title",  :limit =>350
      t.text "json"

      t.timestamps
    end
  end
end
