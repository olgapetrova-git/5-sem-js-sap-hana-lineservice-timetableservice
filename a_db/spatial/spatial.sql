-------------------------------------------------------------------------------
-- Spatial
-------------------------------------------------------------------------------
select NEW ST_POINT(0,0).ST_asWKT() FROM DUMMY;
select NEW ST_POINT('POINT (0 0)').ST_asWKT() FROM DUMMY;


select NEW ST_POINT(0,0).ST_X() FROM DUMMY;
select NEW ST_POINT(0,0).ST_DIMENSION() FROM DUMMY;

SELECT NEW ST_LineString('LineString (0 0, 4 3)').ST_Dimension() FROM dummy;
SELECT NEW ST_LineString('LineString (0 0, 4 3)').ST_Length() FROM dummy;

SELECT NEW ST_LineString('LineString (0 0, 3 4, 0 4, 0 0)').ST_asSVG() as SVG FROM dummy;



