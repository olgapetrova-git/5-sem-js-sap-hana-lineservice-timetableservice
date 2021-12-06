
drop type path_tt;

create type path_tt as 
    table (laenge integer, hid_a integer, hid_b integer, lid integer, lat_a decimal, lng_a decimal, lat_b decimal, lng_b decimal);

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
  path_table = select :e.laenge, :e.hid_a, :e.hid_b, :e.lid, :e.lat_a, :e.lng_a, :e.lat_b, :e.lng_b
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
  path_table = select :e.laenge, :e.hid_a, :e.hid_b, :e.lid, :e.lat_a, :e.lng_a, :e.lat_b, :e.lng_b 
    foreach e in Edges(:p);
end;