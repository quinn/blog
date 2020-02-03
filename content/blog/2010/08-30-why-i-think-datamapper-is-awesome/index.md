---
title: Why I think datamapper is awesome
date: "2010-08-30T08:30:26Z"
---

I know Datamapper is probably considered "old news" at this point, which is something I think unfortunate considering its low adoption rate. I'm going to re-hash its advantages here just to add my own voice to its fan base. Here are some of the reasons I really like datamapper. In no specific order.

## #1 robust query mapping

the datamapper API is robust enough that it drastically reduces how much one has to drop down to sql to get the desired results. For example:

```ruby
class Book
  include DataMapper::Resource

  property :published_at, DateTime

  belongs_to :author

  def self.published_recently
    all :published_at.gte => 1.week.ago
  end
end

Book.all.published_recently.authors
```

only executes a single query. neat right?

## #2 The property API

Datamapper favors explicit property definitions rather than attempting to infer them from the table. There are advantages to this, such as easier introspection and tighter control over serialization. Also, one of the ways that Datamapper offer's to its users to add features is the property api. One can create their own classes to extend datamapper's serialization and property mapping through a sussinct api:

```ruby
module DataMapper
  class Property
    class Geo > Yaml
      def dump(value)
        if value.nil? || value.kind_of?(Geokit::GeoLoc)
          super(value)
        else
          raise ArgumentError, &quot;+value+ must be nil, String or Geokit::GeoLoc&quot;
        end
      end

      def typecast(value)
        return value if value.nil? || value.kind_of?(Geokit::GeoLoc)
        geoloc = GeoKit::Geocoders::MultiGeocoder.geocode(value)
        unless geoloc.success
          raise ArgumentError, "+value+ is not a valid address"
        end
        geoloc
      end

    end
  end
end
```

This piggybacks on the existing yaml implementation that exists here: http://github.com/datamapper/dm-types/blob/v1.0.0/lib/dm-types/yaml.rb . Basically, you get two methods, one for loading (deserializing) from the database and one for dumping (serializing) to the database. Using the above class you can now:

```ruby
class Profile
  include DataMapper::Resource

  property :id, Serial
  property :address, Geo
end

profile = Profile.new
profile.address = "Brooklyn Bridge"
profile.address.district #=> "Manhattan"
```

## #3 inclusion over inheritance

I suppose this one is largely a stylistic preference. I like explicitly saying `include DataMapper::Resource` that way you know where to include your modules. for example:

```ruby
module DataMapper::Resource
  include MyModule::InstanceMethods
end

module DataMapper::Model
  include MyModule::ClassMethods
end
```

This is about as simple as it gets in my opinion. DataMapper::Resource's self.included method simple extends the current class with DataMapper::Model and does nothing else. To me this is clean and simple and doesn't add any fluff on top of what ruby does by default.

## Rails 3

Rails 3 will fix many of these problems, but I think DataMapper's api is still unique enough to merit looking into. Despite the improvements to activerecord 3 I plan on continuing to use datamapper in future projects.
