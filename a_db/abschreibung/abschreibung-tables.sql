drop table Kapitalisierung;
drop table Abschreibungsrate;
drop table PeriodeOderJahr;
drop table Kapitalisierungstyp;
drop table AnzahlPerioden;
drop table Abschreibung;

create column table Kapitalisierung (value double);
create column table Abschreibungsrate (value double);
create column table PeriodeOderJahr (value double); -- Periode(0) oder Jahr(1)
create column table Kapitalisierungstyp (value double); -- Periode(0) oder Jahr(1)
create column table AnzahlPerioden (value double);
create column table Abschreibung (valueindex double, dep_value double);

insert into Kapitalisierung values (100000);
insert into Kapitalisierung values (50000);
insert into Abschreibungsrate values (0.1);
insert into PeriodeOderJahr values (0);
insert into Kapitalisierungstyp values (0);
insert into AnzahlPerioden values (5);
 
   