function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="legal-section">
      <h2>{title}</h2>
      <div className="legal-body">{children}</div>
    </div>
  );
}

export function PrivacyPageContent() {
  return (
    <>
      <section className="page-hero page-hero--brand page-hero--compact">
        <div className="cla-wrap page-hero-inner">
          <h1>Privacy policy</h1>
          <p>Cornerstone &amp; Luthien Advisory (CLA) Privacy Policy</p>
        </div>
      </section>
      <section className="page-section">
        <div className="cla-wrap legal-content">
          <LegalSection title="Who we are">
            <p>Our website address is: <a href="https://cla-rw.com" target="_blank" rel="noopener noreferrer">https://cla-rw.com</a>.</p>
          </LegalSection>
          <LegalSection title="Comments">
            <p>When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor&apos;s IP address and browser user agent string to help spam detection.</p>
            <p>An anonymised string created from your email address may be provided to the Gravatar service. After approval of your comment, your profile picture is visible to the public in the context of your comment.</p>
          </LegalSection>
          <LegalSection title="Media">
            <p>If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included.</p>
          </LegalSection>
          <LegalSection title="Cookies">
            <p>If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These cookies will last for one year.</p>
            <p>When you log in, we will set up cookies to save your login information and your screen display choices.</p>
          </LegalSection>
          <LegalSection title="Embedded content from other websites">
            <p>Articles on this site may include embedded content from other websites. Embedded content behaves as if the visitor has visited the other website.</p>
          </LegalSection>
          <LegalSection title="Who we share your data with">
            <p>If you request a password reset, your IP address will be included in the reset email.</p>
          </LegalSection>
          <LegalSection title="How long we retain your data">
            <p>For users that register on our website, we store the personal information they provide in their user profile. Website administrators can also see and edit that information.</p>
          </LegalSection>
          <LegalSection title="What rights you have over your data">
            <p>You can request to receive an exported file of the personal data we hold about you, or request that we erase any personal data we hold about you.</p>
          </LegalSection>
          <LegalSection title="Where your data is sent">
            <p>Visitor comments may be checked through an automated spam detection service.</p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}

export function TermsPageContent() {
  return (
    <>
      <section className="page-hero page-hero--brand page-hero--compact">
        <div className="cla-wrap page-hero-inner">
          <h1>Terms &amp; conditions</h1>
          <p>Cornerstone &amp; Luthien Advisory (CLA) Website Policy, Terms &amp; Conditions</p>
        </div>
      </section>
      <section className="page-section">
        <div className="cla-wrap legal-content">
          <p className="legal-intro">
            These Terms and Conditions govern your use of the CLA Learning platform and the website at{" "}
            <a href="https://cla-rw.com" target="_blank" rel="noopener noreferrer">cla-rw.com</a>, operated by Cornerstone &amp; Luthien Advisory Ltd.
          </p>
          <LegalSection title="1. Use of this website">
            <p>By accessing and using this website and the CLA Learning platform, you accept and agree to be bound by these Terms and Conditions and all applicable laws and regulations of the Republic of Rwanda.</p>
          </LegalSection>
          <LegalSection title="2. Intellectual property">
            <p>All content on this website and platform is the intellectual property of Cornerstone &amp; Luthien Advisory Ltd or its licensed content providers.</p>
          </LegalSection>
          <LegalSection title="3. Course enrolment">
            <p>To access paid courses, you must register for an account using a valid email address. Access is personal to the registered user and may not be shared.</p>
          </LegalSection>
          <LegalSection title="4. Payment terms">
            <p>Course fees are displayed at the point of enrolment in Rwandan Francs (RWF) unless otherwise stated. Refund requests must be submitted to{" "}
              <a href="mailto:info@cornerstoneluthien.com">info@cornerstoneluthien.com</a> within 7 days of enrolment.
            </p>
          </LegalSection>
          <LegalSection title="5. User conduct">
            <ul>
              <li>Do not share your account credentials with any third party</li>
              <li>Do not attempt to gain unauthorised access to any part of the platform</li>
              <li>Do not use automated tools to scrape or copy platform content</li>
            </ul>
          </LegalSection>
          <LegalSection title="6. Limitation of liability">
            <p>To the fullest extent permitted by law, CLA shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or platform.</p>
          </LegalSection>
          <LegalSection title="7. Third-party links">
            <p>This website may contain links to third-party websites. We accept no responsibility for their content.</p>
          </LegalSection>
          <LegalSection title="8. Amendments">
            <p>CLA reserves the right to update or revise these Terms and Conditions at any time.</p>
          </LegalSection>
          <LegalSection title="9. Governing law">
            <p>These Terms are governed by the laws of the Republic of Rwanda.</p>
          </LegalSection>
          <LegalSection title="10. Contact information">
            <p><strong>Cornerstone &amp; Luthien Advisory Ltd</strong></p>
            <p>Near National Institute of Statistics of Rwanda, KN 2 Ave, Kigali, Rwanda</p>
            <p>Email: <a href="mailto:info@cornerstoneluthien.com">info@cornerstoneluthien.com</a></p>
            <p>Phone: <a href="tel:+250789924490">+250 789 924 490</a></p>
          </LegalSection>
          <p className="legal-updated">Last updated: April 2026</p>
        </div>
      </section>
    </>
  );
}
