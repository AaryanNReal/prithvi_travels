import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact/contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Free Next.js Template for Startup and SaaS",
  description: "This is Contact Page for Startup Nextjs Template",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Page"
        description="Contact Us for any Questions."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
