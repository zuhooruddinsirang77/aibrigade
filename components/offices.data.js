/**
 * The three offices — one list for every place the site names them: the
 * footer's "where we are" band, the contact page, and the postal address
 * the legal pages print (components/legal.data.js). Change an address
 * here and it changes everywhere.
 *
 *   city     the heading — and the place the footer's local clock is for
 *   country  the country, in full
 *   role     what happens there
 *   tz       IANA time zone for the footer's live clock
 *   address  the street address, one entry per printed line
 */
export const OFFICES = [
  {
    id: "us",
    city: "Perth Amboy",
    country: "United States",
    role: "Headquarters",
    tz: "America/New_York",
    address: ["370 Federal Court", "Perth Amboy, NJ 08861, USA"],
  },
  {
    id: "ae",
    city: "Dubai",
    country: "United Arab Emirates",
    role: "Middle East delivery",
    tz: "Asia/Dubai",
    address: ["912, 9th Floor, YES Business Tower", "Al Barsha Road, Al Barsha 1, Dubai"],
  },
  {
    id: "pk",
    city: "Islamabad",
    country: "Pakistan",
    role: "Engineering",
    tz: "Asia/Karachi",
    address: [
      "Corporate and Business Square, 1st/2nd Floor",
      "Wazir Arcade, Park Ave, Block C",
      "Gulberg Greens, Islamabad 44000",
    ],
  },
];

/** The address on one line, e.g. for a postal line in running text. */
export const fullAddress = (o) => o.address.join(", ");

/** A map search for the address — opens the office in Google Maps. The
 *  country is appended because two of the three addresses don't end in
 *  one. */
export const mapUrl = (o) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${fullAddress(o)}, ${o.country}`
  )}`;

export const HEADQUARTERS = OFFICES[0];
