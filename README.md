# part13_relationalDB


notes:::

Docker

This instruction assumes that you master the basic use of Docker to the extent taught by e.g. part 12.

Start Postgres Docker image with the command

docker run -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 postgres

docker exec -it ff3f49eadf27 psql -U postgres postgres

postgres=# \d
Did not find any relations.


Let's create a table for notes:

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    content text NOT NULL,
    important boolean,
    date time
);

insert into notes (content, important) values ('Relational databases rule the world', true);
insert into notes (content, important) values ('MongoDB is webscale', false);

postgres=# select * from notes;


If you use Docker, the connect string is:

DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5432/postgres