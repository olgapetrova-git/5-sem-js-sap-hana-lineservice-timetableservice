create or replace view abschnitt_view 
as select a.lid*1000+a.nr as aid, 
a.lid as lid,
l.bez as bez_line,
s.hid_a as hid_a, 
s.hid_b as hid_b, 
h_a.bez as bez_a,
h_b.bez as bez_b,
h_a.lng as lng_a,
h_a.lat as lat_a,
h_b.lng as lng_b,
h_b.lat as lat_b,
a.nr as nr, 
s.laenge_in_meter as laenge  
from abschnitt a join segment s on a.sid = s.sid
join haltestelle h_a on s.hid_a = h_a.hid
join haltestelle h_b on s.hid_b = h_b.hid
join linie l on a.lid=l.lid

select * from abschnitt_view


