// Site-wide details Warren can edit by hand. A link with an empty url is not shown.
export const site = {
  name: 'Warren C. Longmire',
  email: 'warrenlongmire@gmail.com',
  links: [
    // TODO: add the real profile URLs (kept empty so no dead or guessed links ship).
    { label: 'LinkedIn', url: '' },
    { label: 'GitHub', url: '' },
  ],
  // Where the contact form sends messages (a form-to-email service URL, e.g. a Formspree endpoint).
  // TODO: paste the endpoint here once the service is set up. While it is empty, "Send" opens the
  // visitor's email app with the message pre-filled instead.
  contactEndpoint: 'https://formspree.io/f/xjykljyb',
  // Choices in the contact form's "reason" dropdown.
  contactReasons: [
    'Hiring opportunity',
    'Instructional design or L&D project',
    'Technical Teaching or workshop',
    'Engineering or software project',
    'Design or UX project',
    'Speaking or collaboration',
    'Just saying hello',
  ],
};
