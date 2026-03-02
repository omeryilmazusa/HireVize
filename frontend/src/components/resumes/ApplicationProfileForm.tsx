"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ───────────── types ───────────── */

interface Phone {
  type: string;
  number: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phones: Phone[];
  linkedin_url: string | null;
  portfolio_url: string | null;
  addresses: Address[];
  candidate_answers: Record<string, string>;
  eeo: Record<string, string>;
  veteran_status: Record<string, string>;
  disability_status: Record<string, string>;
}

/* ───────────── constants ───────────── */

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const PHONE_TYPES = ["Mobile", "Home", "Work"];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to disclose",
];

const RACE_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Two or More Races",
  "Prefer not to disclose",
];

/* ───────────── helpers ───────────── */

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

const selectClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

const labelClass = "mb-1 block text-sm font-medium text-gray-700";

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-gray-200 px-6 py-5">{children}</div>}
    </section>
  );
}

/* ───────────── main component ───────────── */

export function ApplicationProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Section 1 – Application Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phones, setPhones] = useState<Phone[]>([{ type: "Mobile", number: "" }]);
  const [addresses, setAddresses] = useState<Address[]>([{ street: "", city: "", state: "", zip: "" }]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Section 2 – Candidate Questions
  const [requiresSponsorship, setRequiresSponsorship] = useState("");
  const [is18OrOlder, setIs18OrOlder] = useState("");
  const [previouslyWorked, setPreviouslyWorked] = useState("");
  const [hasRelatives, setHasRelatives] = useState("");
  const [relativesDetails, setRelativesDetails] = useState("");

  // Section 3 – EEO
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");

  // Section 4 – Veteran
  const [veteranStatusVal, setVeteranStatusVal] = useState("");
  const [veteranSignature, setVeteranSignature] = useState(false);

  // Section 5 – Disability
  const [disabilityStatusVal, setDisabilityStatusVal] = useState("");

  /* ─── load ─── */
  useEffect(() => {
    api
      .get<Profile>("/api/v1/profile")
      .then((data) => {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setPhones(data.phones?.length ? data.phones : [{ type: "Mobile", number: "" }]);
        setAddresses(
          data.addresses?.length
            ? data.addresses.map((a) => ({
                street: a.street || "",
                city: a.city || "",
                state: a.state || "",
                zip: a.zip || "",
              }))
            : [{ street: "", city: "", state: "", zip: "" }]
        );
        setLinkedinUrl(data.linkedin_url || "");
        setPortfolioUrl(data.portfolio_url || "");

        const ca = data.candidate_answers || {};
        setRequiresSponsorship(ca.requires_sponsorship || "");
        setIs18OrOlder(ca.is_18_or_older || "");
        setPreviouslyWorked(ca.previously_worked_at_company || "");
        setHasRelatives(ca.has_relatives_at_company || "");
        setRelativesDetails(ca.relatives_details || "");

        const eeo = data.eeo || {};
        setGender(eeo.gender || "");
        setRace(eeo.race || "");

        const vs = data.veteran_status || {};
        setVeteranStatusVal(vs.status || "");
        setVeteranSignature(vs.signature_consent === "true");

        const ds = data.disability_status || {};
        setDisabilityStatusVal(ds.status || "");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ─── save ─── */
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.put("/api/v1/profile", {
        first_name: firstName,
        last_name: lastName,
        email,
        phones: phones.filter((p) => p.number.trim()),
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        addresses: addresses.filter((a) => a.street.trim() || a.city.trim() || a.state.trim()),
        candidate_answers: {
          requires_sponsorship: requiresSponsorship,
          is_18_or_older: is18OrOlder,
          previously_worked_at_company: previouslyWorked,
          has_relatives_at_company: hasRelatives,
          relatives_details: relativesDetails,
        },
        eeo: { gender, race },
        veteran_status: {
          status: veteranStatusVal,
          signature_consent: String(veteranSignature),
        },
        disability_status: { status: disabilityStatusVal },
      });
      setMessage("Application profile saved successfully.");
    } catch (err) {
      console.error("Save failed:", err);
      setMessage("Failed to save application profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── phone helpers ─── */
  const addPhone = () => setPhones([...phones, { type: "Mobile", number: "" }]);
  const removePhone = (i: number) => setPhones(phones.filter((_, idx) => idx !== i));
  const updatePhone = (i: number, field: keyof Phone, val: string) => {
    const next = [...phones];
    next[i] = { ...next[i], [field]: val };
    setPhones(next);
  };

  /* ─── address helpers ─── */
  const addAddress = () => setAddresses([...addresses, { street: "", city: "", state: "", zip: "" }]);
  const removeAddress = (i: number) => setAddresses(addresses.filter((_, idx) => idx !== i));
  const updateAddress = (i: number, field: keyof Address, val: string) => {
    const next = [...addresses];
    next[i] = { ...next[i], [field]: val };
    setAddresses(next);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Application Profile</h2>
      <p className="text-sm text-gray-500">
        Fill out the information below once. It will be used to auto-fill job applications.
      </p>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.includes("Failed")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* ── Section 1: Application Info ── */}
      <CollapsibleSection title="Application Info" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Phones */}
        <div className="mt-4">
          <label className={labelClass}>Phone Numbers</label>
          {phones.map((p, i) => (
            <div key={i} className="mt-2 flex items-center gap-2">
              <select
                value={p.type}
                onChange={(e) => updatePhone(i, "type", e.target.value)}
                className="w-20 shrink-0 rounded-lg border border-gray-300 px-2 py-2 text-xs bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {PHONE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                value={p.number}
                onChange={(e) => updatePhone(i, "number", e.target.value)}
                placeholder="(555) 555-5555"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {phones.length > 1 && (
                <button type="button" onClick={() => removePhone(i)} className="text-red-500 hover:text-red-700 text-sm shrink-0">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPhone} className="mt-2 text-sm text-primary-600 hover:text-primary-700">
            + Add phone
          </button>
        </div>

        {/* Addresses */}
        <div className="mt-4">
          <label className={labelClass}>Addresses</label>
          {addresses.map((a, i) => (
            <div key={i} className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Street Address</label>
                  <input
                    value={a.street}
                    onChange={(e) => updateAddress(i, "street", e.target.value)}
                    placeholder="123 Main St, Apt 4B"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">City</label>
                  <input
                    value={a.city}
                    onChange={(e) => updateAddress(i, "city", e.target.value)}
                    placeholder="City"
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">State</label>
                    <select
                      value={a.state}
                      onChange={(e) => updateAddress(i, "state", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">State</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28 shrink-0">
                    <label className="mb-1 block text-xs font-medium text-gray-500">ZIP</label>
                    <input
                      value={a.zip}
                      onChange={(e) => updateAddress(i, "zip", e.target.value)}
                      placeholder="12345"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
              {addresses.length > 1 && (
                <button type="button" onClick={() => removeAddress(i)} className="mt-2 text-red-500 hover:text-red-700 text-xs">
                  Remove address
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAddress} className="mt-2 text-sm text-primary-600 hover:text-primary-700">
            + Add address
          </button>
        </div>

        {/* LinkedIn / Portfolio */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Portfolio URL</label>
            <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Section 2: Candidate Questions ── */}
      <CollapsibleSection title="Candidate Questions">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              Will you now or in the future require sponsorship for employment visa status?
            </label>
            <select value={requiresSponsorship} onChange={(e) => setRequiresSponsorship(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Are you at least 18 years of age?</label>
            <select value={is18OrOlder} onChange={(e) => setIs18OrOlder(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Have you previously worked at this company?</label>
            <select value={previouslyWorked} onChange={(e) => setPreviouslyWorked(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Do you have any relatives working at this company?</label>
            <select value={hasRelatives} onChange={(e) => setHasRelatives(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          {hasRelatives === "yes" && (
            <div>
              <label className={labelClass}>If yes, please provide details</label>
              <textarea
                value={relativesDetails}
                onChange={(e) => setRelativesDetails(e.target.value)}
                rows={3}
                placeholder="Name, relationship, department..."
                className={inputClass}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ── Section 3: Voluntary EEO Information ── */}
      <CollapsibleSection title="Voluntary EEO Information">
        <p className="mb-4 text-sm text-gray-500">
          The employer is subject to certain governmental recordkeeping and reporting requirements
          for the administration of civil rights laws and regulations. In order to comply, the
          employer invites employees and applicants to voluntarily self-identify their race/ethnicity
          and gender. Submission of this information is voluntary and refusal to provide it will not
          subject you to any adverse treatment. The information will be kept confidential and may
          only be used in accordance with applicable laws, executive orders, and regulations.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Race / Ethnicity</label>
            <select value={race} onChange={(e) => setRace(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              {RACE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Section 4: Veteran Self-Identification ── */}
      <CollapsibleSection title="Veteran Self-Identification">
        <p className="mb-4 text-sm text-gray-500">
          This employer is a Government contractor subject to the Vietnam Era Veterans&apos;
          Readjustment Assistance Act of 1974 (VEVRAA). VEVRAA requires Government contractors to
          take affirmative action to employ and advance in employment protected veterans. To comply,
          we invite you to voluntarily self-identify your veteran status.
        </p>
        <div className="space-y-2">
          {[
            { value: "protected_veteran", label: "I identify as one or more of the classifications of a protected veteran" },
            { value: "not_a_veteran", label: "I am not a protected veteran" },
            { value: "prefer_not_to_answer", label: "I prefer not to answer" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="veteran_status"
                value={opt.value}
                checked={veteranStatusVal === opt.value}
                onChange={(e) => setVeteranStatusVal(e.target.value)}
                className="mt-0.5"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={veteranSignature}
            onChange={(e) => setVeteranSignature(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I consent to the use of my electronic signature for this self-identification form.
          </span>
        </label>
      </CollapsibleSection>

      {/* ── Section 5: Voluntary Self-Identification of Disability ── */}
      <CollapsibleSection title="Voluntary Self-Identification of Disability">
        <p className="mb-4 text-sm text-gray-500">
          OMB Control Number 1250-0005 &mdash; This employer is a Government contractor subject to
          Section 503 of the Rehabilitation Act of 1973. We are required to take affirmative action
          to employ and advance in employment individuals with disabilities. To help us measure the
          effectiveness of our outreach and recruitment efforts, we are asking you to tell us if you
          have a disability or if you have ever had a disability. Completing this form is voluntary,
          and we hope that you will choose to do so. Your answer will be maintained confidentially.
        </p>
        <div className="space-y-2">
          {[
            { value: "yes", label: "Yes, I have a disability (or previously had a disability)" },
            { value: "no", label: "No, I do not have a disability" },
            { value: "prefer_not_to_answer", label: "I prefer not to answer" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="disability_status"
                value={opt.value}
                checked={disabilityStatusVal === opt.value}
                onChange={(e) => setDisabilityStatusVal(e.target.value)}
                className="mt-0.5"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Save All ── */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>
    </div>
  );
}
