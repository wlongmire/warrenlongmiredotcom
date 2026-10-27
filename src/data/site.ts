// Site-wide details. The values live in site.json so they can also be edited from the /edit page.
//   links          a link with an empty url is not shown (so no dead links ship)
//   contactEndpoint where the contact form sends messages (a form-to-email service address, e.g. Formspree).
//                   While it is empty, "Send" opens the visitor's email app instead. Not editable from /edit.
//   contactReasons the choices in the contact form's dropdown
import data from './site.json';

export const site = data as {
  name: string;
  email: string;
  links: { label: string; url: string }[];
  contactEndpoint: string;
  contactReasons: string[];
};
