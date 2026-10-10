import type { ContinentId, Country } from "../game/types";

/**
 * Base de países soberanos com gabarito consensual.
 * Ficam de fora casos com capital disputada ou em transferência (Israel/Palestina, Taiwan,
 * Kosovo, Nauru, Guiné Equatorial) para não ensinar resposta controversa.
 * Moeda/idiomas são omitidos quando há transição recente ou ausência de idioma oficial de jure.
 */
type Extra = Pick<Country, "transcontinental" | "note">;

function c(
  code: string,
  name: string,
  capital: string,
  continent: ContinentId,
  currency: string | null,
  languages: readonly string[] | null,
  extra: Extra = {},
): Country {
  return {
    code,
    name,
    capital,
    continent,
    ...(currency ? { currency } : {}),
    ...(languages ? { languages } : {}),
    ...extra,
  };
}

const ES = ["Espanhol"] as const;
const EN = ["Inglês"] as const;
const FR = ["Francês"] as const;
const PT = ["Português"] as const;
const AR = ["Árabe"] as const;

const BASE_COUNTRIES: readonly Country[] = [
  // ── América do Sul ──────────────────────────────────────────
  c("br", "Brasil", "Brasília", "america-sul", "Real", PT),
  c("ar", "Argentina", "Buenos Aires", "america-sul", "Peso argentino", ES),
  c("cl", "Chile", "Santiago", "america-sul", "Peso chileno", ES),
  c("uy", "Uruguai", "Montevidéu", "america-sul", "Peso uruguaio", ES),
  c("py", "Paraguai", "Assunção", "america-sul", "Guarani", ["Espanhol", "Guarani"]),
  c("bo", "Bolívia", "Sucre", "america-sul", "Boliviano", ["Espanhol", "Quíchua", "Aimará", "Guarani"], {
    note: "Sucre é a capital constitucional; La Paz é a sede do governo.",
  }),
  c("pe", "Peru", "Lima", "america-sul", "Sol", ["Espanhol", "Quíchua", "Aimará"]),
  c("ec", "Equador", "Quito", "america-sul", "Dólar americano", ES),
  c("co", "Colômbia", "Bogotá", "america-sul", "Peso colombiano", ES),
  c("ve", "Venezuela", "Caracas", "america-sul", "Bolívar", ES),
  c("gy", "Guiana", "Georgetown", "america-sul", "Dólar guianense", EN),
  c("sr", "Suriname", "Paramaribo", "america-sul", "Dólar surinamês", ["Neerlandês"]),

  // ── América do Norte ────────────────────────────────────────
  c("ca", "Canadá", "Ottawa", "america-norte", "Dólar canadense", ["Inglês", "Francês"]),
  c("us", "Estados Unidos", "Washington, D.C.", "america-norte", "Dólar americano", EN),
  c("mx", "México", "Cidade do México", "america-norte", "Peso mexicano", ES),

  // ── América Central e Caribe ────────────────────────────────
  c("gt", "Guatemala", "Cidade da Guatemala", "america-central", "Quetzal", ES),
  c("bz", "Belize", "Belmopã", "america-central", "Dólar de Belize", EN),
  c("hn", "Honduras", "Tegucigalpa", "america-central", "Lempira", ES),
  c("sv", "El Salvador", "San Salvador", "america-central", "Dólar americano", ES),
  c("ni", "Nicarágua", "Manágua", "america-central", "Córdoba", ES),
  c("cr", "Costa Rica", "San José", "america-central", "Colón costarriquenho", ES),
  c("pa", "Panamá", "Cidade do Panamá", "america-central", "Balboa", ES),
  c("cu", "Cuba", "Havana", "america-central", "Peso cubano", ES),
  c("jm", "Jamaica", "Kingston", "america-central", "Dólar jamaicano", EN),
  c("ht", "Haiti", "Porto Príncipe", "america-central", "Gourde", ["Francês", "Crioulo haitiano"]),
  c("do", "República Dominicana", "Santo Domingo", "america-central", "Peso dominicano", ES),
  c("bs", "Bahamas", "Nassau", "america-central", "Dólar bahamense", EN),
  c("tt", "Trinidad e Tobago", "Port of Spain", "america-central", "Dólar de Trinidad e Tobago", EN),
  c("bb", "Barbados", "Bridgetown", "america-central", "Dólar barbadiano", EN),

  // ── Europa ──────────────────────────────────────────────────
  c("pt", "Portugal", "Lisboa", "europa", "Euro", PT),
  c("es", "Espanha", "Madri", "europa", "Euro", ES),
  c("fr", "França", "Paris", "europa", "Euro", FR),
  c("de", "Alemanha", "Berlim", "europa", "Euro", ["Alemão"]),
  c("it", "Itália", "Roma", "europa", "Euro", ["Italiano"]),
  c("gb", "Reino Unido", "Londres", "europa", "Libra esterlina", EN),
  c("ie", "Irlanda", "Dublin", "europa", "Euro", ["Irlandês", "Inglês"]),
  c("nl", "Países Baixos", "Amsterdã", "europa", "Euro", ["Neerlandês"], {
    note: "Amsterdã é a capital constitucional; o governo fica em Haia.",
  }),
  c("be", "Bélgica", "Bruxelas", "europa", "Euro", ["Neerlandês", "Francês", "Alemão"]),
  c("lu", "Luxemburgo", "Luxemburgo", "europa", "Euro", ["Luxemburguês", "Francês", "Alemão"]),
  c("ch", "Suíça", "Berna", "europa", "Franco suíço", ["Alemão", "Francês", "Italiano", "Romanche"], {
    note: "Oficialmente, Berna é a \"cidade federal\" da Suíça.",
  }),
  c("at", "Áustria", "Viena", "europa", "Euro", ["Alemão"]),
  c("pl", "Polônia", "Varsóvia", "europa", "Złoty", ["Polonês"]),
  c("cz", "Tchéquia", "Praga", "europa", "Coroa tcheca", ["Tcheco"]),
  c("sk", "Eslováquia", "Bratislava", "europa", "Euro", ["Eslovaco"]),
  c("hu", "Hungria", "Budapeste", "europa", "Florim", ["Húngaro"]),
  c("ro", "Romênia", "Bucareste", "europa", "Leu romeno", ["Romeno"]),
  c("bg", "Bulgária", "Sófia", "europa", "Euro", ["Búlgaro"]), // euro desde 01/01/2026
  c("gr", "Grécia", "Atenas", "europa", "Euro", ["Grego"]),
  c("hr", "Croácia", "Zagreb", "europa", "Euro", ["Croata"]),
  c("si", "Eslovênia", "Liubliana", "europa", "Euro", ["Esloveno"]),
  c("rs", "Sérvia", "Belgrado", "europa", "Dinar sérvio", ["Sérvio"]),
  c("ba", "Bósnia e Herzegovina", "Sarajevo", "europa", "Marco conversível", ["Bósnio", "Croata", "Sérvio"]),
  c("me", "Montenegro", "Podgorica", "europa", "Euro", ["Montenegrino"]),
  c("mk", "Macedônia do Norte", "Escópia", "europa", "Denar", ["Macedônio", "Albanês"]),
  c("al", "Albânia", "Tirana", "europa", "Lek", ["Albanês"]),
  c("se", "Suécia", "Estocolmo", "europa", "Coroa sueca", ["Sueco"]),
  c("no", "Noruega", "Oslo", "europa", "Coroa norueguesa", ["Norueguês"]),
  c("dk", "Dinamarca", "Copenhague", "europa", "Coroa dinamarquesa", ["Dinamarquês"]),
  c("fi", "Finlândia", "Helsinque", "europa", "Euro", ["Finlandês", "Sueco"]),
  c("is", "Islândia", "Reykjavík", "europa", "Coroa islandesa", ["Islandês"]),
  c("ee", "Estônia", "Tallinn", "europa", "Euro", ["Estoniano"]),
  c("lv", "Letônia", "Riga", "europa", "Euro", ["Letão"]),
  c("lt", "Lituânia", "Vilnius", "europa", "Euro", ["Lituano"]),
  c("ua", "Ucrânia", "Kiev", "europa", "Hryvnia", ["Ucraniano"]),
  c("by", "Belarus", "Minsk", "europa", "Rublo bielorrusso", ["Bielorrusso", "Russo"]),
  c("md", "Moldávia", "Chisinau", "europa", "Leu moldávio", ["Romeno"]),
  c("ru", "Rússia", "Moscou", "europa", "Rublo russo", ["Russo"], { transcontinental: true }),
  c("mt", "Malta", "Valeta", "europa", "Euro", ["Maltês", "Inglês"]),
  c("cy", "Chipre", "Nicósia", "europa", "Euro", ["Grego", "Turco"], { transcontinental: true }),
  c("mc", "Mônaco", "Mônaco", "europa", "Euro", FR),
  c("ad", "Andorra", "Andorra-a-Velha", "europa", "Euro", ["Catalão"]),
  c("va", "Vaticano", "Cidade do Vaticano", "europa", "Euro", ["Italiano", "Latim"]),
  c("sm", "San Marino", "San Marino", "europa", "Euro", ["Italiano"]),
  c("li", "Liechtenstein", "Vaduz", "europa", "Franco suíço", ["Alemão"]),

  // ── Ásia ────────────────────────────────────────────────────
  c("cn", "China", "Pequim", "asia", "Yuan", ["Mandarim"]),
  c("jp", "Japão", "Tóquio", "asia", "Iene", ["Japonês"]),
  c("kr", "Coreia do Sul", "Seul", "asia", "Won sul-coreano", ["Coreano"]),
  c("kp", "Coreia do Norte", "Pyongyang", "asia", "Won norte-coreano", ["Coreano"]),
  c("mn", "Mongólia", "Ulan Bator", "asia", "Tugrik", ["Mongol"]),
  c("in", "Índia", "Nova Délhi", "asia", "Rupia indiana", ["Hindi", "Inglês"]),
  c("pk", "Paquistão", "Islamabad", "asia", "Rupia paquistanesa", ["Urdu", "Inglês"]),
  c("bd", "Bangladesh", "Daca", "asia", "Taka", ["Bengali"]),
  c("np", "Nepal", "Katmandu", "asia", "Rupia nepalesa", ["Nepali"]),
  c("bt", "Butão", "Timbu", "asia", "Ngultrum", ["Dzongkha"]),
  c("lk", "Sri Lanka", "Sri Jayawardenepura Kotte", "asia", "Rupia cingalesa", ["Cingalês", "Tâmil"], {
    note: "Colombo é a maior cidade e capital comercial.",
  }),
  c("mv", "Maldivas", "Malé", "asia", "Rupia maldívia", ["Divehi"]),
  c("af", "Afeganistão", "Cabul", "asia", "Afegane", ["Pashto", "Dari"]),
  c("ir", "Irã", "Teerã", "asia", "Rial iraniano", ["Persa"]),
  c("iq", "Iraque", "Bagdá", "asia", "Dinar iraquiano", ["Árabe", "Curdo"]),
  c("sa", "Arábia Saudita", "Riad", "asia", "Riyal saudita", AR),
  c("ae", "Emirados Árabes Unidos", "Abu Dhabi", "asia", "Dirham dos Emirados", AR),
  c("qa", "Catar", "Doha", "asia", "Riyal catariano", AR),
  c("kw", "Kuwait", "Cidade do Kuwait", "asia", "Dinar kuwaitiano", AR),
  c("bh", "Bahrein", "Manama", "asia", "Dinar bareinita", AR),
  c("om", "Omã", "Mascate", "asia", "Rial omanense", AR),
  c("ye", "Iêmen", "Sanaã", "asia", "Rial iemenita", AR, {
    note: "Sanaã é a capital constitucional; o governo reconhecido opera a partir de Áden.",
  }),
  c("jo", "Jordânia", "Amã", "asia", "Dinar jordaniano", AR),
  c("sy", "Síria", "Damasco", "asia", "Libra síria", AR),
  c("lb", "Líbano", "Beirute", "asia", "Libra libanesa", AR),
  c("tr", "Turquia", "Ancara", "asia", "Lira turca", ["Turco"], { transcontinental: true }),
  c("ge", "Geórgia", "Tbilisi", "asia", "Lari", ["Georgiano"], { transcontinental: true }),
  c("am", "Armênia", "Erevã", "asia", "Dram", ["Armênio"], { transcontinental: true }),
  c("az", "Azerbaijão", "Baku", "asia", "Manat azeri", ["Azeri"], { transcontinental: true }),
  c("kz", "Cazaquistão", "Astana", "asia", "Tenge", ["Cazaque", "Russo"], { transcontinental: true }),
  c("uz", "Uzbequistão", "Tashkent", "asia", "Som uzbeque", ["Uzbeque"]),
  c("tm", "Turcomenistão", "Asgabate", "asia", "Manat turcomeno", ["Turcomeno"]),
  c("kg", "Quirguistão", "Bishkek", "asia", "Som quirguiz", ["Quirguiz", "Russo"]),
  c("tj", "Tajiquistão", "Duchambé", "asia", "Somoni", ["Tajique"]),
  c("th", "Tailândia", "Bangkok", "asia", "Baht", ["Tailandês"]),
  c("vn", "Vietnã", "Hanói", "asia", "Dong", ["Vietnamita"]),
  c("kh", "Camboja", "Phnom Penh", "asia", "Riel", ["Khmer"]),
  c("la", "Laos", "Vientiane", "asia", "Kip", ["Laosiano"]),
  c("mm", "Mianmar", "Naypyidaw", "asia", "Kyat", ["Birmanês"]),
  c("my", "Malásia", "Kuala Lumpur", "asia", "Ringgit", ["Malaio"]),
  c("sg", "Singapura", "Singapura", "asia", "Dólar de Singapura", ["Inglês", "Malaio", "Mandarim", "Tâmil"]),
  c("id", "Indonésia", "Jacarta", "asia", "Rupia indonésia", ["Indonésio"], {
    note: "A transferência da capital para Nusantara está em andamento.",
  }),
  c("ph", "Filipinas", "Manila", "asia", "Peso filipino", ["Filipino", "Inglês"]),
  c("tl", "Timor-Leste", "Díli", "asia", "Dólar americano", ["Tétum", "Português"]),
  c("bn", "Brunei", "Bandar Seri Begawan", "asia", "Dólar de Brunei", ["Malaio"]),

  // ── África ──────────────────────────────────────────────────
  c("eg", "Egito", "Cairo", "africa", "Libra egípcia", AR),
  c("ly", "Líbia", "Trípoli", "africa", "Dinar líbio", AR),
  c("tn", "Tunísia", "Túnis", "africa", "Dinar tunisiano", AR),
  c("dz", "Argélia", "Argel", "africa", "Dinar argelino", ["Árabe", "Berbere"]),
  c("ma", "Marrocos", "Rabat", "africa", "Dirham marroquino", ["Árabe", "Berbere"]),
  c("mr", "Mauritânia", "Nouakchott", "africa", "Uguia", AR),
  c("sd", "Sudão", "Cartum", "africa", "Libra sudanesa", ["Árabe", "Inglês"]),
  c("ss", "Sudão do Sul", "Juba", "africa", "Libra sul-sudanesa", EN),
  c("et", "Etiópia", "Adis Abeba", "africa", "Birr", ["Amárico"]),
  c("er", "Eritreia", "Asmara", "africa", "Nakfa", null),
  c("dj", "Djibuti", "Djibuti", "africa", "Franco djibutiano", ["Francês", "Árabe"]),
  c("so", "Somália", "Mogadíscio", "africa", "Xelim somali", ["Somali", "Árabe"]),
  c("ke", "Quênia", "Nairóbi", "africa", "Xelim queniano", ["Suaíli", "Inglês"]),
  c("tz", "Tanzânia", "Dodoma", "africa", "Xelim tanzaniano", ["Suaíli", "Inglês"]),
  c("ug", "Uganda", "Kampala", "africa", "Xelim ugandense", ["Inglês", "Suaíli"]),
  c("rw", "Ruanda", "Kigali", "africa", "Franco ruandês", ["Kinyarwanda", "Francês", "Inglês", "Suaíli"]),
  c("bi", "Burundi", "Gitega", "africa", "Franco burundiano", ["Kirundi", "Francês", "Inglês"]),
  c("cd", "República Democrática do Congo", "Kinshasa", "africa", "Franco congolês", FR),
  c("cg", "República do Congo", "Brazzaville", "africa", "Franco CFA", FR),
  c("cf", "República Centro-Africana", "Bangui", "africa", "Franco CFA", ["Francês", "Sango"]),
  c("ga", "Gabão", "Libreville", "africa", "Franco CFA", FR),
  c("cm", "Camarões", "Iaundé", "africa", "Franco CFA", ["Francês", "Inglês"]),
  c("td", "Chade", "N'Djamena", "africa", "Franco CFA", ["Francês", "Árabe"]),
  c("ng", "Nigéria", "Abuja", "africa", "Naira", EN),
  c("ne", "Níger", "Niamey", "africa", "Franco CFA", null),
  c("ml", "Mali", "Bamako", "africa", "Franco CFA", null),
  c("bf", "Burkina Faso", "Uagadugu", "africa", "Franco CFA", null),
  c("gh", "Gana", "Acra", "africa", "Cedi", EN),
  c("ci", "Costa do Marfim", "Yamoussoukro", "africa", "Franco CFA", FR, {
    note: "Abidjan é a maior cidade e centro econômico.",
  }),
  c("sn", "Senegal", "Dakar", "africa", "Franco CFA", FR),
  c("gm", "Gâmbia", "Banjul", "africa", "Dalasi", EN),
  c("gn", "Guiné", "Conacri", "africa", "Franco guineano", FR),
  c("gw", "Guiné-Bissau", "Bissau", "africa", "Franco CFA", PT),
  c("sl", "Serra Leoa", "Freetown", "africa", "Leone", EN),
  c("lr", "Libéria", "Monróvia", "africa", "Dólar liberiano", EN),
  c("tg", "Togo", "Lomé", "africa", "Franco CFA", FR),
  c("bj", "Benin", "Porto-Novo", "africa", "Franco CFA", FR, {
    note: "Porto-Novo é a capital oficial; Cotonou concentra a sede do governo.",
  }),
  c("cv", "Cabo Verde", "Praia", "africa", "Escudo cabo-verdiano", PT),
  c("st", "São Tomé e Príncipe", "São Tomé", "africa", "Dobra", PT),
  c("ao", "Angola", "Luanda", "africa", "Kwanza", PT),
  c("mz", "Moçambique", "Maputo", "africa", "Metical", PT),
  c("za", "África do Sul", "Pretória", "africa", "Rand", [
    "Zulu", "Xhosa", "Africâner", "Inglês", "Sesoto", "Sesoto do Norte", "Tswana",
    "Suázi", "Tsonga", "Venda", "Ndebele", "Língua de sinais sul-africana",
  ], {
    note: "Pretória é a capital executiva; Cidade do Cabo é a legislativa e Bloemfontein, a judiciária.",
  }),
  c("na", "Namíbia", "Windhoek", "africa", "Dólar namibiano", EN),
  c("bw", "Botsuana", "Gaborone", "africa", "Pula", ["Inglês", "Tswana"]),
  c("zw", "Zimbábue", "Harare", "africa", null, null),
  c("zm", "Zâmbia", "Lusaka", "africa", "Kwacha zambiano", EN),
  c("mw", "Malawi", "Lilongwe", "africa", "Kwacha malawiano", ["Inglês", "Chichewa"]),
  c("mg", "Madagascar", "Antananarivo", "africa", "Ariary", ["Malgaxe", "Francês"]),
  c("mu", "Maurício", "Port Louis", "africa", "Rupia mauriciana", null),
  c("sc", "Seychelles", "Victoria", "africa", "Rupia seichelense", ["Crioulo seichelense", "Inglês", "Francês"]),
  c("km", "Comores", "Moroni", "africa", "Franco comoriano", ["Comoriano", "Francês", "Árabe"]),
  c("ls", "Lesoto", "Maseru", "africa", "Loti", ["Sesoto", "Inglês"]),
  c("sz", "Essuatíni", "Mbabane", "africa", "Lilangeni", ["Suázi", "Inglês"], {
    note: "Mbabane é a capital administrativa; Lobamba é a capital real e legislativa.",
  }),

  // ── Oceania ─────────────────────────────────────────────────
  c("au", "Austrália", "Camberra", "oceania", "Dólar australiano", EN),
  c("nz", "Nova Zelândia", "Wellington", "oceania", "Dólar neozelandês", ["Inglês", "Maori"]),
  c("pg", "Papua-Nova Guiné", "Port Moresby", "oceania", "Kina", ["Inglês", "Tok Pisin", "Hiri Motu"]),
  c("fj", "Fiji", "Suva", "oceania", "Dólar fijiano", ["Inglês", "Fijiano", "Hindi fijiano"]),
  c("ws", "Samoa", "Ápia", "oceania", "Tala", ["Samoano", "Inglês"]),
  c("to", "Tonga", "Nucualofa", "oceania", "Paʻanga", ["Tonganês", "Inglês"]),
  c("vu", "Vanuatu", "Port Vila", "oceania", "Vatu", ["Bislama", "Inglês", "Francês"]),
  c("sb", "Ilhas Salomão", "Honiara", "oceania", "Dólar das Ilhas Salomão", EN),
  c("ki", "Kiribati", "Tarawa do Sul", "oceania", "Dólar australiano", ["Inglês", "Gilbertês"]),
  c("fm", "Micronésia", "Paliquir", "oceania", "Dólar americano", EN),
  c("mh", "Ilhas Marshall", "Majuro", "oceania", "Dólar americano", ["Marshalês", "Inglês"]),
  c("pw", "Palau", "Ngerulmud", "oceania", "Dólar americano", ["Palauano", "Inglês"]),
  c("tv", "Tuvalu", "Funafuti", "oceania", "Dólar australiano", ["Tuvaluano", "Inglês"]),
];

