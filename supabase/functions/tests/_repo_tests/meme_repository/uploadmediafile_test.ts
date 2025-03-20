// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { uploadFileToBucket } from "@repository/_meme_repo/MemeRepository.ts";

// tests/mocks/mockSupabase.ts
export function createMockSupabase({ uploadResponse, uploadError, publicUrlResponse }: any) {
  return {
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: uploadResponse, error: uploadError }),
        getPublicUrl: () => ({ data: { publicUrl: publicUrlResponse } }),
      }),
    },
  };
}

Deno.test("uploadFileToBucket should return public URL on success", async () => {
  const mockSupabase = createMockSupabase({
    uploadResponse: { path: "memes/test-file.jpg" },
    uploadError: null,
    publicUrlResponse: "https://example.com/memes/test-file.jpg",
  });

  const fakeFile = new File(["test"], "test.JPG", { type: "image/jpeg" });

  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);

  assertEquals(publicUrl, "https://example.com/memes/test-file.jpg");
});

Deno.test("uploadFileToBucket should return null on unsupported file type", async () => {
  const mockSupabase = createMockSupabase({
    uploadResponse: null,
    uploadError: null,
    publicUrlResponse: null,
  });

  const fakeFile = new File(["test"], "test.txt", { type: "text/plain" });

  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);

  assertEquals(publicUrl, null);
});

Deno.test("uploadFileToBucket should return null if upload fails", async () => {
  const fakeFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  const mockSupabase = createMockSupabase({
    uploadResponse: null,
    uploadError: { message: "Upload failed" },
  });
  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);

  assertEquals(publicUrl, null);
});


Deno.test("uploadFileToBucket - unexpected error", async function () {
  const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });

  const mockSupabase = {
    storage: {
      from: () => {
        throw new Error("Unexpected error");
      },
    },
  };

  const result = await uploadFileToBucket(mediaFile, "funny_meme", mockSupabase as any);
  assertEquals(result, null);
});
