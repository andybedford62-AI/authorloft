import { Document, Page, Text, View, Image, StyleSheet, Link } from "@react-pdf/renderer";
import type { MediaKitData } from "@/lib/media-kit-data";

const ACCENT = "#1e40af";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#374151",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: `2pt solid ${ACCENT}`,
  },
  brand: {
    fontSize: 9,
    color: "#93c5fd",
    backgroundColor: ACCENT,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 6,
    alignSelf: "flex-start",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: { fontSize: 22, fontWeight: 700, color: "#111827" },
  title: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  photo: { width: 90, height: 90, borderRadius: 6, objectFit: "cover" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: 700, color: ACCENT, marginBottom: 8,
    textTransform: "uppercase", letterSpacing: 1,
  },
  bioText: { fontSize: 10, lineHeight: 1.6, color: "#374151" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    width: "31%", backgroundColor: "#f3f4f6", borderRadius: 6,
    padding: 10, marginBottom: 10,
  },
  statValue: { fontSize: 18, fontWeight: 700, color: "#111827" },
  statLabel: { fontSize: 8, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  booksRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bookCover: { width: 70, height: 105, borderRadius: 4, objectFit: "cover", marginBottom: 4 },
  bookTitle: { fontSize: 7.5, color: "#374151", width: 70, textAlign: "center" },
  contactRow: { flexDirection: "row", gap: 18, marginTop: 4 },
  contactLabel: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
  contactValue: { fontSize: 10, color: "#111827", marginTop: 2 },
  footer: {
    position: "absolute", bottom: 24, left: 36, right: 36,
    fontSize: 8, color: "#9ca3af", textAlign: "center",
    borderTop: "1pt solid #e5e7eb", paddingTop: 8,
  },
});

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function MediaKitPdf({ data }: { data: MediaKitData }) {
  const bio = stripHtml(data.pressBio);
  const { stats } = data;

  return (
    <Document title={`${data.authorName} — Media Kit`} author={data.authorName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AuthorLoft Media Kit</Text>
            <Text style={styles.name}>{data.authorName}</Text>
            {data.pressTitle && <Text style={styles.title}>{data.pressTitle}</Text>}
            <Link src={data.siteUrl} style={{ fontSize: 9, color: ACCENT, marginTop: 4 }}>
              {data.siteUrl.replace(/^https?:\/\//, "")}
            </Link>
          </View>
          {data.profileImageUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={data.profileImageUrl} style={styles.photo} />
          )}
        </View>

        {/* Bio */}
        {bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By the Numbers</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.publishedBooks}</Text>
              <Text style={styles.statLabel}>Published Books</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.newsletterSubscribers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Newsletter Subscribers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.avgRating != null ? `${stats.avgRating} / 5` : "—"}</Text>
              <Text style={styles.statLabel}>Avg. Reader Rating{stats.totalReviews > 0 ? ` (${stats.totalReviews})` : ""}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalSales.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Books Sold</Text>
            </View>
            <View style={[styles.statBox, { width: "65%" }]}>
              <Text style={styles.statValue}>{stats.topGenres.length > 0 ? stats.topGenres.join(" · ") : "—"}</Text>
              <Text style={styles.statLabel}>Top Genres</Text>
            </View>
          </View>
        </View>

        {/* Books */}
        {data.topBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Books</Text>
            <View style={styles.booksRow}>
              {data.topBooks.map((b, i) => (
                <View key={i} style={{ alignItems: "center" }}>
                  {b.coverImageUrl
                    // eslint-disable-next-line jsx-a11y/alt-text
                    ? <Image src={b.coverImageUrl} style={styles.bookCover} />
                    : <View style={[styles.bookCover, { backgroundColor: "#f3f4f6" }]} />}
                  <Text style={styles.bookTitle}>{b.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactRow}>
            {data.pressContact && (
              <View>
                <Text style={styles.contactLabel}>Press Inquiries</Text>
                <Text style={styles.contactValue}>{data.pressContact}</Text>
              </View>
            )}
            <View>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>{data.siteUrl.replace(/^https?:\/\//, "")}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated via AuthorLoft · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </Text>
      </Page>
    </Document>
  );
}
