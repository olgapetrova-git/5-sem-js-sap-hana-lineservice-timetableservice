
drop table doc;

create table doc (
  id integer not null primary key,
  title shorttext(200) not null,
  content text not null
);	

