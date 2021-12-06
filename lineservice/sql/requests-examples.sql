-- stations in table haltestelle
select top 1 hid, bez, new ST_POINT('POINT('|| 13.412833  || ' '|| 52.541498 ||' )', 4326).ST_DISTANCE(pos) as distance from haltestelle order by distance asc
--only stations belonging to 'proper' lines (in table linie)
select top 1 hid, bez, new ST_POINT('POINT('|| 13.412833  || ' '|| 52.541498 ||' )', 4326).ST_DISTANCE(pos) as distance from haltestelle 
where hid in (select distinct(hid_a) from segment union select distinct(hid_b) from segment) order by distance asc

