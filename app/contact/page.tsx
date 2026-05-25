'use client';

import { useState } from 'react';

const contactDetails = [
  {
    label: "Address",
    value: "84 Meridian Ave, Suite 200\nCity, State 12345",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "(555) 123-4567",
    href: "tel:5551234567",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
      </svg>
    ),
  },
  {
    label: "Email",
    value: "info@sunriserealty.com",
    href: "mailto:info@sunriserealty.com",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    label: "Hours",
    value: "Mon–Fri: 9AM – 6PM\nSat: 10AM – 4PM\nSun: Closed",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .contact-page {
          min-height: 100vh;
          background-color: #F7F5F0;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          color: #1A1814;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 7rem 2.5rem 6rem;
        }

        /* ── Header ── */
        .contact-header {
          margin-bottom: 5rem;
        }

        .contact-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8A8070;
          margin-bottom: 1.1rem;
        }

        .contact-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2.6rem, 4.5vw, 3.8rem);
          line-height: 1.08;
          color: #1A1814;
          margin: 0 0 1.25rem;
          letter-spacing: -0.01em;
        }

        .contact-headline em {
          font-style: italic;
          color: #5C5040;
        }

        .contact-subhead {
          font-size: 0.95rem;
          line-height: 1.8;
          color: #6E6455;
          max-width: 420px;
        }

        /* ── Layout ── */
        .contact-body {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 5rem;
          align-items: start;
        }

        /* ── Info column ── */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .contact-info-item {
          display: flex;
          gap: 1.1rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid #E0DAD0;
        }
        .contact-info-item:first-child { border-top: 1px solid #E0DAD0; }

        .contact-info-icon {
          color: #B0A890;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .contact-info-label {
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B0A890;
          margin-bottom: 0.35rem;
        }

        .contact-info-value {
          font-size: 0.9rem;
          line-height: 1.7;
          color: #3A3428;
          white-space: pre-line;
        }

        a.contact-info-value {
          text-decoration: none;
          transition: color 0.2s;
        }
        a.contact-info-value:hover { color: #1A1814; }

        /* ── Form card ── */
        .contact-form-card {
          background: #FFFFFF;
          border: 1px solid #E0DAD0;
          padding: 3rem;
        }

        .contact-form-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 1.6rem;
          color: #1A1814;
          margin: 0 0 2rem;
          letter-spacing: 0.01em;
        }

        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .contact-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .contact-field-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-label {
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8A8070;
        }

        .contact-input,
        .contact-textarea,
        .contact-select {
          background: #F7F5F0;
          border: 1px solid #E0DAD0;
          border-radius: 0;
          padding: 0.85rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.9rem;
          color: #1A1814;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
        }

        .contact-input::placeholder,
        .contact-textarea::placeholder {
          color: #C0B8A8;
        }

        .contact-input:focus,
        .contact-textarea:focus,
        .contact-select:focus {
          border-color: #8A8070;
          background: #FFFFFF;
        }

        .contact-textarea {
          resize: none;
          min-height: 130px;
        }

        .contact-submit {
          width: 100%;
          background: #1A1814;
          color: #F7F5F0;
          border: none;
          padding: 1rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s;
          margin-top: 0.5rem;
        }
        .contact-submit:hover { background: #3A3428; }

        /* ── Success ── */
        .contact-success {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #F0EDE6;
          border: 1px solid #D8D0C0;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: #5C5040;
        }

        .contact-success-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8A8070;
          flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .contact-body { grid-template-columns: 1fr; gap: 3rem; }
          .contact-form-card { padding: 2rem; }
          .contact-form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-container">

          {/* Header */}
          <div className="contact-header">
            <p className="contact-eyebrow">Sunrise Realty · Get in Touch</p>
            <h1 className="contact-headline">
              Let's find your<br /><em>next chapter.</em>
            </h1>
            <p className="contact-subhead">
              Whether you're buying, selling, or simply exploring — our team is here to guide you with clarity and care.
            </p>
          </div>

          <div className="contact-body">

            {/* Info */}
            <div className="contact-info">
              {contactDetails.map((item) => (
                <div className="contact-info-item" key={item.label}>
                  <span className="contact-info-icon">{item.icon}</span>
                  <div>
                    <p className="contact-info-label">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="contact-info-value">{item.value}</a>
                    ) : (
                      <p className="contact-info-value">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="contact-form-card">
              <h2 className="contact-form-heading">Send a message</h2>

              {submitted && (
                <div className="contact-success">
                  <span className="contact-success-dot" />
                  Thank you — we'll be in touch shortly.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="contact-field-row">
                    <label htmlFor="name" className="contact-label">Full Name</label>
                    <input
                      className="contact-input"
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Jane Smith"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-field-row">
                    <label htmlFor="phone" className="contact-label">Phone</label>
                    <input
                      className="contact-input"
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="email" className="contact-label">Email Address</label>
                  <input
                    className="contact-input"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message" className="contact-label">Message</label>
                  <textarea
                    className="contact-textarea"
                    id="message"
                    name="message"
                    placeholder="Tell us about the property you're looking for, or how we can help…"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="contact-submit">
                  Send Message →
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}