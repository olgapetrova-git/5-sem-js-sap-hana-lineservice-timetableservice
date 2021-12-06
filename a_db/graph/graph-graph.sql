drop graph workspace dummy_graph;

create graph workspace dummy_graph
  edge table verbindung
    source column ka
    target column kb
    key column vid
  vertex table knoten
    key column kid
;

drop type path_tt;

create type path_tt as 
  table (dauer int, ka integer, kb integer, pfad varchar(10));

drop procedure shortest_path;

create or replace procedure shortest_path(
  in s integer, in t integer, out path_table path_tt)
  language graph
  reads sql data
as
begin
  Graph g = Graph("DUMMY_GRAPH");
	Vertex sv = Vertex(:g, :s);
	Vertex tv = Vertex(:g, :t);
	WeightedPath<BIGINT> p = SHORTEST_PATH(:g, :sv, :tv);
  path_table = select :e.dauer, :e.ka, :e.kb, :e.pfad 
    foreach e in Edges(:p);
end

call shortest_path(101, 107, ?);