drop table address;

create table address (
    key integer not null primary key,
    descr varchar(100) not null,
    lng decimal(13,10) not null,
    lat decimal(13,10) not null,
    pos st_point(4326) validation full
);

insert into address 
  values (1, 'Treskowallee 8, Berlin', 13.52593, 52.4932, null);
insert into address 
  values (2, 'Fasanenstr. 1, Berlin', 13.32641, 52.49502, null);
insert into address 
  values (3, 'Kurfürstendamm 100, Berlin', 13.29693, 52.49837, null);


delete from address;
insert into address values (1, 'Treskowallee 8, Berlin', 13.52593, 52.4932, null);
--  new st_point('Point(13.52593 52.4932)', 4326)) ;
insert into address values (2, 'Fasanenstr. 1, Berlin', 13.32641, 52.49502, null);
--  new st_point('Point(13.32641 52.49502)', 4326)) ;
insert into address values (3, 'Kurfürstendamm 100, Berlin', 13.29693, 52.49837, null);
--  new st_point('Point(13.29693 52.49837)', 4326)) ;

select * from address;
select pos.st_x() from address;


--'Hohenzollerndamm 10, Berlin', new st_point('Point(13.33015 52.51121)', 4326) 
select top 2
  descr,  
  pos.st_distance(new st_point('Point(13.33015 52.51121)', 4326), 'meter') dist
from address
order by dist;


