import { describe, expect, it } from "@jest/globals";
import { resolve } from "./settings";

describe("resolve v2", () => {
  it("resolves minimum", () => {
    const got = resolve({ version: 2 });

    expect(got).toStrictEqual({
      version: 2,
      projects: [],
      preferences: {
        frontmatter: {
          quoteStrings: "PLAIN",
        },
        projectSizeLimit: 1000,
        projectViewLimit: 300,
        commands: [],
      },
    });
  });

  it("resolves an empty project with defaults", () => {
    const got = resolve({ version: 2, projects: [{ name: "Foo", id: "foo" }] });

    expect(got).toStrictEqual({
      version: 2,
      projects: [
        {
          name: "Foo",
          id: "foo",
          fieldConfig: {},
          defaultName: "",
          templates: [],
          excludedNotes: [],
          isDefault: false,
          dataSource: {
            kind: "folder",
            config: {
              path: "",
              recursive: false,
            },
          },
          newNotesFolder: "",
          views: [],
        },
      ],
      preferences: {
        frontmatter: {
          quoteStrings: "PLAIN",
        },
        projectSizeLimit: 1000,
        projectViewLimit: 300,
        commands: [],
      },
    });
  });
});
