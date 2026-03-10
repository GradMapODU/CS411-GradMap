import { useMemo, useState } from "react";

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function getLevelFromCode(code = "") {
  const match = String(code).match(/\b(\d{3})\b/);
  if (!match) return "other";
  return `${match[1][0]}00`;
}

function sortByCode(a, b) {
  return String(a.code).localeCompare(String(b.code), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function CourseCard({ course }) {
  return (
    <article className="catalogCourseCard">
      <div className="catalogCourseCard__top">
        <div>
          <div className="catalogCourseCard__code">{course.code}</div>
          <h3 className="catalogCourseCard__title">{course.title}</h3>
        </div>

        <div className="catalogCourseCard__badges">
          <span className="catalogBadge">{course.credits} Credits</span>
          <span className="catalogBadge catalogBadge--soft">
            {course.level || getLevelFromCode(course.code)}
          </span>
        </div>
      </div>

      <p className="muted catalogCourseCard__desc">{course.description}</p>

      {Array.isArray(course.tags) && course.tags.length > 0 && (
        <div className="catalogTagRow">
          {course.tags.map((tag) => (
            <span key={`${course.code}-${tag}`} className="catalogTag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="catalogCourseCard__meta">
        <div>
          <span className="catalogLabel">Prerequisites:</span>{" "}
          <span className="muted">{course.prerequisites || "None listed"}</span>
        </div>

        <div>
          <span className="catalogLabel">Format:</span>{" "}
          <span className="muted">{course.format || "Lecture"}</span>
        </div>
      </div>
    </article>
  );
}

export default function CourseCataloguePage({ student, courses = [] }) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [creditFilter, setCreditFilter] = useState("all");

  const major =
    student?.major || student?.program || student?.degreePlan || "Undeclared";

    const allCourses = useMemo(() => {
        return Array.isArray(courses) ? [...courses].sort(sortByCode) : [];
    }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = normalize(search);

    return allCourses.filter((course) => {
      const courseLevel = String(course.level || getLevelFromCode(course.code));

      const matchesSearch =
        !q ||
        normalize(course.code).includes(q) ||
        normalize(course.title).includes(q) ||
        normalize(course.description).includes(q) ||
        normalize(course.prerequisites).includes(q) ||
        (Array.isArray(course.tags) &&
          course.tags.some((tag) => normalize(tag).includes(q)));

      const matchesLevel =
        levelFilter === "all" || normalize(courseLevel) === normalize(levelFilter);

      const matchesCredits =
        creditFilter === "all" || String(course.credits) === String(creditFilter);

      return matchesSearch && matchesLevel && matchesCredits;
    });
  }, [allCourses, search, levelFilter, creditFilter]);

  const totalCredits = useMemo(() => {
    return filteredCourses.reduce(
      (sum, course) => sum + Number(course.credits || 0),
      0
    );
  }, [filteredCourses]);

  return (
    <section className="card">
      <div className="catalogHero">
        <div>
          <h2>Course Catalogue</h2>
          <p className="muted catalogHero__subtitle">
            Browse {major} courses, review prerequisites, and search by code,
            title, or topic.
          </p>
        </div>

        <div className="catalogStats">
          <div className="catalogStat">
            <div className="catalogStat__value">{filteredCourses.length}</div>
            <div className="muted catalogStat__label">Courses Shown</div>
          </div>

          <div className="catalogStat">
            <div className="catalogStat__value">{totalCredits}</div>
            <div className="muted catalogStat__label">Visible Credits</div>
          </div>
        </div>
      </div>

      <div className="catalogToolbar panel">
        <div className="catalogToolbar__group catalogToolbar__group--search">
          <label className="catalogFieldLabel" htmlFor="catalog-search">
            Search
          </label>
          <input
            id="catalog-search"
            className="input"
            type="text"
            placeholder="Search CS 330, algorithms, web, machine learning..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="catalogToolbar__group">
          <label className="catalogFieldLabel" htmlFor="catalog-level">
            Level
          </label>
          <select
            id="catalog-level"
            className="input"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="100">100-level</option>
            <option value="200">200-level</option>
            <option value="300">300-level</option>
            <option value="400">400-level</option>
            <option value="500">500-level</option>
          </select>
        </div>

        <div className="catalogToolbar__group">
          <label className="catalogFieldLabel" htmlFor="catalog-credits">
            Credits
          </label>
          <select
            id="catalog-credits"
            className="input"
            value={creditFilter}
            onChange={(e) => setCreditFilter(e.target.value)}
          >
            <option value="all">Any Credits</option>
            <option value="1">1 Credit</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="catalogGrid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.code} course={course} />
          ))}
        </div>
      ) : (
        <div className="panel">
          <p className="muted">
            No courses matched your filters. Try a different search term or clear
            a filter.
          </p>
        </div>
      )}
    </section>
  );
}