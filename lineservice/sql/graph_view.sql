create or replace view graph_view 
as select a.lid*1000+a.nr as aid, 
a.lid as lid,
l.bez as bez_line,
s.hid_a as hid_a, 
s.hid_b as hid_b, 
h_a.bez as bez_a,
h_b.bez as bez_b,
a.nr as nr, 
s.laenge_in_meter as laenge  
from abschnitt a join segment s on a.sid = s.sid
join haltestelle h_a on s.hid_a = h_a.hid
join haltestelle h_b on s.hid_b = h_b.hid
join linie l on a.lid=l.lid
union
select a.lid*2000+a.nr as aid, 
a.lid as lid,
l.bez as bez_line,
s.hid_b as hid_a, 
s.hid_a as hid_b, 
h_b.bez as bez_a,
h_a.bez as bez_b,
a.nr as nr, 
s.laenge_in_meter as laenge  
from abschnitt a join segment s on a.sid = s.sid
join haltestelle h_a on s.hid_a = h_a.hid
join haltestelle h_b on s.hid_b = h_b.hid
join linie l on a.lid=l.lid

drop graph workspace lineservice

create graph workspace lineservice edge table graph_view 
source column hid_a target column hid_b key column aid vertex table haltestelle key column hid
