INSERT INTO public."Discipline" ("id", "name", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Fútbol', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Discipline" WHERE upper("name") = upper('Fútbol')
);

INSERT INTO public."Discipline" ("id", "name", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Básquetbol', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Discipline" WHERE upper("name") = upper('Básquetbol')
);

INSERT INTO public."Discipline" ("id", "name", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Vóleibol', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Discipline" WHERE upper("name") = upper('Vóleibol')
);

INSERT INTO public."Discipline" ("id", "name", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Balonmano', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Discipline" WHERE upper("name") = upper('Balonmano')
);

INSERT INTO public."Category" ("id", "name", "gender", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Sub-14', 'Mixto', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Category"
  WHERE upper("name") = upper('Sub-14')
    AND upper("gender") = upper('Mixto')
);

INSERT INTO public."Category" ("id", "name", "gender", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Sub-17', 'Mixto', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Category"
  WHERE upper("name") = upper('Sub-17')
    AND upper("gender") = upper('Mixto')
);

INSERT INTO public."Category" ("id", "name", "gender", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'Sub-18', 'Mixto', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Category"
  WHERE upper("name") = upper('Sub-18')
    AND upper("gender") = upper('Mixto')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'BRITISH COLLEGE L.T.D.', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('BRITISH COLLEGE L.T.D.')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO ALERCE', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO ALERCE')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO AMERICANO', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO AMERICANO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO ANGOSTURA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO ANGOSTURA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO ARRAYANES', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO ARRAYANES')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO CHIMBARONGO', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO CHIMBARONGO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO CHRISTIAN COLLEGE', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO CHRISTIAN COLLEGE')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO HERMANO DE ASIS', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO HERMANO DE ASIS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO INMACULADA CONCEPCION', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO INMACULADA CONCEPCION')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO NANCAGUA SCHOOL', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO NANCAGUA SCHOOL')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO PART. SUBV. SAN ESTEBAN', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO PART. SUBV. SAN ESTEBAN')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO PARTIC, SAN JOSE DE LA MONTANA', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO PARTIC, SAN JOSE DE LA MONTANA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO PARTICULAR EL PRINCIPITO', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO PARTICULAR EL PRINCIPITO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO PARTICULAR EL REAL', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO PARTICULAR EL REAL')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO PARTICULAR LOMAS BLANCAS', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO PARTICULAR LOMAS BLANCAS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO SAN NICOLAS', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO SAN NICOLAS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO UMBRALES', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO UMBRALES')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO VALLE DE COLCHAGUA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO VALLE DE COLCHAGUA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COMPLEJO EDUCACIONAL LAS ARAUCARIAS', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COMPLEJO EDUCACIONAL LAS ARAUCARIAS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA AGRÍCOLA DON GREGORIO', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA AGRÍCOLA DON GREGORIO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA AGRÍCOLA LAS GARZAS', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA AGRÍCOLA LAS GARZAS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA MELECIA TOCORNAL', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA MELECIA TOCORNAL')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'FUNDACION EDUCACIONAL INSTITUTO SAN FERNANDO', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('FUNDACION EDUCACIONAL INSTITUTO SAN FERNANDO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'INSTITUTO HANS CHRISTIAN ANDERSEN', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('INSTITUTO HANS CHRISTIAN ANDERSEN')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO CARDENAL RAÚL SILVA HENRIQUEZ', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO CARDENAL RAÚL SILVA HENRIQUEZ')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO JOSÉ GREGORIO ARGOMEDO', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO JOSÉ GREGORIO ARGOMEDO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'SAN FERNANDO COLLEGE', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('SAN FERNANDO COLLEGE')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'CENTRO PARVULARIO', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('CENTRO PARVULARIO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ALTO MIRAFLORES E-456', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ALTO MIRAFLORES E-456')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA CODEGUA F-451', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA CODEGUA F-451')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA CUESTA LO GONZÁLEZ', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA CUESTA LO GONZÁLEZ')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA DE PEOR ES NADA F-449', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA DE PEOR ES NADA F-449')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ESPECIAL AYUDANDO A CRECER', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ESPECIAL AYUDANDO A CRECER')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA FERNANDO ARENAS ALMARZA', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA FERNANDO ARENAS ALMARZA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA HUEMUL G-488', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA HUEMUL G-488')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA JOSÉ MIGUEL CARRERA VERDUGO', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA JOSÉ MIGUEL CARRERA VERDUGO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA LA VILLA CONVENTO VIEJO', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA LA VILLA CONVENTO VIEJO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA LAS MERCEDES G-507 LAS PALMERAS', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA LAS MERCEDES G-507 LAS PALMERAS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA MUNICIPAL EL PEREJIL', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA MUNICIPAL EL PEREJIL')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA PEDRO ETCHEVERRY', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA PEDRO ETCHEVERRY')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ROMERAL F-455', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ROMERAL F-455')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA SAN JOSÉ LO TORO G-453', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA SAN JOSÉ LO TORO G-453')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA SANTA EUGENIA', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA SANTA EUGENIA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA SANTA ISABEL G-503', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA SANTA ISABEL G-503')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA SANTA VALENTINA F-452', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA SANTA VALENTINA F-452')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA TINGUIRIRICA ALTO F-411', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA TINGUIRIRICA ALTO F-411')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA TINGUIRIRICA BARRIO ESTACIÓN G-414', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA TINGUIRIRICA BARRIO ESTACIÓN G-414')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA TINGUIRIRICA LAS QUEZADAS F-413', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA TINGUIRIRICA LAS QUEZADAS F-413')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'JARDIN ARCOIRIS', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('JARDIN ARCOIRIS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'JARDIN BAMBI', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('JARDIN BAMBI')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'JARDIN INFANTIL NUESTRA SEÑORA DE LA MERCED', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('JARDIN INFANTIL NUESTRA SEÑORA DE LA MERCED')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'JARDIN INFANTIL SAN JOSE', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('JARDIN INFANTIL SAN JOSE')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO COMPLEJO EDUCACIONAL DE CHIMBARONGO', 'CHIMBARONGO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO COMPLEJO EDUCACIONAL DE CHIMBARONGO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO BASICO CONSOLIDADO', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO BASICO CONSOLIDADO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO SAN GREGORIO', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO SAN GREGORIO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ADRIANA LYON VIAL', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ADRIANA LYON VIAL')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA BÁSICA PUQUILLAY', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA BÁSICA PUQUILLAY')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA CUNACO', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA CUNACO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA IGNACIO CARRERA PINTO', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA IGNACIO CARRERA PINTO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA YAQUIL', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA YAQUIL')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO JUAN PABLO II', 'NANCAGUA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO JUAN PABLO II')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA  DANY GERMÁN GONZÁLEZ SOTO', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA  DANY GERMÁN GONZÁLEZ SOTO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA  SAN LUIS DE MANANTIALES', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA  SAN LUIS DE MANANTIALES')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA EL AMANECER DE LO MOSCOSO', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA EL AMANECER DE LO MOSCOSO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA LA DEHESA', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA LA DEHESA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA LA TUNA', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA LA TUNA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA RAÚL CÁCERES PACHECO', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA RAÚL CÁCERES PACHECO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'JARDIN INFANTIL Y SALA CUNA LOS PAMPANITOS', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('JARDIN INFANTIL Y SALA CUNA LOS PAMPANITOS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO SAN FRANCISCO', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO SAN FRANCISCO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'SALA CUNA GOTITAS DE AMOR', 'PLACILLA', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('SALA CUNA GOTITAS DE AMOR')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO HERMANO FERNANDO DE LA FUENTE', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO HERMANO FERNANDO DE LA FUENTE')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'COLEGIO ISABEL LA CATÓLICA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('COLEGIO ISABEL LA CATÓLICA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ABEL BOUCHON FAURE', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ABEL BOUCHON FAURE')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ABRAHAM LINCOLN', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ABRAHAM LINCOLN')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA ANTONIO LARA MEDINA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA ANTONIO LARA MEDINA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA BASICA PEDRO MORALES BARRERA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA BASICA PEDRO MORALES BARRERA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA BERNARDO MORENO FREDES', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA BERNARDO MORENO FREDES')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA GASPAR MARÍN', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA GASPAR MARÍN')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA GIUSEPPE BORTOLUZZI DE FELIP', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA GIUSEPPE BORTOLUZZI DE FELIP')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA JORGE MUÑOZ SILVA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA JORGE MUÑOZ SILVA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA JOSÉ DE SAN MARTÍN', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA JOSÉ DE SAN MARTÍN')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA MARÍA LUISA BOUCHON', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA MARÍA LUISA BOUCHON')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA OLEGARIO LAZO BAEZA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA OLEGARIO LAZO BAEZA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA SAN JOSÉ DE LOS LINGUES', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA SAN JOSÉ DE LOS LINGUES')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA SERGIO VERDUGO HERRERA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA SERGIO VERDUGO HERRERA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA VILLA CENTINELA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA VILLA CENTINELA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'ESCUELA WASHINGTON VENEGAS OLIVA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('ESCUELA WASHINGTON VENEGAS OLIVA')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'JARDIN INFANTIL WINNIE THE POOH', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('JARDIN INFANTIL WINNIE THE POOH')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO COMERCIAL ALBERTO VALENZUELA LLANOS', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO COMERCIAL ALBERTO VALENZUELA LLANOS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO EDUARDO CHARME FERNANDEZ', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO EDUARDO CHARME FERNANDEZ')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO HERIBERTO SOTO SOTO', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO HERIBERTO SOTO SOTO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'LICEO NEANDRO SCHILLING CAMPOS', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('LICEO NEANDRO SCHILLING CAMPOS')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'MUNDO FELIZ', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('MUNDO FELIZ')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'SALA CUNA ANGELITO', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('SALA CUNA ANGELITO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'SALA CUNA CARACOLITO', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('SALA CUNA CARACOLITO')
);

INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), 'SALA CUNA RAYITO DE LUNA', 'SAN FERNANDO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('SALA CUNA RAYITO DE LUNA')
);

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('BRITISH COLLEGE L.T.D.')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO ALERCE')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO AMERICANO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO ANGOSTURA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO ARRAYANES')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO CHIMBARONGO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO CHRISTIAN COLLEGE')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO HERMANO DE ASIS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO INMACULADA CONCEPCION')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO NANCAGUA SCHOOL')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO PART. SUBV. SAN ESTEBAN')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO PARTIC, SAN JOSE DE LA MONTANA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO PARTICULAR EL PRINCIPITO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO PARTICULAR EL REAL')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO PARTICULAR LOMAS BLANCAS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO SAN NICOLAS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO UMBRALES')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO VALLE DE COLCHAGUA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COMPLEJO EDUCACIONAL LAS ARAUCARIAS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA AGRÍCOLA DON GREGORIO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA AGRÍCOLA LAS GARZAS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA MELECIA TOCORNAL')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('FUNDACION EDUCACIONAL INSTITUTO SAN FERNANDO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('INSTITUTO HANS CHRISTIAN ANDERSEN')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO CARDENAL RAÚL SILVA HENRIQUEZ')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO JOSÉ GREGORIO ARGOMEDO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('SAN FERNANDO COLLEGE')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('CENTRO PARVULARIO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ALTO MIRAFLORES E-456')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA CODEGUA F-451')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA CUESTA LO GONZÁLEZ')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA DE PEOR ES NADA F-449')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ESPECIAL AYUDANDO A CRECER')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA FERNANDO ARENAS ALMARZA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA HUEMUL G-488')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA JOSÉ MIGUEL CARRERA VERDUGO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA LA VILLA CONVENTO VIEJO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA LAS MERCEDES G-507 LAS PALMERAS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA MUNICIPAL EL PEREJIL')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA PEDRO ETCHEVERRY')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ROMERAL F-455')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA SAN JOSÉ LO TORO G-453')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA SANTA EUGENIA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA SANTA ISABEL G-503')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA SANTA VALENTINA F-452')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA TINGUIRIRICA ALTO F-411')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA TINGUIRIRICA BARRIO ESTACIÓN G-414')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA TINGUIRIRICA LAS QUEZADAS F-413')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('JARDIN ARCOIRIS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('JARDIN BAMBI')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('JARDIN INFANTIL NUESTRA SEÑORA DE LA MERCED')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('JARDIN INFANTIL SAN JOSE')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO COMPLEJO EDUCACIONAL DE CHIMBARONGO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO BASICO CONSOLIDADO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO SAN GREGORIO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ADRIANA LYON VIAL')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA BÁSICA PUQUILLAY')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA CUNACO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA IGNACIO CARRERA PINTO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA YAQUIL')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO JUAN PABLO II')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA  DANY GERMÁN GONZÁLEZ SOTO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA  SAN LUIS DE MANANTIALES')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA EL AMANECER DE LO MOSCOSO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA LA DEHESA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA LA TUNA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA RAÚL CÁCERES PACHECO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('JARDIN INFANTIL Y SALA CUNA LOS PAMPANITOS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO SAN FRANCISCO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('SALA CUNA GOTITAS DE AMOR')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO HERMANO FERNANDO DE LA FUENTE')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('COLEGIO ISABEL LA CATÓLICA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ABEL BOUCHON FAURE')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ABRAHAM LINCOLN')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA ANTONIO LARA MEDINA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA BASICA PEDRO MORALES BARRERA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA BERNARDO MORENO FREDES')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA GASPAR MARÍN')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA GIUSEPPE BORTOLUZZI DE FELIP')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA JORGE MUÑOZ SILVA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA JOSÉ DE SAN MARTÍN')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA MARÍA LUISA BOUCHON')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA OLEGARIO LAZO BAEZA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA SAN JOSÉ DE LOS LINGUES')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA SERGIO VERDUGO HERRERA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA VILLA CENTINELA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('ESCUELA WASHINGTON VENEGAS OLIVA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('JARDIN INFANTIL WINNIE THE POOH')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO COMERCIAL ALBERTO VALENZUELA LLANOS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO EDUARDO CHARME FERNANDEZ')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO HERIBERTO SOTO SOTO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('LICEO NEANDRO SCHILLING CAMPOS')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('MUNDO FELIZ')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('SALA CUNA ANGELITO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('SALA CUNA CARACOLITO')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('SALA CUNA RAYITO DE LUNA')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );

SELECT COUNT(*) AS establishments_total FROM public."Establishment";
SELECT COUNT(*) AS teams_total FROM public."Team";
SELECT COUNT(*) AS disciplines_total FROM public."Discipline";
SELECT COUNT(*) AS categories_total FROM public."Category";
