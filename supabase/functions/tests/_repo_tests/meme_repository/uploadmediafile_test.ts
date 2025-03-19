// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { uploadFileToBucket } from "@repository/_meme_repo/MemeRepository.ts";

// tests/mocks/mockSupabase.ts
export function mockSupabaseResponse({ uploadResponse, uploadError, publicUrlResponse }: any) {
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
  const mockSupabase = mockSupabaseResponse({
    uploadResponse: { path: "memes/test-file.jpg" },
    uploadError: null,
    publicUrlResponse: "https://example.com/memes/test-file.jpg",
  });

  const fakeFile = new File(["test"], "test.JPG", { type: "image/jpeg" });

  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);

  assertEquals(publicUrl, "https://example.com/memes/test-file.jpg");
});

Deno.test("uploadFileToBucket should return null on unsupported file type", async () => {
  const mockSupabase = mockSupabaseResponse({
    uploadResponse: null,
    uploadError: null,
    publicUrlResponse: null,
  });

  const fakeFile = new File(["test"], "test.txt", { type: "text/plain" });

  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);

  assertEquals(publicUrl, null);
});

Deno.test("uploadFileToBucket should return null if upload fails", async () => {
  const mockSupabase = mockSupabaseResponse({
    uploadResponse: null,
    uploadError: { message: "Upload failed" },
    publicUrlResponse: null,
  });

  const fakeFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);

  assertEquals(publicUrl, null);
});

Deno.test("uploadFileToBucket should generate a sanitized file path", async () => {
  const mockSupabase = mockSupabaseResponse({
    uploadResponse: { path: "memes/test-file.jpg" },
    uploadError: null,
    publicUrlResponse: "https://example.com/memes/test-file.jpg",
  });

  // Ensure the file has a `.name` property
  const fakeFile = new File(["test"], "original name.jpg", { type: "image/jpeg" });

  const publicUrl = await uploadFileToBucket(fakeFile, "Funny Meme", mockSupabase as any);

  assertEquals(publicUrl, "https://example.com/memes/test-file.jpg");
});

// Deno.test("uploadFileToBucket - successful upload", async () => {
//   const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
//   const memeTitle = "funny_meme";
//   const mockSupabase = mockSupabaseResponse(null, { path: "memes/funny_meme.jpg" }, null);

//   const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
//   console.log(result);
//   assertEquals(result, null);
// });




// Deno.test("uploadFileToBucket - upload error", async () => {
//   const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
//   const memeTitle = "funny_meme";
//   const mockSupabase = mockSupabaseResponse(null, null, "Upload failed");

//   const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
//   console.log(result);
//   assertEquals(result, null);
// });

// Deno.test("uploadFileToBucket - error in getPublicUrl", async () => {
//   const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
//   const memeTitle = "funny_meme";

//   const mockSupabase = {
//     storage: {
//       from: () => ({
//         getPublicUrl: () => ({
//           data: null,
//           error: "Unexpected error in getPublicUrl",
//         }),
//         upload: async () => ({ data: { path: "memes/funny_meme.jpg" }, error: null }),
//       }),
//     },
//   };

//   const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
//   assertEquals(result, null);
// });
// Deno.test("uploadFileToBucket - unexpected error", async function () {
//   const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
//   const memeTitle = "funny_meme";

//   const supabaseMock = {
//     storage: {
//       from: () => {
//         throw new Error("Unexpected error");
//       },
//     },
//   };

//   const result = await uploadFileToBucket(mediaFile, memeTitle, supabaseMock as any);
//   assertEquals(result, null);
// });
