CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes text DEFAULT 0
);

insert into blogs (author, url, title, likes) values ('kukko100', 'kukko.com', 'kukko title', 123);
insert into blogs (author, url, title, likes) values ('kissa123', 'kissa.com', 'title kissa', 321);
