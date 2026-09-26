import { describe, it, expect } from "vitest";
import { authorSiteHosts, hostInClause } from "@/lib/analytics-hosts";

describe("authorSiteHosts", () => {
  it("builds the subdomain on the configured platform domain", () => {
    expect(authorSiteHosts("apbedford", null, "authorloft.com")).toEqual(["apbedford.authorloft.com"]);
    expect(authorSiteHosts("apbedford", null, "staging.authorloft.com")).toEqual([
      "apbedford.staging.authorloft.com",
    ]);
  });

  it("adds a custom domain with and without www.", () => {
    expect(authorSiteHosts("jane", "janedoe.com", "authorloft.com")).toEqual([
      "jane.authorloft.com",
      "janedoe.com",
      "www.janedoe.com",
    ]);
    expect(authorSiteHosts("jane", "WWW.JaneDoe.com", "authorloft.com")).toEqual([
      "jane.authorloft.com",
      "janedoe.com",
      "www.janedoe.com",
    ]);
  });

  it("strips characters that could break out of the HogQL string", () => {
    expect(authorSiteHosts("bob'--", "evil.com') OR (1=1", "authorloft.com")).toEqual([
      "bob--.authorloft.com",
      "evil.comor11",
      "www.evil.comor11",
    ]);
  });
});

describe("hostInClause", () => {
  it("matches exact hosts only", () => {
    expect(hostInClause(["bob.authorloft.com"])).toBe("properties.$host IN ('bob.authorloft.com')");
  });

  it("matches nothing when there are no hosts", () => {
    expect(hostInClause([])).toBe("false");
  });
});
