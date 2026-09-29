import { describe, expect, it } from "vitest";
import { EMPTY_DRAFT, firstIncompleteStep, parseStepParam, type ReportDraft, stepHref, validatePhoto } from "./draft";

const photo = { file: new File(["x"], "plate.jpg", { type: "image/jpeg" }), url: "blob:1" };
const complete: ReportDraft = {
  photo,
  plateText: "1กข 1234",
  province: "10",
  position: "front",
  location: { lat: 13.8, lng: 100.6 },
};

describe("firstIncompleteStep", () => {
  it("starts at the photo step for an empty draft", () => {
    expect(firstIncompleteStep(EMPTY_DRAFT)).toBe("photo");
  });

  it("needs a valid plate and a province choice", () => {
    expect(firstIncompleteStep({ ...complete, plateText: "abc" })).toBe("plate");
    expect(firstIncompleteStep({ ...complete, province: undefined })).toBe("plate");
  });

  it("accepts 'unknown province' (null) from finders", () => {
    expect(firstIncompleteStep({ ...complete, province: null })).toBe("review");
  });

  it("walks position then location", () => {
    expect(firstIncompleteStep({ ...complete, position: null })).toBe("position");
    expect(firstIncompleteStep({ ...complete, location: null })).toBe("location");
  });

  it("reports the earliest gap, not a later one", () => {
    expect(firstIncompleteStep({ ...complete, photo: null, location: null })).toBe("photo");
  });

  it("lands on review once everything is filled", () => {
    expect(firstIncompleteStep(complete)).toBe("review");
  });
});

describe("parseStepParam / stepHref", () => {
  it("round-trips step names through the URL", () => {
    expect(parseStepParam("location")).toBe("location");
    expect(stepHref("location")).toBe("/report?step=location");
  });

  it("uses the bare path for the first step and falls back to it for junk", () => {
    expect(stepHref("photo")).toBe("/report");
    expect(parseStepParam(null)).toBe("photo");
    expect(parseStepParam("nope")).toBe("photo");
  });
});

describe("validatePhoto", () => {
  it("accepts images", () => {
    expect(validatePhoto(new File(["x"], "a.heic", { type: "image/heic" }))).toBeNull();
  });

  it("rejects non-images and huge files", () => {
    expect(validatePhoto(new File(["x"], "a.pdf", { type: "application/pdf" }))).toBe("notImage");
    const big = new File(["x"], "big.jpg", { type: "image/jpeg" });
    Object.defineProperty(big, "size", { value: 16 * 1024 * 1024 });
    expect(validatePhoto(big)).toBe("tooLarge");
  });
});
