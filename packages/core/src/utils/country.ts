// List of Alpha-2 country codes to display in the drop down for phone number entry in our pre-built UI components.
//
// This list contains all allowed country codes, in alphabetical order, with the exception of the US, which is placed first as it is
// the default and our most common user country.
//
// This list was built by pulling all countries from https://www.iban.com/country-codes and then removing countries that are not on our
// unsupported countries (https://app.launchdarkly.com/default/production/features/default-banned-countries-for-phone-validation/targeting).
//
// Other useful links are the IBAN Alpha-2 code list (https://www.iban.com/country-codes) and Twilio's per-country notes
// (https://www.twilio.com/en-us/guidelines/ag/sms). Just substitute the country code in that URL!
//
// This list is served to any customer, regardless of whether they are on the default country allowlist (only US and Canada) or they allow
// all countries. This means that users may be able to choose a country that is not allowed for a customer and receive an error. This should
// be improved in the future: ODEVX-34.

export const COUNTRIES_LIST = {
  US: '1', // United States of America
  AX: '358', // Aland Islands
  AS: '1684', // American Samoa
  AG: '1268', // Antigua and Barbuda
  AI: '1264', // Anguilla
  AR: '54', // Argentina
  AT: '43', // Austria
  AU: '61', // Australia
  BE: '32', // Belgium
  BJ: '229', // Benin
  BO: '591', // Bolivia
  BR: '55', // Brazil
  IO: '246', // British Indian Ocean Territory (the)
  BN: '673', // Brunei Darussalam
  BG: '359', // Bulgaria
  BF: '226', // Burkina Faso
  CM: '237', // Cameroon
  CA: '1', // Canada
  BQ: '599', // Caribbean Netherlands
  CF: '236', // Central African Republic (the)
  CL: '56', // Chile
  CX: '61', // Christmas Island
  CC: '61', // Cocos (Keeling) Islands (the)
  CO: '57', // Colombia
  CD: '243', // Congo (the Democratic Republic of the)
  CK: '682', // Cook Islands (the)
  CR: '506', // Costa Rica
  HR: '385', // Croatia
  CZ: '420', // Czechia
  DK: '45', // Denmark
  DO: '1829', // Dominican Republic (the)
  EC: '593', // Ecuador
  SV: '503', // El Salvador
  EE: '372', // Estonia
  SZ: '268', // Eswatini
  FK: '500', // Falkland Islands (the) [Malvinas]
  FI: '358', // Finland
  FR: '33', // France
  GF: '594', // French Guiana
  DE: '49', // Germany
  GH: '233', // Ghana
  GR: '30', // Greece
  GD: '1473', // Grenada
  GT: '502', // Guatemala
  GG: '44', // Guernsey
  GW: '245', // Guinea-Bissau
  GY: '592', // Guyana
  HU: '36', // Hungary
  IS: '354', // Iceland
  IN: '91', // India
  IE: '353', // Ireland
  IM: '44', // Isle of Man
  IT: '39', // Italy
  JM: '1876', // Jamaica
  JP: '81', // Japan
  KZ: '7', // Kazakhstan
  KE: '254', // Kenya
  KI: '686', // Kiribati
  KR: '82', // Korea (the Republic of)
  LV: '371', // Latvia
  LT: '370', // Lithuania
  LU: '352', // Luxembourg
  MO: '853', // Macao
  MT: '356', // Malta
  MH: '692', // Marshall Islands (the)
  MR: '222', // Mauritania
  MU: '230', // Mauritius
  YT: '262', // Mayotte
  MX: '52', // Mexico
  MC: '377', // Monaco
  ME: '382', // Montenegro
  NR: '674', // Nauru
  NL: '31', // Netherlands (the)
  NZ: '64', // New Zealand
  NI: '505', // Nicaragua
  NF: '672', // Norfolk Island
  NO: '47', // Norway
  PA: '507', // Panama
  PY: '595', // Paraguay
  PE: '51', // Peru
  PN: '870', // Pitcairn
  PL: '48', // Poland
  PT: '351', // Portugal
  PR: '1', // Puerto Rico
  RO: '40', // Romania
  BL: '590', // Saint Barthélemy
  SH: '290', // Saint Helena, Ascension and Tristan da Cunha
  KN: '1869', // Saint Kitts and Nevis
  LC: '1758', // Saint Lucia
  MF: '590', // Saint Martin (French part)
  PM: '508', // Saint Pierre and Miquelon
  SM: '378', // San Marino
  ST: '239', // Sao Tome and Principe
  SC: '248', // Seychelles
  SX: '599', // Sint Maarten (Dutch part)
  SK: '421', // Slovakia
  SI: '386', // Slovenia
  ZA: '27', // South Africa
  SS: '211', // South Sudan
  ES: '34', // Spain
  SR: '597', // Suriname
  SJ: '47', // Svalbard and Jan Mayen
  SE: '46', // Sweden
  CH: '41', // Switzerland
  TW: '886', // Taiwan
  TZ: '255', // Tanzania, United Republic of
  TK: '690', // Tokelau
  TO: '676', // Tonga
  TT: '1868', // Trinidad and Tobago
  TR: '90', // Turkey
  UA: '380', // Ukraine
  GB: '44', // United Kingdom of Great Britain and Northern Ireland (the)
  UM: '1', // United States Minor Outlying Islands (the)
  UY: '598', // Uruguay
  VA: '379', // Vatican
  EH: '212', // Western Sahara
} as const;

export type CountryCode = keyof typeof COUNTRIES_LIST;
