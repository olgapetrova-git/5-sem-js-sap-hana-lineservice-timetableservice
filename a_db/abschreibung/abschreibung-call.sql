 
call _sys_afl.aflbfl_dbdepreciation_proc (
  Kapitalisierung, 
  Abschreibungsrate, 
  PeriodeOderJahr, 
  Kapitalisierungstyp, 
  AnzahlPerioden, 
  Abschreibung) with overview;
 
select * from Abschreibung;
 

