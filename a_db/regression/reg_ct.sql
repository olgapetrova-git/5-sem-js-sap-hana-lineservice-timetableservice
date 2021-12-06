set schema adbkt;

drop table reg;

create table reg (
  id integer not null primary key,
  laenge integer not null,
  gewicht integer not null
);	