/** Idiomas com uso oficial regional/reconhecido que tornariam um distrator também correto. */
const REGIONAL_LANGUAGES: Readonly<Record<string, readonly string[]>> = {
  ar: ["Guarani"],
  br: ["Guarani"],
  ec: ["Quíchua"],
  us: ["Espanhol"],
  es: ["Catalão"],
  it: ["Alemão", "Francês", "Esloveno"],
  at: ["Croata", "Esloveno", "Húngaro"],
  de: ["Dinamarquês"],
  dk: ["Alemão"],
  se: ["Finlandês"],
  gb: ["Irlandês"],
  pl: ["Alemão", "Lituano", "Bielorrusso"],
  cz: ["Eslovaco", "Polonês", "Alemão"],
  sk: ["Húngaro", "Tcheco"],
  hu: ["Alemão", "Croata", "Eslovaco", "Romeno", "Sérvio", "Esloveno"],
  hr: ["Italiano", "Sérvio", "Húngaro"],
  si: ["Italiano", "Húngaro"],
  ro: ["Húngaro", "Alemão"],
  rs: ["Húngaro", "Eslovaco", "Romeno", "Croata", "Albanês", "Bósnio"],
  me: ["Sérvio", "Bósnio", "Albanês", "Croata"],
  md: ["Russo"],
  tj: ["Russo"],
  cn: ["Mongol"],
  in: ["Bengali", "Urdu", "Tâmil", "Nepali"],
  pk: ["Pashto"],
  af: ["Uzbeque", "Turcomeno"],
  ir: ["Árabe"],
  lb: ["Francês"],
  lk: ["Inglês"],
  my: ["Inglês"],
  bn: ["Inglês"],
  tl: ["Inglês", "Indonésio"],
  ly: ["Berbere"],
  et: ["Somali"],
  cd: ["Suaíli"],
  na: ["Africâner", "Alemão"],
};

/** Moedas estrangeiras com curso legal no país (união monetária ou paridade fixa). */
const OTHER_LEGAL_TENDER: Readonly<Record<string, readonly string[]>> = {
  pa: ["Dólar americano"],
  ls: ["Rand"],
  na: ["Rand"],
  sz: ["Rand"],
  bt: ["Rupia indiana"],
  bn: ["Dólar de Singapura"],
  sg: ["Dólar de Brunei"],
};

export const COUNTRIES: readonly Country[] = BASE_COUNTRIES.map((country) => {
  const regionalLanguages = REGIONAL_LANGUAGES[country.code];
  const otherLegalTender = OTHER_LEGAL_TENDER[country.code];
  return {
    ...country,
    ...(regionalLanguages ? { regionalLanguages } : {}),
    ...(otherLegalTender ? { otherLegalTender } : {}),
  };
});

export const COUNTRY_BY_CODE: ReadonlyMap<string, Country> = new Map(
  COUNTRIES.map((country) => [country.code, country]),
);
