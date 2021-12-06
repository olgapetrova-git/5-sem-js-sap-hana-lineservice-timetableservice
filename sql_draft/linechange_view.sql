create or replace view line_view 
as select l.lid, ha.hid from linie l
join abschnitt a on l.lid=a.lid
join segment s on s.sid=a.sid
join haltestelle ha on s.hid_a=ha.hid
union select l.lid, hb.hid from linie l
join abschnitt a on l.lid=a.lid
join segment s on s.sid=a.sid
join haltestelle hb on s.hid_b=hb.hid
order by l.lid 

create or replace view linechange_view
as select to_int(sysuuid) as id, l1.lid as l1_lid, l2.lid as l2_lid
from line_view l1
join line_view l2 on l1.hid=l2.hid
where l1.lid <> l2.lid

drop graph workspace line_graph;

create graph workspace line_graph
  edge table linechange_view
    source column l1_lid
    target column l2_lid
    key column id
  vertex table linie
    key column lid