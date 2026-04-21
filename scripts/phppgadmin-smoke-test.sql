INSERT INTO public."Discipline" ("name")
VALUES ('Futbol');

INSERT INTO public."Category" ("name", "gender")
VALUES ('Sub-14', 'Mixto');

INSERT INTO public."Establishment" ("name", "comuna")
VALUES ('Colegio Prueba', 'San Fernando');

INSERT INTO public."Team" ("name", "establishmentId")
SELECT 'Colegio Prueba', e."id"
FROM public."Establishment" e
WHERE e."name" = 'Colegio Prueba'
LIMIT 1;

SELECT COUNT(*) AS disciplines_total FROM public."Discipline";
SELECT COUNT(*) AS categories_total FROM public."Category";
SELECT COUNT(*) AS establishments_total FROM public."Establishment";
SELECT COUNT(*) AS teams_total FROM public."Team";