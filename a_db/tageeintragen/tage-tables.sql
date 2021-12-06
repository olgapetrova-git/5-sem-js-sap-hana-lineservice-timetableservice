drop table tag;

create table tag (TagNr integer primary key, Datum date);

delete from tag;
select * from tag;


create or replace procedure erzeuge_tage(p_anzahl integer) as
begin
  declare v_tagnr integer;
  declare v_datum date;
  declare v_i integer;
  
  select max(TagNr), max(Datum) into v_tagnr, v_datum from tag;
  
  if :v_tagnr is null then
    v_tagnr = 0;
    v_datum = add_days(current_date, -1);
  end if;
  
  for v_i in 1..:p_anzahl do
    insert into tag values(v_tagnr + v_i, add_days(v_datum, v_i));
  end for;
end;