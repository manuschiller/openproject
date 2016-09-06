class AddDescriptionFieldToRelations < ActiveRecord::Migration
  def up
    add_column :relations, :description, :string, null: true
  end

  def down
    remove_column :relations, :description
  end
end
