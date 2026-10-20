import { readLegacyPage } from "@/lib/legacy-page";

export default function Home() {
  // The legacy scripts own this markup after load; React must not re-render it.
  return <div id="legacy-root" style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: readLegacyPage().body }} />;
}
