"use client";

import { useState } from "react";

export default function ContactPageContent() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`
    );
    const subject = encodeURIComponent(`Contact: ${form.subject || "New enquiry"} — from ${form.name}`);
    window.location.href = `mailto:info@cornerstoneluthien.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <>
      <section className="page-hero page-hero--brand page-hero--compact">
        <div className="cla-wrap page-hero-inner">
          <span className="mono eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>Get in touch</span>
          <h1>We&apos;re here to help</h1>
          <p>Reach Cornerstone &amp; Luthien Advisory via email, phone, or the contact form below.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="cla-wrap contact-grid">
          <div>
            <h2 style={{ marginBottom: 22 }}>Contact information</h2>
            <div className="contact-info-list">
              <div>
                <b>Address</b>
                <p>Near National Institute of Statistics of Rwanda,<br />KN 2 Ave, Kigali, Rwanda</p>
              </div>
              <div>
                <b>Phone / WhatsApp</b>
                <p><a href="tel:+250789924490">+250 789 924 490</a></p>
              </div>
              <div>
                <b>Email</b>
                <p><a href="mailto:info@cornerstoneluthien.com">info@cornerstoneluthien.com</a></p>
              </div>
            </div>

            <h3 style={{ fontSize: 14, margin: "28px 0 12px" }}>Follow us</h3>
            <div className="social-row">
              <a href="https://x.com/luthiencla" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://www.facebook.com/cornerstonerwanda/" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.linkedin.com/in/cornerstone-and-luthien-advisory-ltd-b1081b137/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/cornerstone_luthien/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>

            <div className="map-embed">
              <iframe
                title="CLA Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.6236987849574!2d30.056635!3d-1.941809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4229e8a7bb3%3A0xaa7fbdd1084920bc!2sCornerstone%20and%20Luthien%20Advisory%20Ltd!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: 22 }}>Send us a message</h2>
            {submitted ? (
              <div className="form-success">
                <h3>Message ready to send</h3>
                <p>Your email client should open with your message. If it didn&apos;t, email us directly at info@cornerstoneluthien.com.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label>
                    Full name *
                    <input required placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label>
                    Phone number
                    <input placeholder="+250 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </label>
                </div>
                <label>
                  Email *
                  <input required type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
                <label>
                  Subject
                  <input placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </label>
                <label>
                  Message *
                  <textarea required rows={5} placeholder="Tell us more…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </label>
                <button type="submit" className="cla-btn primary" style={{ width: "100%" }}>Send message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
