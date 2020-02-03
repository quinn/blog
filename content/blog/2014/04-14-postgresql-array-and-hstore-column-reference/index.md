---
layout: post
title: Postgresql Array and Hstore Column Reference
date: "2014-04-14"
description: |
  I've had trouble finding a good reference for hstore and arrays in postgres that includes examples and use-cases so I decided to put together my own here. Hopefully others can get some use out of it. I've also included some examples of how to use with ActiveRecord.

topic: data-management
---

First of all, let's start with links to the relevant postgres docs:

http://www.postgresql.org/docs/9.3/static/hstore.html
<br>
http://www.postgresql.org/docs/9.3/static/arrays.html
<br>
http://www.postgresql.org/docs/9.3/static/functions-array.html

The postgres project has excellent documentation, and these links do covere
everything you would need to work with hstore and arrays with postgres.
Sometimes though it can be difficult to translate their examples into real
world examples, and it can also be difficult to translate this into
ActiveRecord.

### Postgresql Arrays

Arrays in postgres in that they aren't their own type per se, rather than it's
own separate type. Rather, the existing column types can be declared as an
array (e.g. an array of ints, array of texts, etc).

### Declaring array fields

Arrays can be declared in the following ways:

#### SQL
~~~ sql
CREATE TABLE articles (body text, tags text[]);
~~~

#### ActiveRecord
~~~ ruby
create_table :articles do |t|
  t.text :body
  t.text :tags, array: true
end
~~~

That's pretty straightforward. I'm going to go through some common operations.

### Array inclusion

Sometimes you want to find out if an array includes, or does not include a
given value, and return the records where it is true. Given the above table,
this is what that could look like:

#### SQL
~~~ sql
--- which articles are tagged with 'programming'
SELECT * FROM articles WHERE 'programming' = ANY (tags);

--- which articles are not tagged with 'programming'
SELECT * FROM articles WHERE 'programming' != ALL (tags);
--- or
SELECT * FROM articles WHERE NOT ('programming' = ANY (tags));
~~~

#### ActiveRecord
~~~ ruby
# which articles are tagged with 'programming'
Article.where('? = ANY (tags)', 'programming')

# which articles are not tagged with 'programming'
Article.where('? != ALL (tags)', 'programming')
# or
Article.where('NOT (? = ANY (tags))', 'programming')
~~~

### Updating arrays

How do you append to an array? You could use your ORM in a predictable way:

~~~ ruby
article = Article.find(1)
article.tags << 'programming'
article.save!
~~~

>__Note (2014-04-16)__: There may be currently a bug in rails that can cause
issues with the above syntax. If so, try running `article.tags_will_change!`.
More info on the bug [here][bug]. Thanks, [Dieter Komendera][dieter] for
pointing this out.

But what if you wanted to perform this in a single operation, or what if you
wanted to perform this on multiple records at once in a single query? This is
possible, using the `append_array` function:

#### SQL
~~~ sql
UPDATE articles SET tags = array_append(tags, 'programming')
~~~

#### ActiveRecord
~~~ ruby
Article.update_all Article.send(:sanitize_sql, ['tags = array_append(tags, ?)', 'programming'])
~~~

This unfortunately isn't as clean as one might like it to be in ActiveRecord.
I'd love to know if there is a better way to do this.

### Find empty arrays

Generally when creating an array column I think it is advisable to to make it
non-null and default to an empty array:

~~~ ruby
t.text :tags, array: true, null: false, default: []
~~~

This prevents a small "gotcha" when an array column is null (not an empty
array). For example, in the example above that tests for a value not being in
the array field, the query would have returned a misleading empty set if all
of the array columns were null. You can get around this by setting a column
default, or by testing to see if the array column is null:

~~~ sql
SELECT * FROM articles where 'programming' != ALL (tags) || tags IS NULL;
~~~

If you wanted to find all records with empty tags _and_ null tags, you could do:

~~~ sql
SELECT * FROM articles where tags = '{}' OR tags IS NULL;
~~~

### Array intersection

It's a common scenario to want to find records with an array field that has at
least one member from a given list. You can use the `&&` operator to find
these:

#### SQL
~~~ sql
SELECT * FROM articles WHERE tags && ARRAY['devops', 'design'];

--- or, if your array column is of something other than text (possibly varchar)
SELECT * FROM articles WHERE CAST (tags as text[]) && ARRAY['devops', 'design'];
~~~

#### ActiveRecord
~~~ ruby
Article.where('tags && ARRAY[?]', ['devops', 'design'])
~~~

### Postgresql Hstore

Postgres hstore is column type for storing hierarchical schemaless data
(sometimes called "documents") in a Postgres table. This is great if you are
going to be storing data you'd like to be able to query, but aren't necessarily
going to have consistent field names. Hstore is often compared to NoSQL
document stores such as MongoDB.

### Declaring Hstore column type

`hstore` is just a column type like any other, so declaring it is
straightforward.

#### SQL
~~~ sql
CREATE TABLE web_requests (
  url varchar,
  body text,
  headers hstore
);
~~~

#### ActiveRecord
~~~ ruby
create_table :web_requests do |t|
  t.string :url
  t.text :body
  t.hstore :headers
end
~~~

### Setting a value to a key in hstore

Hstore keys are strings, and one of two types can be assigned to a key in
hstore: a string, or another hstore value.

#### SQL
~~~ sql
INSERT INTO web_requests (url, body, headers) VALUES (
  '/articles.json',
  '',
  'Accept        => application/json,
   Cache-Control => no-cache'
);
~~~

#### ActiveRecord
~~~ ruby
web_request = WebRequest.create({
  url: '/articles.json',
  headers: {
    'Accept'        => 'application/json',
    'Cache-Control' => 'no-cache'
  }
})
~~~

### Finding a record with an hstore with a given value

These are examples of how to find records that have a key with a given value
for an hstore column.

#### SQL
~~~ sql
SELECT * FROM web_requests WHERE headers->'Accept' = 'application/json'
~~~

#### ActiveRecord
~~~ ruby
WebRequest.where("headers->'Accept' = ?", 'application/json')
~~~

### Finding a record with an hstore with a non-null value for a given key

Sometimes you want to find all records that have any value set for a given
key. Using our `WebRequest` example this could be useful for finding all
requests that set caching headers. Postgresql provides a `defined` function
for this.

#### SQL
~~~ sql
SELECT * FROM web_requests WHERE defined(headers, 'Cache-Control')
~~~

#### ActiveRecord
~~~ ruby
WebRequest.where('defined(headers, ?)', 'Cache-Control')
~~~

### Removing a key from an hstore

Rather than setting a key to an empty string or `NULL`, sometimes it can be
nice to completely remove the value and key from hstore. Postgresql provides a
`delete` function to this. Again, I am not aware of a clean interface for
running functions in an `UPDATE` while using ActiveRecord, so I'm using the
same hacky solution described previously for `append_array`.

#### SQL
~~~ sql
UPDATE articles SET headers = delete(headers, 'Cache-Control') WHERE id = 1
~~~

#### ActiveRecord
~~~ ruby
Article.where(id: 1).update_all Article.send(:sanitize_sql, ['headers = delete(headers, ?)', 'Cache-Control'])
~~~

That's all for now. Hopefully this helps clarify some ways of using arrays and
hstore especially in practice, and when using ActiveRecord. Stay tuned for
more snippets as well as examples of using postgres's enum functionality in
ActiveRecord.

[bug]:    https://github.com/rails/rails/issues/6127
[dieter]: http://www.komendera.com/
