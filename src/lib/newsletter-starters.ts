// Built-in starting points for the newsletter composer. Plain copy with no
// invented facts or stats: the author edits every line before sending.
// The featured-book, review and special blocks are added automatically by the
// email template, so these only supply the personal part of the message.

export interface NewsletterStarter {
  id:            string;
  name:          string;
  subject:       string;
  body:          string;
  includeBooks:  boolean;
  includeReview: boolean;
}

export const NEWSLETTER_STARTERS: NewsletterStarter[] = [
  {
    id: "starter-new-release",
    name: "New release",
    subject: "My new book is out now",
    body:
      "<p>Hello and thank you for being here,</p>" +
      "<p>I am thrilled to share that my new book is officially out. Tell readers in a sentence or two what it is about and who it is for.</p>" +
      "<p>Share one thing you love about this book, or a moment from writing it.</p>" +
      "<p>If you enjoy it, a short review means the world to an indie author.</p>" +
      "<p>Thank you for reading,</p>",
    includeBooks: true,
    includeReview: true,
  },
  {
    id: "starter-cover-reveal",
    name: "Cover reveal",
    subject: "Meet the cover of my next book",
    body:
      "<p>Hello,</p>" +
      "<p>The moment is here: you are among the first to see the cover of my next book.</p>" +
      "<p>Say what the cover captures about the story, and when readers can expect to read it.</p>" +
      "<p>I would love to hear what you think. Just hit reply.</p>" +
      "<p>Thank you,</p>",
    includeBooks: true,
    includeReview: false,
  },
  {
    id: "starter-sale",
    name: "Sale or special",
    subject: "A reader-only special, for a short time",
    body:
      "<p>Hello,</p>" +
      "<p>As a thank-you for being on my list, I am running a special. Say what it is and exactly when it ends.</p>" +
      "<p>Mention who it is perfect for, or which book to start with.</p>" +
      "<p>Thank you for your support,</p>",
    includeBooks: true,
    includeReview: true,
  },
  {
    id: "starter-monthly-update",
    name: "Monthly update",
    subject: "What I have been working on",
    body:
      "<p>Hello,</p>" +
      "<p><strong>What I am writing:</strong> a short progress note on your current project.</p>" +
      "<p><strong>What I am reading:</strong> one book you would recommend, and why.</p>" +
      "<p><strong>What is next:</strong> anything coming up, such as a release, an event or a giveaway.</p>" +
      "<p>Until next time,</p>",
    includeBooks: false,
    includeReview: false,
  },
  {
    id: "starter-behind-the-scenes",
    name: "Behind the scenes",
    subject: "A peek behind the pages",
    body:
      "<p>Hello,</p>" +
      "<p>I wanted to give you a look at how my stories come together.</p>" +
      "<p>Share a story about where an idea came from, a character who surprised you, or a place that inspired a scene.</p>" +
      "<p>If there is something you would like me to write about next, reply and tell me.</p>" +
      "<p>Warmly,</p>",
    includeBooks: false,
    includeReview: false,
  },
];
