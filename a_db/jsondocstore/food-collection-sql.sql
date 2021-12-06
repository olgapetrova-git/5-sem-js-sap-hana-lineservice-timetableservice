
select *
from food_collection;

select "name", "group", "nutrients"
from food_collection;

select "name", "description"
from food_collection;

select "name", "group", "subgroup", "nutrients", "description" 
from food_collection;

select "name", "group", "subgroup", "nutrients", "description" 
from food_collection 
where "group" = 'Vegetables';

select "name" 
from food_collection 
where "nutrients"."Fat" > 10000;

select "group",   sum(to_double("nutrients"."Energy"))
from food_collection 
group by "group";

