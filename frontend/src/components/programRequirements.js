// programRequirements.js

export const computerSciencePrograms = {
  programName: "Computer Science",
  totalCreditsRequired: 120,
  sections: [
    {
      key: "majorCore",
      title: "Major Core",
      requirements: [
        {
          kind: "chooseOne",
          name: "Introduction to Programming",
          options: [
            { code: "CS 151", name: "Intro to Programming with Java" },
            { code: "CS 153", name: "Intro to Programming with Python" },
            { code: "CS 150", name: "Intro to Programming with C++" },
          ],
        },
        { kind: "single", code: "CS 170", name: "Fundamentals of Computer Organization" },
        {
          kind: "chooseOneGroup",
          name: "Programming Sequence",
          groups: [
            { name: "Java track", codes: ["CS 251", "CS 260"] },
            { name: "Python track (transfer)", codes: ["CS 253", "CS 260", "CS 261"] },
            { name: "C++ track (transfer)", codes: ["CS 250", "CS 261"] },
          ],
        },
        { kind: "single", code: "CS 252", name: "Introduction to Unix for Programmers" },
        { kind: "single", code: "CS 270", name: "Introduction to Computer Architecture" },
        {
          kind: "chooseOne",
          name: "Undergraduate Colloquium",
          options: [
            { code: "CS 315", name: "CS Undergraduate Colloquium" },
            { code: "CS 115", name: "Intro to CS with Python" },
          ],
        },
        { kind: "single", code: "CS 330", name: "Object-Oriented Programming and Design" },
        { kind: "single", code: "CS 350", name: "Introduction to Software Engineering" },
        { kind: "single", code: "CS 361", name: "Advanced Data Structures and Algorithms" },
        { kind: "single", code: "CS 381", name: "Discrete Structures" },
        { kind: "single", code: "CS 390", name: "Formal Languages and Automata" },
        { kind: "single", code: "CS 410", name: "Professional Workforce Development I" },
        { kind: "single", code: "CS 411W", name: "Professional Workforce Development II (Writing Intensive)" },
        { kind: "single", code: "CS 417", name: "Computational Methods and Software" },
        {
          kind: "chooseOne",
          name: "Data Management",
          options: [
            { code: "CS 450", name: "Database Concepts" },
            { code: "CS 418", name: "Web Programming" },
          ],
        },
        { kind: "single", code: "CS 471", name: "Operating Systems" },
        { kind: "single", code: "MATH 211", name: "Calculus I" },
        { kind: "single", code: "MATH 212", name: "Calculus II" },
      ],
    },

    {
      key: "electives",
      title: "Computer Science Electives",
      requirements: [
        {
          kind: "chooseN",
          count: 3,
          name: "Upper-level CS Electives (9 credits)",
          options: [
            { code: "CS 222" }, { code: "CS 312" }, { code: "CS 402" },
            { code: "CS 418" }, { code: "CS 422" }, { code: "CS 431" },
            { code: "CS 432" }, { code: "CS 433" }, { code: "CS 441" },
            { code: "CS 450" }, { code: "CS 455" }, { code: "CS 460" },
            { code: "CS 462" }, { code: "CS 463" }, { code: "CS 464" },
            { code: "CS 465" }, { code: "CS 466" }, { code: "CS 467" },
            { code: "CS 468" }, { code: "CS 472" }, { code: "CS 475" },
            { code: "CS 476" }, { code: "CS 478" }, { code: "CS 480" },
            { code: "CS 486" }, { code: "CS 487" }, { code: "CS 488" },
            { code: "CS 491" }, { code: "CS 492" }, { code: "CS 499W" },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------
    // GENERAL EDUCATION
    // -------------------------------------------------------------------
    // Math: omitted (satisfied in major via MATH 211/212).
    // Language & Culture: omitted (typically met via HS placement).
    {
      key: "generalEducation",
      title: "General Education",
      requirements: [
        {
          kind: "chooseOne",
          name: "Written Communication I",
          options: [{ code: "ENGL 110C", name: "English Composition" }],
        },
        {
          kind: "chooseOne",
          name: "Written Communication II",
          options: [{ code: "ENGL 211C", name: "Advanced Composition" }],
        },
        {
          kind: "chooseOne",
          name: "Oral Communication",
          options: [
            { code: "COMM 101R", name: "Public Speaking" },
            { code: "PHIL 160R", name: "Raising Moral Issues in STEM" },
          ],
        },
        {
          kind: "chooseOne",
          name: "Information Literacy and Research",
          options: [
            { code: "CS 121G", name: "Info Literacy for Scientists" },
            { code: "CS 202G", name: "Info Literacy for Cybersecurity" },
          ],
        },
        {
          kind: "chooseOne",
          name: "Human Behavior",
          options: [{ code: "PSYC 201S", name: "Introduction to Psychology" }],
        },
        {
          kind: "chooseOne",
          name: "Human Creativity",
          options: [{ code: "ARTH 121A", name: "Introduction to the Visual Arts" }],
        },
        {
          kind: "chooseOne",
          name: "Interpreting the Past",
          options: [{ code: "HIST 100H", name: "Interpreting the World Past Since 1500" }],
        },
        {
          kind: "chooseOne",
          name: "Literature",
          options: [{ code: "ENGL 112L", name: "Introduction to Literature" }],
        },
        {
          kind: "chooseOne",
          name: "Philosophy and Ethics",
          options: [{ code: "PHIL 110P", name: "Introduction to Philosophy" }],
        },
        {
          kind: "chooseOneGroup",
          name: "The Nature of Science (8 credits, in sequence)",
          groups: [
            { name: "University Physics", codes: ["PHYS 231N", "PHYS 232N"] },
            { name: "Honors University Physics", codes: ["PHYS 226N", "PHYS 227N"] },
            { name: "Introductory General Physics", codes: ["PHYS 111N", "PHYS 112N"] },
            { name: "General Biology", codes: ["BIOL 121N", "BIOL 122N", "BIOL 123N", "BIOL 124N"] },
            { name: "Honors General Biology", codes: ["BIOL 136N", "BIOL 137N", "BIOL 138N", "BIOL 139N"] },
            { name: "Introductory Chemistry", codes: ["CHEM 105N", "CHEM 106N", "CHEM 107N", "CHEM 108N"] },
            { name: "Foundations of Chemistry", codes: ["CHEM 121N", "CHEM 122N", "CHEM 123N", "CHEM 124N"] },
            { name: "Oceanography + Climate Change", codes: ["OEAS 106N", "OEAS 108N"] },
            { name: "Oceanography + Natural Hazards", codes: ["OEAS 106N", "OEAS 250N"] },
            { name: "Honors Oceanography + Climate Change", codes: ["OEAS 126N", "OEAS 108N"] },
            { name: "Honors Oceanography + Natural Hazards", codes: ["OEAS 126N", "OEAS 250N"] },
          ],
        },
        {
          kind: "crossSatisfied",
          name: "Impact of Technology",
          satisfiedBy: ["CS 330", "CS 350", "CS 410", "CS 411W"],
          note: "satisfied through the major",
        },
      ],
    },
  ],
};

export const programsByName = {
  "Computer Science": computerSciencePrograms,
};

export function getProgramRequirements(programName) {
  return programsByName[programName] || null;
}