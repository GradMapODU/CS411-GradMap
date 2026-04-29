// components/ResourcesPage.jsx
import { useEffect, useState } from "react";
import { getResources } from "@api/resources.js";

// ── Category metadata (icon + accent color class) ────────────────────────────
const CATEGORY_META = {
  "Registration":               { emoji: "📋", colorClass: ""   },
  "Academic Planning":          { emoji: "🎓", colorClass: ""   },
  "Student Services":           { emoji: "🏛️", colorClass: "" },
  "Financial Aid":              { emoji: "💰", colorClass: ""  },
  "IT":                         { emoji: "💻", colorClass: ""},
  "Health":                     { emoji: "❤️", colorClass: ""    },
  "General":                    { emoji: "🔗", colorClass: ""   },
};

function getCategoryMeta(cat) {
  return CATEGORY_META[cat] || { emoji: "🔗", colorClass: "resCat--grey" };
}

// ── Single resource card ──────────────────────────────────────────────────────
function ResourceCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="resourceCard"
      aria-label={`${item.title} — opens in a new tab`}
    >
      <span className="resourceCard__body">
        <span className="resourceCard__title">{item.title}</span>
        {item.description && (
          <span className="resourceCard__desc">{item.description}</span>
        )}
      </span>
      <span className="resourceCard__arrow" aria-hidden="true">↗</span>
    </a>
  );
}

// ── Category section ──────────────────────────────────────────────────────────
function CategorySection({ category, items }) {
  const { colorClass } = getCategoryMeta(category);
  return (
    <section className={`resourceCategory ${colorClass}`}>
      <h3 className="resourceCategory__header">
        {category}
        <span className="resourceCategory__count">{items.length}</span>
      </h3>
      <div className="resourceGrid">
        {items.map((item) => (
          <ResourceCard key={item.id ?? item.url} item={item} />
        ))}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResourcesPage({ token }) {
  const [grouped,  setGrouped]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getResources(token);
        setGrouped(data?.grouped ?? {});
      } catch (err) {
        console.error("ResourcesPage load error:", err);
        setError("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // ── Filter by search query ──────────────────────────────────────────────────
  const query = search.trim().toLowerCase();

  const filteredGrouped = {};
  for (const [cat, items] of Object.entries(grouped)) {
    const filtered = query
      ? items.filter(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            (i.description || "").toLowerCase().includes(query) ||
            cat.toLowerCase().includes(query)
        )
      : items;
    if (filtered.length > 0) filteredGrouped[cat] = filtered;
  }

  const totalLinks = Object.values(grouped).reduce((s, a) => s + a.length, 0);
  const visibleLinks = Object.values(filteredGrouped).reduce((s, a) => s + a.length, 0);

  // Preserve a stable category order
  const CATEGORY_ORDER = Object.keys(CATEGORY_META);
  const sortedCategories = Object.keys(filteredGrouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <section className="card resourcesPage">
      {/* ── Header ── */}
      <div className="resourcesPage__header">
        <div>
          <h2 className="resourcesPage__title">
            <span aria-hidden="true"></span> ODU Student Resources
          </h2>
          <p className="muted resourcesPage__subtitle">
            Quick links to Old Dominion University tools.
          </p>
        </div>

        <div className="resourcesPage__meta muted">
          {!loading && !error && (
            <>
              <span>{totalLinks} links</span>
              <span>·</span>
              <span>{Object.keys(grouped).length} categories</span>
            </>
          )}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="resourcesPage__searchWrap">
        <span className="resourcesPage__searchIcon" aria-hidden="true"></span>
        <input
          className="resourcesPage__search"
          type="search"
          placeholder="Search resourceS"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search resources"
        />
        {query && (
          <button
            className="resourcesPage__searchClear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="resourcesPage__state">
          <span className="spinner" aria-hidden="true" />
          <span>Loading resources…</span>
        </div>
      )}

      {!loading && error && (
        <div className="resourcesPage__state resourcesPage__state--error">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && sortedCategories.length === 0 && (
        <div className="resourcesPage__state">
          {query
            ? `No resources match "${search}".`
            : "No resources available."}
        </div>
      )}

      {/* ── Search result count ── */}
      {!loading && !error && query && sortedCategories.length > 0 && (
        <p className="muted resourcesPage__resultCount">
          Showing {visibleLinks} of {totalLinks} links
        </p>
      )}

      {/* ── Category sections ── */}
      {!loading && !error && (
        <div className="resourcesPage__body">
          {sortedCategories.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={filteredGrouped[cat]}
            />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      {!loading && !error && sortedCategories.length > 0 && (
        <p className="muted resourcesPage__footer">
          All links open on the official ODU website in a new tab.
        </p>
      )}
    </section>
  );
}
