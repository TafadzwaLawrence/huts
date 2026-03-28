import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts if using custom fonts (optional)
Font.register({
  family: 'Helvetica',
  src: 'http://example.com/fonts/Helvetica.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  subtitle: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 40,
  },
  date: {
    fontSize: 10,
    color: '#7c8288',
    textAlign: 'center',
    marginTop: 40,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 12,
    color: '#212529',
    borderBottomWidth: 2,
    borderBottomColor: '#e9ecef',
    paddingBottom: 8,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#212529',
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 1.5,
    color: '#212529',
  },
  bulletPoint: {
    marginLeft: 15,
    marginBottom: 8,
    lineHeight: 1.4,
    fontSize: 11,
    color: '#212529',
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#212529',
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 10,
    color: '#7c8288',
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  toc: {
    marginTop: 20,
    marginBottom: 20,
  },
  tocItem: {
    marginBottom: 8,
    fontSize: 11,
    color: '#0066cc',
  },
})

interface BuyingGuidePDFProps {
  buyerName?: string
}

export function BuyingGuidePDF({ buyerName = 'Friend' }: BuyingGuidePDFProps) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <View style={styles.logo}>HUTS</View>
        <View style={styles.title}>The Ultimate Guide to Buying Property in Zimbabwe</View>
        <View style={styles.subtitle}>Master the art of property buying with confidence</View>
        <View style={styles.date}>Published {today}</View>
      </Page>

      {/* TOC Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Table of Contents</Text>
        <View style={styles.toc}>
          <Text style={styles.tocItem}>. Chapter 1: The Buying Process (Offer to Transfer)</Text>
          <Text style={styles.tocItem}>. Chapter 2: Complete Cost Breakdown</Text>
          <Text style={styles.tocItem}>. Chapter 3: Red Flags & Common Pitfalls</Text>
          <Text style={styles.tocItem}>. Chapter 4: City-Specific Guides</Text>
          <Text style={styles.tocItem}>. Chapter 5: Legal Checklist & Next Steps</Text>
        </View>
      </Page>

      {/* Chapter 1: The Buying Process */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Chapter 1: The Buying Process</Text>
        <Text style={styles.paragraph}>Offer to Transfer in 5 Steps</Text>

        <Text style={styles.heading}>Step 1: Make an Offer</Text>
        <Text style={styles.bulletPoint}>• Research comparable sales in the area</Text>
        <Text style={styles.bulletPoint}>• Submit offer in writing through a real estate agent or directly to seller</Text>
        <Text style={styles.bulletPoint}>• Include earnest money deposit (5-10% typical in Zimbabwe)</Text>
        <Text style={styles.bulletPoint}>• Set conditions: financing contingency, inspection period (7-14 days typical)</Text>

        <Text style={styles.heading}>Step 2: Seller Accepts (Agreement of Sale)</Text>
        <Text style={styles.bulletPoint}>• Seller agrees to your terms or makes counter-offer</Text>
        <Text style={styles.bulletPoint}>• Once accepted, you have an Agreement of Sale (legally binding contract)</Text>
        <Text style={styles.bulletPoint}>• Earnest money is held in trust (can be forfeited if you breach contract)</Text>

        <Text style={styles.heading}>Step 3: Inspection & Finance Approval</Text>
        <Text style={styles.bulletPoint}>• Conduct property inspection (hire qualified inspector, ~USD 150-300)</Text>
        <Text style={styles.bulletPoint}>• Apply for mortgage pre-approval (if financing)</Text>
        <Text style={styles.bulletPoint}>• Verify title deed with conveyancer (NOT optional!)</Text>
        <Text style={styles.bulletPoint}>• Check municipal rates, ZESA, water, property taxes are paid</Text>

        <Text style={styles.heading}>Step 4: Transfer (Conveyancing)</Text>
        <Text style={styles.bulletPoint}>• Conveyancer prepares transfer documents</Text>
        <Text style={styles.bulletPoint}>• Log transfer at Deeds Registry (application submitted)</Text>
        <Text style={styles.bulletPoint}>• Bank processes mortgage (if applicable)</Text>
        <Text style={styles.bulletPoint}>• Funds transferred to seller; registration completes</Text>

        <Text style={styles.heading}>Step 5: Registration & Handover</Text>
        <Text style={styles.bulletPoint}>• Deed registered in your name at Deeds Registry (5–10 working days typical)</Text>
        <Text style={styles.bulletPoint}>• Conveyancer sends you certified copy of deed</Text>
        <Text style={styles.bulletPoint}>• Keys handed over; property is yours!</Text>

        <Text style={styles.paragraph} style={{ marginTop: 20 }}>
          Timeline: Typically 30–60 days from offer to transfer completion.
        </Text>
      </Page>

      {/* Chapter 2: Cost Breakdown */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Chapter 2: Complete Cost Breakdown</Text>
        <Text style={styles.paragraph}>What to expect when buying property in Zimbabwe</Text>

        <Text style={styles.heading}>1. Transfer Duty (Stamp Duty)</Text>
        <Text style={styles.bulletPoint}>• Payable to ZIMRA (Zimbabwe Revenue Authority)</Text>
        <Text style={styles.bulletPoint}>• Rate scales with purchase price (see table below)</Text>
        <Text style={styles.bulletPoint}>• Typically 5% on properties USD 50K–200K, 10% above USD 200K</Text>

        <Text style={styles.heading}>2. Conveyancing & Legal Fees</Text>
        <Text style={styles.bulletPoint}>• Conveyancer: USD 250–800 (depending on property price)</Text>
        <Text style={styles.bulletPoint}>• Deeds Registry registration: USD 50–100</Text>
        <Text style={styles.bulletPoint}>• Title deed search: USD 30–50</Text>

        <Text style={styles.heading}>3. Property Valuation & Inspection</Text>
        <Text style={styles.bulletPoint}>• Bank property valuation (if financing): USD 150–300</Text>
        <Text style={styles.bulletPoint}>• Professional home inspection: USD 150–250 (recommended but optional)</Text>

        <Text style={styles.heading}>4. Municipal Rates Clearance</Text>
        <Text style={styles.bulletPoint}>• Council rates clearance certificate: Free to ~USD 20</Text>
        <Text style={styles.bulletPoint}>• Verify NO unpaid rates on the property</Text>

        <Text style={styles.heading}>5. Capital Gains Tax (CGT)</Text>
        <Text style={styles.bulletPoint}>• Seller pays CGT, not buyer (in most cases)</Text>
        <Text style={styles.bulletPoint}>• Rate: 20% on gains above USD 25K per year</Text>
        <Text style={styles.bulletPoint}>• Principal residence exemption applies (if owner-occupied)</Text>

        <Text style={styles.heading}>6. Mortgage Insurance (if financing)</Text>
        <Text style={styles.bulletPoint}>• Mortgage protection insurance: Typically 1–2% of loan amount</Text>
        <Text style={styles.bulletPoint}>• Life insurance: Optional but recommended for protection</Text>

        <Text style={styles.heading}>Example: USD 200K Purchase</Text>
        <Text style={styles.bulletPoint}>• Purchase price: USD 200,000</Text>
        <Text style={styles.bulletPoint}>• Transfer duty (estimate): USD 15,000–20,000</Text>
        <Text style={styles.bulletPoint}>• Conveyancing: USD 600</Text>
        <Text style={styles.bulletPoint}>• Valuation: USD 250</Text>
        <Text style={styles.bulletPoint}>• Total closing costs: ~USD 16,000–21,000 (8–10.5% of purchase price)</Text>
      </Page>

      {/* Chapter 3: Red Flags */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Chapter 3: Red Flags & Common Pitfalls</Text>
        <Text style={styles.paragraph}>Critical issues that kill deals or lead to costly repairs</Text>

        <Text style={styles.heading}>🚩 Title Deed Issues</Text>
        <Text style={styles.bulletPoint}>• Deed not in seller's name (ownership mismatch → MAJOR RED FLAG)</Text>
        <Text style={styles.bulletPoint}>• Deed issued under different name + power of attorney (high fraud risk)</Text>
        <Text style={styles.bulletPoint}>• Cession (property transferred via assignment) — verify legality with conveyancer</Text>
        <Text style={styles.bulletPoint}>• Property listed under company/trust — requires additional scrutiny</Text>
        <Text style={styles.paragraph} style={{ marginTop: 8 }}>Action: ALWAYS have conveyancer verify deed at Deeds Registry before signing offer.</Text>

        <Text style={styles.heading}>🚩 Unpaid Rates & Utilities</Text>
        <Text style={styles.bulletPoint}>• Municipal rates arrears (could be hundreds or thousands USD)</Text>
        <Text style={styles.bulletPoint}>• ZESA (electricity) debt — council can disconnect post-purchase</Text>
        <Text style={styles.bulletPoint}>• Water (ZINWA) arrears — seller's obligation, not yours (usually)</Text>
        <Text style={styles.bulletPoint}>• Property tax liens — buyer can inherit liability</Text>
        <Text style={styles.paragraph} style={{ marginTop: 8 }}>Action: Require rates clearance certificate from council. Ask seller to provide ZESA, ZINWA reconciliation statements.</Text>

        <Text style={styles.heading}>🚩 Boundary & Easement Disputes</Text>
        <Text style={styles.bulletPoint}>• Neighbor disputes over boundary lines</Text>
        <Text style={styles.bulletPoint}>• Easements (rights-of-way) not disclosed</Text>
        <Text style={styles.bulletPoint}>• Encroachments (seller's fence on neighbor's land, neighbor's structure on your property)</Text>
        <Text style={styles.paragraph} style={{ marginTop: 8 }}>Action: Hire surveyor to verify boundaries (~USD 200–400). Walk property with neighbors to confirm agreement.</Text>

        <Text style={styles.heading}>🚩 Structural & Hidden Defects</Text>
        <Text style={styles.bulletPoint}>• Foundation cracks or settlement issues</Text>
        <Text style={styles.bulletPoint}>• Roof leaks, water damage, rot (expensive to repair)</Text>
        <Text style={styles.bulletPoint}>• Electrical wiring outdated/unsafe</Text>
        <Text style={styles.bulletPoint}>• Plumbing issues (corroded pipes, lead pipes in old houses)</Text>
        <Text style={styles.paragraph} style={{ marginTop: 8 }}>Action: Hire qualified home inspector. Request full disclosure from seller of known defects.</Text>

        <Text style={styles.heading}>🚩 Zoning & Legal Restrictions</Text>
        <Text style={styles.bulletPoint}>• Property zoned for residential, but seller running business from it</Text>
        <Text style={styles.bulletPoint}>• Local council restrictions (no extensions without approval)</Text>
        <Text style={styles.bulletPoint}>• Mortgage restrictions (lender won't allow short-term rentals, business use)</Text>
        <Text style={styles.paragraph} style={{ marginTop: 8 }}>Action: Verify zoning with local council. Review mortgage terms for permitted uses.</Text>
      </Page>

      {/* Chapter 4: City-Specific Guides */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Chapter 4: City-Specific Guides</Text>

        <Text style={styles.heading}>Harare</Text>
        <Text style={styles.bulletPoint}>• Processes: Harare City Council oversees rates & zoning</Text>
        <Text style={styles.bulletPoint}>• Market: Prices vary dramatically by suburb (Borrowdale highest, Mbare lowest)</Text>
        <Text style={styles.bulletPoint}>• Transfers typically 6–8 weeks. Council rates clearance: 2–5 days</Text>
        <Text style={styles.bulletPoint}>• High-demand suburbs: Borrowdale, Glen Norah, Highlands, Waterfalls</Text>
        <Text style={styles.bulletPoint}>• Affordable suburbs: Belgravia, Rugare, Kambuzuma</Text>
        <Text style={styles.bulletPoint}>• Contact: Harare City Council, Box 712, Harare</Text>

        <Text style={styles.heading}>Bulawayo</Text>
        <Text style={styles.bulletPoint}>• Processes: Bulawayo City Council, generally faster than Harare</Text>
        <Text style={styles.bulletPoint}>• Market: More affordable than Harare; strong expat community</Text>
        <Text style={styles.bulletPoint}>• Transfers typically 5–7 weeks</Text>
        <Text style={styles.bulletPoint}>• Popular areas: Kumalo, Bradfield, Hillside, Ascot</Text>
        <Text style={styles.bulletPoint}>• Contact: Bulawayo City Council, Box 1117, Bulawayo</Text>

        <Text style={styles.heading}>Mutare</Text>
        <Text style={styles.bulletPoint}>• Mutare City Council administers</Text>
        <Text style={styles.bulletPoint}>• Mountain town, growing expat presence</Text>
        <Text style={styles.bulletPoint}>• Transfers typically 6–8 weeks</Text>
        <Text style={styles.bulletPoint}>• Contact: Mutare City Council</Text>

        <Text style={styles.heading}>Victoria Falls</Text>
        <Text style={styles.bulletPoint}>• Victoria Falls Town Council</Text>
        <Text style={styles.bulletPoint}>• Tourism hub; strong short-term rental market (Airbnb, guest houses)</Text>
        <Text style={styles.bulletPoint}>• High holiday demand (peak July/Dec); slower low season</Text>
        <Text style={styles.bulletPoint}>• Contact: Victoria Falls Town Council</Text>
      </Page>

      {/* Chapter 5: Legal Checklist */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Chapter 5: Your Legal Checklist</Text>

        <Text style={styles.heading}>Before Making an Offer</Text>
        <Text style={styles.bulletPoint}>☐ Research comparable sales (3–5 similar properties)</Text>
        <Text style={styles.bulletPoint}>☐ Get pre-approval from bank (if financing)</Text>
        <Text style={styles.bulletPoint}>☐ Hire conveyancer (interview 2–3 candidates)</Text>
        <Text style={styles.bulletPoint}>☐ Walk property multiple times (day & night)</Text>
        <Text style={styles.bulletPoint}>☐ Talk to neighbors (ask about issues, noises, disputes)</Text>

        <Text style={styles.heading}>In Your Offer</Text>
        <Text style={styles.bulletPoint}>☐ Include financing contingency (if applicable)</Text>
        <Text style={styles.bulletPoint}>☐ Include inspection contingency (7–14 days)</Text>
        <Text style={styles.bulletPoint}>☐ Set deadline for acceptance</Text>
        <Text style={styles.bulletPoint}>☐ Specify earnest money amount & term</Text>

        <Text style={styles.heading}>After Acceptance (Agreement of Sale)</Text>
        <Text style={styles.bulletPoint}>☐ Conveyancer verifies title deed at Deeds Registry</Text>
        <Text style={styles.bulletPoint}>☐ Request rates clearance from council</Text>
        <Text style={styles.bulletPoint}>☐ Request ZESA reconciliation statement (no electricity debt)</Text>
        <Text style={styles.bulletPoint}>☐ Request ZINWA statement (water account status)</Text>
        <Text style={styles.bulletPoint}>☐ Request property tax statement (ZIMRA)</Text>
        <Text style={styles.bulletPoint}>☐ Hire surveyor to verify boundaries (if concerns)</Text>
        <Text style={styles.bulletPoint}>☐ Hire home inspector to assess condition</Text>

        <Text style={styles.heading}>Before Signing Transfer Docs</Text>
        <Text style={styles.bulletPoint}>☐ Verify all financial terms one final time</Text>
        <Text style={styles.bulletPoint}>☐ Confirm mortgage pre-approval is still valid</Text>
        <Text style={styles.bulletPoint}>☐ Review transfer document line-by-line with conveyancer</Text>
        <Text style={styles.bulletPoint}>☐ Verify property description matches your expectations</Text>

        <Text style={styles.heading}>At Closing</Text>
        <Text style={styles.bulletPoint}>☐ Transfer funds to escrow/trustee</Text>
        <Text style={styles.bulletPoint}>☐ Sign all transfer documents in front of notary (if required)</Text>
        <Text style={styles.bulletPoint}>☐ Receive receipt of transfer application submission</Text>

        <Text style={styles.heading}>After Registration</Text>
        <Text style={styles.bulletPoint}>☐ Receive certified copy of registered deed</Text>
        <Text style={styles.bulletPoint}>☐ Update your records with deed number & date</Text>
        <Text style={styles.bulletPoint}>☐ Update insurance, utilities (ZESA, ZINWA) in your name</Text>
        <Text style={styles.bulletPoint}>☐ Register with local council (rates)</Text>
      </Page>

      {/* Final Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.chapterTitle}>Ready to Buy?</Text>

        <Text style={styles.paragraph}>
          You now have the essential knowledge to confidently navigate property buying in Zimbabwe. Remember:
        </Text>

        <Text style={styles.bulletPoint}>
          1. Verify title deeds — this is THE most critical step in preventing fraud
        </Text>
        <Text style={styles.bulletPoint}>
          2. Hire a reputable conveyancer and home inspector — their expertise will save you money & headaches
        </Text>
        <Text style={styles.bulletPoint}>
          3. Check for unpaid rates and utilities — council will pursue you for arrears
        </Text>
        <Text style={styles.bulletPoint}>
          4. Negotiate realistically — know the market rates before making an offer
        </Text>
        <Text style={styles.bulletPoint}>
          5. Get your finances in order — pre-approval strengthens your position
        </Text>

        <Text style={styles.paragraph} style={{ marginTop: 25 }}>
          For personalized guidance and to browse verified properties, visit Huts at www.huts.co.zw.
        </Text>

        <Text style={styles.paragraph}>
          Good luck with your property search! You've got this.
        </Text>

        <Text style={styles.footerText}>
          © 2026 Huts Zimbabwe. This guide is accurate as of 2026. Property laws, tax rates, and costs may change. Always consult with a qualified conveyancer and tax advisor for your specific situation.
        </Text>
      </Page>
    </Document>
  )
}

export default BuyingGuidePDF
