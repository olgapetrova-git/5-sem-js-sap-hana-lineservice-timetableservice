
drop type path_tt;

create type path_tt as 
    table (lid integer, bez_line varchar,  hid_a integer, hid_b integer, bez_a varchar, bez_b varchar, laenge integer);

drop procedure shortest_path;

create or replace procedure shortest_path(
  in s integer, in t integer, out path_table path_tt)
  language graph
  reads sql data
as
begin
  Graph g = Graph("LINESERVICE");
	Vertex sv = Vertex(:g, :s);
	Vertex tv = Vertex(:g, :t);
	WeightedPath<BIGINT> p = SHORTEST_PATH(:g, :sv, :tv);
  path_table = select :e.lid, :e.bez_line, :e.hid_a, :e.hid_b, :e.bez_a, :e.bez_b, :e.laenge
    foreach e in Edges(:p);
end;

drop procedure shortest_distance;

create or replace procedure shortest_distance(
  in s integer, in t integer, out path_table path_tt)
  language graph
  reads sql data
as
begin
  Graph g = Graph("LINESERVICE");
	Vertex sv = Vertex(:g, :s);
	Vertex tv = Vertex(:g, :t);
	WeightedPath<INT> p = SHORTEST_PATH(:g, :sv, :tv, (Edge conn) => INTEGER { return :conn.laenge; });
  path_table = select :e.lid, :e.bez_line, :e.hid_a, :e.hid_b, :e.bez_a, :e.bez_b, :e.laenge
    foreach e in Edges(:p);
end;