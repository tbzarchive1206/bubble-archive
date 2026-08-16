import { useEffect, useMemo, useState } from "react";

type MediaKind = "image" | "video" | "audio" | "document";
type Media = {
  id: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  path: string;
  dateKey: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  order: number;
};
type Member = {
  name: string;
  label: string;
  url: string;
  externalUrl?: string;
  externalLabel?: string;
  folderCount: number;
  media: Media[];
};
export type Archive = {
  title: string;
  generatedAt: string;
  sourceFolderId: string;
  members: Member[];
};

const pageSize = 48;
const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const thumbnail = (id: string, size = "w1200") => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=${size}`;
const fileUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
const previewUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const directUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
const rootUrl = (id: string) => `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`;

function effectiveKind(item: Media): MediaKind {
  if (item.kind === "audio" || /(?:voice|보이스|메세지|메시지)/i.test(item.path)) return "audio";
  return item.kind;
}

function formatDate(item: Media) {
  if (!item.dateKey) return item.year ? String(item.year) : "DATE UNAVAILABLE";
  return `${item.dateKey.slice(6, 8)}.${item.dateKey.slice(4, 6)}.${item.dateKey.slice(0, 4)}`;
}

function MediaTile({ item, onPreview }: { item: Media; onPreview: (item: Media) => void }) {
  const kind = effectiveKind(item);
  if (kind === "video" || kind === "audio") {
    return (
      <figure className={`media-tile preview-tile ${kind}-preview-tile`}>
        <button type="button" className="media-preview-button" onClick={() => onPreview(item)} aria-label={`Play ${item.name}`}>
          {kind === "video" ? <img src={thumbnail(item.id)} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="audio-mark">VOICE MESSAGE / BUBBLE</span>}
          <span className="preview-badge">▶ {kind === "video" ? "PLAY VIDEO" : "PLAY AUDIO"}</span>
        </button>
        <figcaption className="media-caption"><span title={item.name}>{item.name}</span><span><a href={fileUrl(item.id)} target="_blank" rel="noreferrer">VIEW ↗</a><a href={directUrl(item.id)} target="_blank" rel="noreferrer">DOWNLOAD ↓</a></span></figcaption>
      </figure>
    );
  }
  if (kind === "document") {
    return (
      <figure className="media-tile document-tile">
        <a className="document-cover" href={fileUrl(item.id)} target="_blank" rel="noreferrer"><strong>DOCUMENT</strong><span>OPEN FILE ↗</span></a>
        <figcaption className="media-caption"><span title={item.name}>{item.name}</span><span><a href={fileUrl(item.id)} target="_blank" rel="noreferrer">VIEW ↗</a><a href={directUrl(item.id)} target="_blank" rel="noreferrer">DOWNLOAD ↓</a></span></figcaption>
      </figure>
    );
  }
  return (
    <figure className="media-tile image-tile">
      <a href={fileUrl(item.id)} target="_blank" rel="noreferrer" aria-label={`Open ${item.name}`}><img src={thumbnail(item.id)} alt="" loading="lazy" referrerPolicy="no-referrer" /></a>
      <figcaption className="media-caption"><span title={item.name}>{item.name}</span><span><a href={fileUrl(item.id)} target="_blank" rel="noreferrer">VIEW ↗</a><a href={directUrl(item.id)} target="_blank" rel="noreferrer">DOWNLOAD ↓</a></span></figcaption>
    </figure>
  );
}

export function BubbleArchive({ data }: { data: Archive }) {
  const [member, setMember] = useState<Member | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | MediaKind>("all");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [sort, setSort] = useState<"source" | "newest" | "oldest" | "az">("source");
  const [shown, setShown] = useState(pageSize);
  const [preview, setPreview] = useState<Media | null>(null);

  const totalMedia = data.members.reduce((sum, item) => sum + item.media.length, 0);
  const totalCounts = useMemo(() => data.members.reduce((counts, current) => {
    current.media.forEach((item) => { const kind = effectiveKind(item); counts[kind] = (counts[kind] || 0) + 1; });
    return counts;
  }, {} as Record<MediaKind, number>), [data]);

  const chooseMember = (next: Member) => {
    setMember(next);
    setQuery("");
    setType("all");
    setYear("all");
    setMonth("all");
    setSort("source");
    setShown(pageSize);
    window.location.hash = encodeURIComponent(next.name.toLowerCase());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeMember = () => {
    setMember(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const requested = decodeURIComponent(window.location.hash.slice(1)).toLocaleLowerCase();
    const found = data.members.find((item) => item.name.toLocaleLowerCase() === requested);
    if (found) setMember(found);
  }, [data]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(preview));
    return () => document.body.classList.remove("modal-open");
  }, [preview]);

  const years = useMemo(() => member ? [...new Set(member.media.map((item) => item.year).filter((value): value is number => Boolean(value)))].sort((a, b) => b - a) : [], [member]);
  const availableMonths = useMemo(() => member && /^\d{4}$/.test(year) ? [...new Set(member.media.filter((item) => item.year === Number(year)).map((item) => item.month).filter((value): value is number => Boolean(value)))].sort((a, b) => b - a) : [], [member, year]);

  const media = useMemo(() => {
    if (!member) return [];
    const value = query.trim().toLocaleLowerCase();
    const items = member.media
      .filter((item) => type === "all" || effectiveKind(item) === type)
      .filter((item) => year === "all" || (year === "undated" ? !item.year : item.year === Number(year)))
      .filter((item) => month === "all" || item.month === Number(month))
      .filter((item) => !value || `${item.name} ${item.path} ${item.dateKey || ""}`.toLocaleLowerCase().includes(value));
    return [...items].sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name, undefined, { numeric: true });
      if (sort === "newest" || sort === "oldest") {
        const left = a.dateKey || "", right = b.dateKey || "";
        if (left !== right) return sort === "newest" ? right.localeCompare(left) : left.localeCompare(right);
      }
      return a.order - b.order;
    });
  }, [member, month, query, sort, type, year]);

  const memberCounts = (item: Member) => item.media.reduce((counts, mediaItem) => {
    const kind = effectiveKind(mediaItem);
    counts[kind] = (counts[kind] || 0) + 1;
    return counts;
  }, {} as Record<MediaKind, number>);

  return (
    <main id="top">
      <header className="masthead">
        <div className="utility"><a className="brand" href="https://tbzarchive.com/">THE BOYZ / FAN ARCHIVE</a><nav><span>STATIC MEDIA COLLECTION</span><span>/</span><a href="https://x.com/tbzarchive1206_" target="_blank" rel="noreferrer">TWITTER ↗</a></nav></div>
        <h1><span className="solid">BUBBLE MEDIA</span><span className="outline">ARCHIVE</span></h1>
        <div className="stats"><p><strong>{data.members.length}</strong> MEMBERS</p><i /><p><strong>{totalMedia.toLocaleString("en-US")}</strong> MEDIA FILES</p><i /><p>STATIC <strong>ARCHIVE</strong></p></div>
      </header>

      {!member ? (
        <section className="member-picker">
          <div className="picker-head"><p>SELECT A MEMBER</p><a href={rootUrl(data.sourceFolderId)} target="_blank" rel="noreferrer">OPEN SOURCE FOLDER ↗</a></div>
          <div className="member-grid">{data.members.map((item, index) => {
            const counts = memberCounts(item);
            return <button key={item.name} onClick={() => chooseMember(item)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><small>{item.externalUrl ? "EXTERNAL ARCHIVE →" : `${item.media.length.toLocaleString("en-US")} MEDIA · ${(counts.audio || 0).toLocaleString("en-US")} VOICE →`}</small></button>;
          })}</div>
          <div className="archive-summary"><span>{(totalCounts.image || 0).toLocaleString("en-US")} PHOTOS</span><span>{(totalCounts.video || 0).toLocaleString("en-US")} VIDEOS</span><span>{(totalCounts.audio || 0).toLocaleString("en-US")} VOICE MESSAGES</span><span>{(totalCounts.document || 0).toLocaleString("en-US")} DOCUMENTS</span></div>
        </section>
      ) : member.externalUrl ? (
        <section className="member-gallery external-member">
          <header className="member-gallery-head"><button onClick={closeMember}>← ALL MEMBERS</button><div><span>EXTERNAL ARCHIVE</span><h2>{member.label}</h2></div><a href={member.url} target="_blank" rel="noreferrer">SOURCE ↗</a></header>
          <div className="external-panel"><p>This member’s archive is hosted outside Google Drive and is preserved as a direct source link.</p><a href={member.externalUrl} target="_blank" rel="noreferrer">{member.externalLabel || "OPEN EXTERNAL ARCHIVE"} ↗</a></div>
        </section>
      ) : (
        <section className="member-gallery">
          <header className="member-gallery-head"><button onClick={closeMember}>← ALL MEMBERS</button><div><span>BUBBLE MEDIA</span><h2>{member.label}</h2></div><a href={member.url} target="_blank" rel="noreferrer">OPEN FOLDER ↗</a></header>
          <section className="controls member-controls" aria-label="Member media controls">
            <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setShown(pageSize); }} type="search" placeholder="SEARCH FILES OR DATES..." /></label>
            <div className="filter-row four">
              <label>TYPE<select value={type} onChange={(event) => { setType(event.target.value as typeof type); setShown(pageSize); }}><option value="all">ALL MEDIA</option><option value="image">PHOTOS</option><option value="video">VIDEOS</option><option value="audio">AUDIO</option><option value="document">DOCUMENTS</option></select></label>
              <label>YEAR<select value={year} onChange={(event) => { setYear(event.target.value); setMonth("all"); setShown(pageSize); }}><option value="all">ALL YEARS</option>{years.map((value) => <option key={value}>{value}</option>)}<option value="undated">DATE UNAVAILABLE</option></select></label>
              <label>MONTH<select value={month} disabled={!/^\d{4}$/.test(year)} onChange={(event) => { setMonth(event.target.value); setShown(pageSize); }}><option value="all">ALL MONTHS</option>{availableMonths.map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")} / {months[value - 1]}</option>)}</select></label>
              <label>SORT<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="source">SOURCE ORDER</option><option value="newest">NEWEST DATED</option><option value="oldest">OLDEST DATED</option><option value="az">A—Z</option></select></label>
            </div>
            <div className="member-tabs type-tabs"><button className={type === "all" ? "selected" : ""} onClick={() => setType("all")}>ALL MEDIA</button><button className={type === "image" ? "selected" : ""} onClick={() => setType("image")}>PHOTOS</button><button className={type === "video" ? "selected" : ""} onClick={() => setType("video")}>VIDEOS</button><button className={type === "audio" ? "selected" : ""} onClick={() => setType("audio")}>VOICE MESSAGES</button><button className={type === "document" ? "selected" : ""} onClick={() => setType("document")}>DOCUMENTS</button></div>
          </section>
          <div className="member-period"><p>{year === "all" ? "ALL MEDIA" : year === "undated" ? "DATE UNAVAILABLE" : `${month === "all" ? "ALL MONTHS" : months[Number(month) - 1]} / ${year}`}</p><span>{media.length.toLocaleString("en-US")} RESULTS</span></div>
          {media.length ? <div className="media-grid">{media.slice(0, shown).map((item) => <MediaTile key={item.id} item={item} onPreview={setPreview} />)}</div> : <div className="empty member-empty"><strong>NO MEDIA</strong>TRY CHANGING THE SEARCH OR FILTERS.</div>}
          {shown < media.length && <button className="load-more" onClick={() => setShown((value) => value + pageSize)}>LOAD MORE MEDIA ↓</button>}
        </section>
      )}

      <footer><a href="https://tbzarchive.com">← MAIN ARCHIVE</a><a href="#top">BACK TO TOP ↑</a></footer>

      {preview && <div className="player-overlay" role="dialog" aria-modal="true" aria-labelledby="player-title" onClick={(event) => { if (event.target === event.currentTarget) setPreview(null); }}><div className="player-box"><header><div><span>{effectiveKind(preview).toUpperCase()} / BUBBLE</span><h2 id="player-title">{preview.name}</h2><small>{formatDate(preview)}</small></div><button type="button" onClick={() => setPreview(null)} aria-label="Close player">×</button></header><iframe src={previewUrl(preview.id)} title={preview.name} allow="autoplay; fullscreen" allowFullScreen /><div className="player-links"><a href={fileUrl(preview.id)} target="_blank" rel="noreferrer">VIEW IN DRIVE ↗</a><a href={directUrl(preview.id)} target="_blank" rel="noreferrer">DOWNLOAD ↓</a></div></div></div>}
    </main>
  );
}
