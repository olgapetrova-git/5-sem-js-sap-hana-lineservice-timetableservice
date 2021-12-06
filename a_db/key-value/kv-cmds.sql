select * from kv;

drop procedure erzeuge_kvs;
create or replace procedure erzeuge_kvs() as
begin
  declare v_maxkey integer;
  select max(key) into v_maxkey from kv;
  insert into kv values(v_maxkey + 1, concat('value', v_maxkey+1));
  insert into kv values(v_maxkey + 2, concat('value', v_maxkey+2));
end;

call erzeuge_kvs();